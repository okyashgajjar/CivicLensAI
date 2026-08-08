"""Structured-output schemas and pipeline state for the CivicLens agent graph.

Every agent in the LangGraph pipeline produces a Pydantic model (structured
output) so downstream steps and the API layer always consume validated data.
"""

from typing import TypedDict

from pydantic import BaseModel, Field


class ClassificationResult(BaseModel):
    """Output of the classification agent (YOLO + confidence gate)."""

    category: str = Field(description="YOLO class, e.g. 'pothole'")
    label: str = Field(description="Human-readable label, e.g. 'Pothole'")
    confidence: float | None = Field(description="YOLO top-1 confidence, 0..1")
    severity: str = Field(description="LOW, MEDIUM, or CRITICAL")
    is_issue: bool = Field(description="True when the image is a real civic issue")
    confidence_good: bool = Field(description="True when the detection confidence is reliable")
    reasoning: str = Field(description="Why the agent classified it this way")


class DuplicateMatch(BaseModel):
    """A candidate open issue found at (or near) the reported location."""

    id: str
    title: str
    category: str
    severity: str
    status: str
    source: str
    address: str | None = None
    distance_m: float | None = None


class DuplicationVerdict(BaseModel):
    """LLM-structured verdict about whether a report is a duplicate."""

    is_duplicate: bool = Field(description="True when the report matches an open issue")
    reasoning: str = Field(description="Concise reasoning comparing class, location, and description")


class DuplicationResult(BaseModel):
    """Output of the duplication agent."""

    is_duplicate: bool
    matches: list[DuplicateMatch] = []
    reasoning: str = ""


class RouterResult(BaseModel):
    """Output of the router agent (department selection)."""

    department: str = Field(description="Responsible municipal department")
    subdepartment: str | None = Field(default=None, description="Specific team within the department")
    priority: str = Field(description="LOW, MEDIUM, or CRITICAL")
    reasoning: str = Field(description="Why this department and priority were chosen")


class SummaryResult(BaseModel):
    """Output of the summary agent (authority brief)."""

    summary: str = Field(description="2-3 sentence concise summary for an authority reviewer")
    key_points: list[str] = Field(default_factory=list, description="3-5 bullet points")
    recommended_action: str = Field(description="Single recommended next action")


class PipelineState(TypedDict, total=False):
    """Shared state threaded through the LangGraph pipeline."""

    session_id: str
    lat: float
    lng: float
    location: str
    category: str
    description: str
    image_url: str | None
    image_bytes: bytes | None
    classification: ClassificationResult
    duplication: DuplicationResult
    routing: RouterResult
    summary: SummaryResult
    errors: list[str]
