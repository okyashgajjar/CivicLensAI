"""API routes for CivicLens."""

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import auth
import database as db
import schemas
from config import AUTHORITY_PASSWORD, UPLOAD_DIR
from detection import detect_image

router = APIRouter(prefix="/api")
bearer_scheme = HTTPBearer(auto_error=False)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    user = auth.authenticate_bearer(credentials.credentials if credentials else None)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def _public_user(user: dict) -> schemas.UserOut:
    return schemas.UserOut(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        username=user.get("username"),
        phone=user.get("phone"),
    )


def _normalize_phone(raw: str) -> str:
    return "".join(ch for ch in raw if ch.isdigit())


# --- Auth -------------------------------------------------------------------


@router.post("/auth/login", response_model=schemas.AuthResponse)
def login(req: schemas.LoginRequest):
    identifier = req.identifier.strip().lower()
    user = db.get_user_by_username(identifier) or db.get_user_by_email(identifier)
    if not user or not user.get("password_hash"):
        # Consistent error (and similar timing) whether or not the account exists.
        user = {"role": "authority", "password_hash": auth.hash_password(AUTHORITY_PASSWORD)}
    if user["role"] not in ("citizen", "authority") or not auth.verify_password(
        req.password, user["password_hash"]
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user["role"] == "citizen":
        stored_phone = user.get("phone")
        if not stored_phone or stored_phone != _normalize_phone(req.phone or ""):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    return schemas.AuthResponse(token=auth.create_token(user), user=_public_user(user))


@router.post("/auth/register", response_model=schemas.AuthResponse)
def register(req: schemas.RegisterRequest):
    username = req.username.strip().lower()
    if not username.replace("_", "").isalnum():
        raise HTTPException(
            status_code=400,
            detail="User ID may only contain letters, numbers and underscores",
        )
    phone = _normalize_phone(req.phone)
    if len(phone) < 8 or len(phone) > 15:
        raise HTTPException(status_code=400, detail="Enter a valid phone number")
    if db.get_user_by_username(username):
        raise HTTPException(status_code=409, detail="That user ID is already taken")
    if db.get_user_by_phone(phone):
        raise HTTPException(status_code=409, detail="That phone number is already registered")
    user = db.register_citizen(username, auth.hash_password(req.password), phone)
    if not user:
        raise HTTPException(status_code=409, detail="That user ID or phone is already registered")
    return schemas.AuthResponse(token=auth.create_token(user), user=_public_user(user))


@router.post("/auth/reset-password", response_model=schemas.MessageResponse)
def reset_password(req: schemas.ResetPasswordRequest):
    identifier = req.identifier.strip().lower()
    phone = _normalize_phone(req.phone)
    user = db.get_user_by_username(identifier)
    if not user or user["role"] != "citizen" or not user.get("phone") or user["phone"] != phone:
        raise HTTPException(
            status_code=400,
            detail="We could not verify that user ID and phone number",
        )
    db.update_user_password(user["id"], auth.hash_password(req.new_password))
    return schemas.MessageResponse(success=True, message="Password updated. You can now sign in.")


@router.get("/auth/me", response_model=schemas.UserOut)
def me(user: dict = Depends(current_user)):
    return _public_user(user)


# --- Uploads ----------------------------------------------------------------


@router.post("/upload", response_model=schemas.UploadOut)
async def upload_image(file: UploadFile, user: dict = Depends(current_user)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP and GIF images are allowed")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "img"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        ext = "img"
    name = f"{uuid.uuid4().hex}.{ext}"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIR / name).write_bytes(data)
    detection = detect_image(data)
    return schemas.UploadOut(url=f"/api/files/{name}", detection=detection)


# --- Reports ----------------------------------------------------------------


@router.post("/reports", response_model=schemas.ReportOut)
def create_report(req: schemas.ReportIn, user: dict = Depends(current_user)):
    if user["role"] == "authority":
        raise HTTPException(status_code=403, detail="Authorities cannot submit citizen reports")
    row = db.create_report(req.model_dump(), user["email"])
    return _report_out(row)


@router.get("/reports", response_model=list[schemas.ReportOut])
def list_reports(user: dict = Depends(current_user)):
    rows = db.list_reports(None if user["role"] == "authority" else user["email"])
    return [_report_out(r) for r in rows]


# --- Incidents --------------------------------------------------------------


@router.get("/incidents", response_model=list[schemas.IncidentOut])
def list_incidents():
    return db.list_incidents()


@router.patch("/incidents/{incident_id}", response_model=schemas.IncidentOut)
def update_incident_status(incident_id: int, payload: schemas.IncidentStatusUpdate):
    row = db.update_incident_status(incident_id, payload.status)
    if row is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return row


def _report_out(row: dict) -> schemas.ReportOut:
    try:
        events = json.loads(row["events"]) if row.get("events") else []
    except (TypeError, json.JSONDecodeError):
        events = []
    return schemas.ReportOut(
        id=row["id"],
        title=row["title"],
        category=row["category"],
        description=row["description"],
        address=row["address"],
        lat=row["lat"],
        lng=row["lng"],
        image_url=row["image_url"],
        status=row["status"],
        reporter_email=row["reporter_email"],
        created_at=row["created_at"],
        events=events,
    )
