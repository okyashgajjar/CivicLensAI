"""Summary agent.

Generates a concise authority brief from the whole session. Reads the earlier
steps back from the Chroma session store (via the ``get_session_context`` tool)
so the summary always reflects the persisted pipeline results.
"""

import json
import logging

from agents import tools
from agents.llm import structured_invoke
from agents.session_store import get_session_store
from agents.state import PipelineState, SummaryResult

logger = logging.getLogger("civiclens.agents.summary")


def _fallback(state: PipelineState) -> SummaryResult:
    classification = state.get("classification")
    duplication = state.get("duplication")
    routing = state.get("routing")
    category = classification.label if classification is not None else state.get("category", "")
    severity = classification.severity if classification is not None else "MEDIUM"
    location = state.get("location", "") or "(unknown location)"

    key_points = [
        f"Category: {category} (severity {severity}).",
        f"Location: {location}.",
    ]
    if duplication is not None:
        key_points.append(
            f"Duplicates: {'yes' if duplication.is_duplicate else 'no'} "
            f"({len(duplication.matches)} open issue(s) nearby)."
        )
    if routing is not None:
        key_points.append(f"Routed to: {routing.department} ({routing.subdepartment or 'general'}).")

    summary = (
        f"A {category} issue (severity {severity}) was reported at {location}. "
        f"{'It matches an open issue already tracked by the city.' if duplication and duplication.is_duplicate else 'No duplicate was found.'} "
        f"Recommended routing is {routing.department if routing else 'the city intake cell'}."
    )
    recommended_action = (
        "Merge with the existing open issue to avoid duplication."
        if duplication and duplication.is_duplicate
        else f"Dispatch {routing.department if routing else 'the responsible department'} for verification."
    )
    return SummaryResult(summary=summary, key_points=key_points, recommended_action=recommended_action)


def run(state: PipelineState) -> SummaryResult:
    session_id = state["session_id"]
    context = tools.get_session_context.invoke({"session_id": session_id})
    prompt = (
        "You are writing a concise authority brief for a civic-issue review desk.\n"
        "Using ONLY the analysis below, produce a 2-3 sentence summary, 3-5 key "
        "points, and a single recommended action for an authority reviewer. "
        "Be specific (category, location, severity, department, duplicate status).\n\n"
        f"Citizen description: {state.get('description', '') or '(none)'}\n"
        f"Session analysis: {context}\n\n"
        "Respond only with the structured summary."
    )
    result = structured_invoke(SummaryResult, prompt) or _fallback(state)

    # If the model left the bullet points empty, keep the deterministic ones so
    # the authority brief always has usable key points.
    if not result.key_points:
        result.key_points = _fallback(state).key_points

    get_session_store().save_step(session_id, "summary", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    return {"summary": run(state)}
