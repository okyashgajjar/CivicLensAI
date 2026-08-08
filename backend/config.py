"""Application configuration for the CivicLens backend."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DB_PATH = BASE_DIR / "civiclens.db"
MODEL_PATH = BASE_DIR.parent / "YOLOModel" / "best.pt"

load_dotenv(BASE_DIR / ".env")

# JWT settings
JWT_SECRET = os.environ.get("CIVICLENS_JWT_SECRET", "dev-secret-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60 * 24  # 24 hours

# Authority demo credentials
AUTHORITY_USERNAME = "admin"
AUTHORITY_PASSWORD = "civic2026"
AUTHORITY_EMAIL = "admin@civiclens.dev"
