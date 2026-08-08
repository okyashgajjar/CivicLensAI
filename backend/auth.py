"""Authentication helpers: password hashing, JWT tokens."""

import hashlib
import os
import secrets
import time

import jwt

import database as db
from config import JWT_ALGORITHM, JWT_EXPIRES_MINUTES, JWT_SECRET

_PBKDF2_ITERATIONS = 120_000


# --- Passwords --------------------------------------------------------------

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$")
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except (ValueError, AttributeError):
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return secrets.compare_digest(digest, expected)


# --- JWT --------------------------------------------------------------------

def create_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "username": user.get("username"),
        "role": user["role"],
        "exp": int(time.time()) + JWT_EXPIRES_MINUTES * 60,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


def authenticate_bearer(token: str | None) -> dict | None:
    if not token:
        return None
    token = token.strip()
    if token.startswith("Bearer "):
        token = token.removeprefix("Bearer ").strip()
    payload = decode_token(token)
    if not payload:
        return None
    user = db.get_user_by_id(int(payload["sub"]))
    if not user:
        return None
    return user
