"""Pydantic request/response schemas."""

from typing import Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    identifier: str
    password: str
    phone: Optional[str] = None


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=6, max_length=128)
    phone: str = Field(min_length=8, max_length=15)


class ResetPasswordRequest(BaseModel):
    identifier: str
    phone: str = Field(min_length=8, max_length=15)
    new_password: str = Field(min_length=6, max_length=128)


class MessageResponse(BaseModel):
    success: bool
    message: str


class DetectionOut(BaseModel):
    category: str
    label: str
    confidence: float
    severity: str
    is_issue: bool


class UploadOut(BaseModel):
    url: str
    detection: Optional[DetectionOut] = None


class DuplicateMatch(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    status: str
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    source: str


class DuplicateScanOut(BaseModel):
    matches: list[DuplicateMatch]


class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    phone: Optional[str] = None
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class ReportIn(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    category: str = Field(min_length=1, max_length=60)
    description: Optional[str] = Field(default=None, max_length=2000)
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_url: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    title: str
    category: str
    description: str
    address: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    image_url: Optional[str]
    status: str
    reporter_email: str
    created_at: str
    events: list


class IncidentOut(BaseModel):
    id: int
    title: str
    category: str
    description: str
    status: str
    severity: str
    image_url: Optional[str]
    lat: float
    lng: float
    updated_at: str


class IncidentStatusUpdate(BaseModel):
    status: str


class QueueItemOut(BaseModel):
    """A normalized authority-queue entry (incident or citizen report)."""

    id: str
    source: str
    title: str
    category: str
    description: str = ""
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_url: Optional[str] = None
    severity: str = "MEDIUM"
    status: str
    reporter_email: Optional[str] = None
    created_at: str


class AgentClassificationOut(BaseModel):
    category: str
    label: str
    confidence: Optional[float] = None
    severity: str
    is_issue: bool
    confidence_good: bool
    reasoning: str


class AgentDuplicateMatchOut(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    status: str
    source: str
    address: Optional[str] = None
    distance_m: Optional[float] = None


class AgentDuplicationOut(BaseModel):
    is_duplicate: bool
    matches: list[AgentDuplicateMatchOut] = []
    reasoning: str = ""


class AgentRoutingOut(BaseModel):
    department: str
    subdepartment: Optional[str] = None
    priority: str
    reasoning: str = ""


class AgentSummaryOut(BaseModel):
    summary: str
    key_points: list[str] = []
    recommended_action: str = ""


class AnalyzeAccepted(BaseModel):
    """Immediate response after queuing the agent pipeline (runs in background)."""

    session_id: str
    status: str = "running"
    image_url: Optional[str] = None


class AnalyzeOut(BaseModel):
    session_id: str
    image_url: Optional[str] = None
    classification: AgentClassificationOut
    duplication: AgentDuplicationOut
    routing: AgentRoutingOut
    summary: AgentSummaryOut
    errors: list[str] = []


class SessionStepOut(BaseModel):
    step: str
    payload: dict


class AgentSessionOut(BaseModel):
    session_id: str
    status: str = "unknown"
    steps: list[SessionStepOut]


class ApiError(BaseModel):
    detail: str
