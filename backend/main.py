"""CivicLens FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import auth
import database as db
import routers
from config import AUTHORITY_EMAIL, AUTHORITY_PASSWORD, AUTHORITY_USERNAME, UPLOAD_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    db.seed_data()
    db.create_user(
        AUTHORITY_EMAIL,
        role="authority",
        username=AUTHORITY_USERNAME,
        password_hash=auth.hash_password(AUTHORITY_PASSWORD),
    )
    yield


app = FastAPI(title="CivicLens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routers.router)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/api/files", StaticFiles(directory=UPLOAD_DIR), name="files")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "civiclens"}
