"""Router agent.

Selects the responsible municipal department based on the issue category and
location. Uses the ``lookup_department`` tool for grounded candidates and the
LLM for the final structured decision.
"""

import json
import logging

from agents import tools
from agents.llm import structured_invoke
from agents.session_store import get_session_store
from agents.state import PipelineState, RouterResult

logger = logging.getLogger("civiclens.agents.router")


def _fallback(state: PipelineState) -> RouterResult:
    raw = tools.lookup_department.invoke(
        {"category": state.get("category", ""), "location": state.get("location", "")}
    )
    try:
        candidate = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        candidate = {"department": "Customer Relations Cell (AMC)", "subdepartment": "General Intake", "priority": "MEDIUM"}
    return RouterResult(
        department=candidate["department"],
        subdepartment=candidate["subdepartment"],
        priority=candidate["priority"],
        reasoning=f"Routed by category '{state.get('category', '')}' to the mapped department.",
    )


def run(state: PipelineState) -> RouterResult:
    category = state.get("category", "")
    location = state.get("location", "")
    severity = ""
    classification = state.get("classification")
    if classification is not None:
        severity = classification.severity
    candidate = tools.lookup_department.invoke(
        {"category": category, "location": location}
    )

    prompt = (
        "You are a triage router for Ahmedabad Municipal Corporation (AMC).\n"
        "Based on the issue details below, choose the responsible department, the "
        "specific team (subdepartment), and a priority of LOW, MEDIUM, or CRITICAL.\n\n"
        f"Reported category/class: {category}\n"
        f"Reported location: {location}\n"
        f"AI-detected severity: {severity or 'unknown'}\n"
        f"Citizen description: {state.get('description', '') or '(none)'}\n"
        f"Candidate department from the registry: {candidate}\n\n"
        "Keep the department and subdepartment aligned with the registry when it fits; "
        "adjust priority using severity and citizen description. Respond only with the "
        "structured decision."
    )
    result = structured_invoke(RouterResult, prompt) or _fallback(state)

    get_session_store().save_step(state["session_id"], "routing", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    return {"routing": run(state)}
