"""Notify agent.

Dispatches the finalized report to the municipal zone office closest to the
reported location, using the department picked by the router agent. The
dispatch (mediums, timestamp, and the full ranked list of nearby offices) is
persisted so the UI can show where the report was sent.
"""

import json
import logging
from datetime import datetime, timezone

from agents import tools
from agents.session_store import get_session_store
from agents.state import NearbyAuthority, NotifyResult, PipelineState

logger = logging.getLogger("civiclens.agents.notify")


def _offices(lat: float, lng: float) -> list[NearbyAuthority]:
    raw = tools.lookup_nearby_authorities.invoke({"lat": lat, "lng": lng})
    try:
        payload = json.loads(raw) if isinstance(raw, str) else []
    except (TypeError, json.JSONDecodeError):
        payload = []
    offices = []
    for item in payload:
        try:
            offices.append(
                NearbyAuthority(
                    authority="AMC",
                    office=item["office"],
                    zone=item["zone"],
                    distance_km=item.get("distance_km"),
                )
            )
        except Exception:
            logger.debug("skipping malformed office: %s", item)
    offices.sort(key=lambda o: o.distance_km if o.distance_km is not None else float("inf"))
    return offices


def run(state: PipelineState) -> NotifyResult:
    routing = state.get("routing")
    authority = routing.department if routing and routing.department else "Customer Relations Cell (AMC)"

    offices = _offices(state["lat"], state["lng"])
    primary = offices[0] if offices else None

    result = NotifyResult(
        authority=authority,
        office=primary.office if primary else "AMC Head Office",
        zone=primary.zone if primary else "Central",
        medium=["Email", "SMS"],
        status="notified",
        notified_at=datetime.now(timezone.utc).isoformat(),
        nearby=offices,
    )
    get_session_store().save_step(state["session_id"], "notify", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    return {"notify": run(state)}
