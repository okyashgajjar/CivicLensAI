"""Duplication agent.

Checks whether the report matches an open issue at the same latitude/longitude
and of the same kind (class). Uses the ``lookup_duplicate_issues`` tool for
grounded candidates and the LLM for the final structured verdict.
"""

import json
import logging

import config
from agents import tools
from agents.llm import structured_invoke
from agents.session_store import get_session_store
from agents.state import DuplicateMatch, DuplicationResult, DuplicationVerdict, PipelineState

logger = logging.getLogger("civiclens.agents.duplication")


def _candidates(state: PipelineState) -> list[DuplicateMatch]:
    raw = tools.lookup_duplicate_issues.invoke(
        {"lat": state["lat"], "lng": state["lng"], "category": state.get("category", "")}
    )
    try:
        payload = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return []
    matches = []
    for item in payload:
        try:
            matches.append(DuplicateMatch(**item))
        except Exception:
            logger.debug("skipping malformed duplicate match: %s", item)
    # Closest first.
    matches.sort(key=lambda m: (m.distance_m if m.distance_m is not None else float("inf")))
    return matches


def _fallback(matches: list[DuplicateMatch], state: PipelineState) -> DuplicationVerdict:
    same_kind = [m for m in matches if tools.category_matches(state.get("category", ""), m.category)]
    if state.get("category", "").lower() == "road_normal":
        return DuplicationVerdict(is_duplicate=False, reasoning="Image shows no civic issue, so no duplication applies.")
    if same_kind:
        top = same_kind[0]
        return DuplicationVerdict(
            is_duplicate=True,
            reasoning=f"A '{top.category}' issue already exists at this location ({top.title}).",
        )
    if matches:
        return DuplicationVerdict(
            is_duplicate=False,
            reasoning=f"Open issues exist nearby but none match the '{state.get('category', '')}' class.",
        )
    return DuplicationVerdict(is_duplicate=False, reasoning="No open issue found at this location.")


def run(state: PipelineState) -> DuplicationResult:
    matches = _candidates(state)

    location = state.get("location", "")
    description = state.get("description", "")
    prompt = (
        "You are a duplicate-detection officer for a civic issue platform.\n"
        "A citizen reported the following issue and the system found open issues nearby.\n\n"
        f"Reported category: {state.get('category', '')}\n"
        f"Reported location: {location}\n"
        f"Reported description: {description or '(none)'}\n"
        f"Open issues found nearby: {json.dumps([m.model_dump() for m in matches], ensure_ascii=False)}\n\n"
        "Decide whether the report is a duplicate of an existing issue. A duplicate requires "
        "the SAME kind of issue (category class) at essentially the same location. Same-kind "
        "open issues nearby are strong evidence; nearby issues of a different kind are not. "
        "Respond only with the structured verdict."
    )
    verdict = structured_invoke(DuplicationVerdict, prompt) or _fallback(matches, state)

    result = DuplicationResult(
        is_duplicate=verdict.is_duplicate,
        matches=matches,
        reasoning=verdict.reasoning,
    )
    get_session_store().save_step(state["session_id"], "duplication", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    return {"duplication": run(state)}
