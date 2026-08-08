"""Tools exposed to the CivicLens agent pipeline.

These are real LangChain ``@tool`` functions. Agent nodes call them to gather
grounded context (open issues at a location, candidate departments, earlier
session steps) and pass the results into the LLM for structured reasoning.
"""

import json
import logging

from langchain_core.tools import tool

import database as db
from agents.session_store import get_session_store

logger = logging.getLogger("civiclens.agents.tools")

# Canonical category -> (department, subdepartment, default priority).
# Keys cover YOLO classes, frontend category ids, and DB incident categories.
DEPARTMENT_ROUTES: dict[str, tuple[str, str, str]] = {
    "pothole": ("Roads & Engineering Department (AMC)", "Road Repairs Cell", "HIGH"),
    "road": ("Roads & Engineering Department (AMC)", "Road Repairs Cell", "HIGH"),
    "roads": ("Roads & Engineering Department (AMC)", "Road Repairs Cell", "HIGH"),
    "traffic": ("Traffic Engineering (AMC)", "Traffic Signals & Signage", "MEDIUM"),
    "garbage": ("Solid Waste Management (AMC)", "Street Sweeping & Dumping", "LOW"),
    "dumping": ("Solid Waste Management (AMC)", "Street Sweeping & Dumping", "LOW"),
    "sanitation": ("Solid Waste Management (AMC)", "Street Sweeping & Dumping", "LOW"),
    "open_manhole": ("Sewerage & Drainage (AMC)", "Manhole Maintenance", "CRITICAL"),
    "manhole": ("Sewerage & Drainage (AMC)", "Manhole Maintenance", "CRITICAL"),
    "drainage": ("Storm Water Drainage (AMC)", "Drainage Clearance", "CRITICAL"),
    "waterlogging": ("Storm Water Drainage (AMC)", "Drainage Clearance", "CRITICAL"),
    "flooding": ("Storm Water Drainage (AMC)", "Drainage Clearance", "CRITICAL"),
    "lighting": ("Electrical Department (AMC)", "Street Light Maintenance", "MEDIUM"),
    "streetlight": ("Electrical Department (AMC)", "Street Light Maintenance", "MEDIUM"),
    "graffiti": ("Public Works Department (AMC)", "Public Art & Facade", "LOW"),
    "water": ("Water Works Department (AMC)", "Pipeline Repairs", "HIGH"),
    "road_normal": ("Roads & Engineering Department (AMC)", "Inspection Only", "LOW"),
}

# YOLO class -> canonical key
CLASS_ALIASES = {
    "pothole": "pothole",
    "garbage": "garbage",
    "open_manhole": "open_manhole",
    "waterlogging": "waterlogging",
    "road_normal": "road_normal",
}


def normalize_category(category: str | None) -> str | None:
    """Map any category spelling to a canonical route key."""
    if not category:
        return None
    key = category.strip().lower()
    if key in CLASS_ALIASES:
        return CLASS_ALIASES[key]
    if key in DEPARTMENT_ROUTES:
        return key
    # fuzzy: first word match
    for route_key in DEPARTMENT_ROUTES:
        if route_key in key or key in route_key:
            return route_key
    return None


def category_matches(a: str | None, b: str | None) -> bool:
    """True when two category strings refer to the same kind of issue."""
    if not a or not b:
        return False
    return normalize_category(a) == normalize_category(b)


@tool
def lookup_duplicate_issues(lat: float, lng: float, category: str) -> str:
    """Find open civic issues at the exact same location.

    Returns JSON with the closest open issues (within ~50m) and their distance
    from the reported coordinate, used to decide whether a report is a
    duplicate of an existing issue.
    """
    try:
        matches = db.find_duplicate_issues(lat, lng)
    except Exception:
        logger.exception("duplicate lookup failed")
        return "[]"
    enriched = []
    for match in matches:
        distance = None
        if match.get("lat") is not None and match.get("lng") is not None:
            distance = round(db.haversine_distance_m(lat, lng, match["lat"], match["lng"]), 1)
        enriched.append(
            {
                "id": match["id"],
                "title": match["title"],
                "category": match["category"],
                "severity": match["severity"],
                "status": match["status"],
                "source": match.get("source", "incident"),
                "address": match.get("address"),
                "distance_m": distance,
                "same_kind": category_matches(category, match.get("category")),
            }
        )
    return json.dumps(enriched, ensure_ascii=False)


@tool
def lookup_department(category: str, location: str) -> str:
    """Look up the municipal department responsible for a category of issue.

    Returns JSON describing the department, the specific team, and a default
    priority based on the type of issue and the location.
    """
    route = DEPARTMENT_ROUTES.get(normalize_category(category) or "")
    if not route:
        return json.dumps(
            {
                "department": "Customer Relations Cell (AMC)",
                "subdepartment": "General Intake",
                "priority": "MEDIUM",
            }
        )
    department, subdepartment, priority = route
    return json.dumps(
        {
            "department": department,
            "subdepartment": subdepartment,
            "priority": priority,
            "location": location,
        }
    )


@tool
def get_session_context(session_id: str) -> str:
    """Read previously completed analysis steps for a report session.

    Returns the classification, duplication, and routing results already stored
    for this session so downstream agents stay consistent.
    """
    store = get_session_store()
    steps = store.load_session(session_id)
    if not steps:
        return "[]"
    return json.dumps([{"step": item["step"], "data": item["payload"]} for item in steps], ensure_ascii=False)
