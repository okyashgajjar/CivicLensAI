"""Application configuration for the CivicLens backend."""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DB_PATH = BASE_DIR / "civiclens.db"
MODEL_PATH = BASE_DIR.parent / "YOLOModel" / "best.pt"
CHROMA_DIR = BASE_DIR / "chroma"

load_dotenv(BASE_DIR / ".env")

# JWT settings
JWT_SECRET = os.environ.get("CIVICLENS_JWT_SECRET", "dev-secret-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = 60 * 24  # 24 hours

# Authority demo credentials
AUTHORITY_USERNAME = "admin"
AUTHORITY_PASSWORD = "civic2026"
AUTHORITY_EMAIL = "admin@civiclens.dev"

# Agent pipeline (LangGraph) settings
# Provider options: "openrouter" (free models, requires an API key), "ollama" (local), or "none".
LLM_PROVIDER = os.environ.get("CIVICLENS_LLM_PROVIDER", "openrouter")
OPENROUTER_API_KEY = os.environ.get("CIVICLENS_OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.environ.get(
    "CIVICLENS_OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
)
OPENROUTER_MODEL = os.environ.get("CIVICLENS_OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
OLLAMA_BASE_URL = os.environ.get("CIVICLENS_OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("CIVICLENS_OLLAMA_MODEL", "qwen2.5:3b")
# Above this YOLO confidence the classification is treated as reliable.
CLASSIFICATION_CONFIDENCE_THRESHOLD = float(
    os.environ.get("CIVICLENS_CONFIDENCE_THRESHOLD", "0.60")
)
