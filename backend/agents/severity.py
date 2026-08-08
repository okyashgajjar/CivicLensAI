"""Severity agent.

Combines the image classification, duplication findings, and the issue
history at the location to decide the final severity. When the same kind of
issue is already open at the exact spot (or the area has a track record of
similar reports), the severity is escalated and an escalation percentage is
computed so the UI can show "severity increased by X%".
"""

import json
import logging

from agents import tools
from agents.session_store import get_session_store
from agents.state import PipelineState, SeverityResult

logger = logging.getLogger("civiclens.agents.severity")

_SEVERITY_NAMES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
_SEVERITY_RANK = {name: idx for idx, name in enumerate(_SEVERITY_NAMES)}


def _escalate(base: str, levels: int) -> str:
    rank = _SEVERITY_RANK.get((base or "MEDIUM").upper(), 1)
    return _SEVERITY_NAMES[min(rank + levels, len(_SEVERITY_NAMES) - 1)]


def run(state: PipelineState) -> SeverityResult:
    classification = state.get("classification")
    duplication = state.get("duplication")
    category = state.get("category", "")

    base_severity = (classification.severity if classification else "MEDIUM").upper()
    is_issue = classification.is_issue if classification else category.lower() != "road_normal"

    # Matches come from the duplication agent (already tool-grounded).
    matches = duplication.matches if duplication else []
    same_kind = [m for m in matches if tools.category_matches(category, m.category)]

    # History comes from the traffic-history tool (real DB counts).
    history_total = 0
    try:
        raw = tools.lookup_traffic_history.invoke({"lat": state["lat"], "lng": state["lng"], "category": category})
        history = json.loads(raw) if isinstance(raw, str) else {}
        history_total = int(history.get("total", 0))
    except Exception:
        logger.exception("traffic history unavailable for severity")
        history = {}

    duplicate_count = len(same_kind)
    history_count = history_total

    if not is_issue:
        result = SeverityResult(
            severity="LOW",
            base_severity="LOW",
            escalation_pct=0,
            duplicate_count=duplicate_count,
            history_count=history_count,
            reasoning="The image shows no civic issue, so the report stays at LOW severity.",
        )
        get_session_store().save_step(state["session_id"], "severity", result.model_dump())
        return result

    # Escalation: duplicates at the same spot dominate; a history of similar
    # reports adds weight; both cap at a sensible ceiling.
    dup_boost = min(40, duplicate_count * 20)
    hist_boost = min(20, history_count * 4)
    escalation_pct = min(60, 5 + dup_boost + hist_boost)

    level_bump = 1 if duplicate_count > 0 or escalation_pct >= 30 else 0
    severity = _escalate(base_severity, level_bump)

    parts = []
    if duplicate_count:
        parts.append(
            f"{duplicate_count} same-kind issue{'s' if duplicate_count > 1 else ''} already open at this location"
        )
    if history_count:
        parts.append(f"{history_count} related issue{'s' if history_count > 1 else ''} reported nearby")
    if not parts:
        parts.append("no duplicate or historical signal found at this location")
    reasoning = (
        f"Base severity {base_severity} was escalated to {severity} "
        f"(+{escalation_pct}%) because {', '.join(parts)}."
    )

    result = SeverityResult(
        severity=severity,
        base_severity=base_severity,
        escalation_pct=escalation_pct,
        duplicate_count=duplicate_count,
        history_count=history_count,
        reasoning=reasoning,
    )
    get_session_store().save_step(state["session_id"], "severity", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    return {"severity": run(state)}
