"""SQLite persistence layer for CivicLens."""

import json
import sqlite3
import uuid
from datetime import datetime, timezone

from config import DB_PATH

SEED_INCIDENT_IMAGES = {
    "roads": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/"
        "Potholes_-_Markfield_Road_N15.jpg/960px-Potholes_-_Markfield_Road_N15.jpg"
    ),
    "lighting": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/"
        "Night%2C_Street%2C_Lamp..._%284267111310%29.jpg/960px-Night%2C_Street%2C_Lamp..._%284267111310%29.jpg"
    ),
    "sanitation": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/"
        "India_-_Bombay_-_31_-_garbage_dump_%282799575380%29.jpg/960px-India_-_Bombay_-_31_-_garbage_dump_%282799575380%29.jpg"
    ),
    "traffic": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/"
        "Street_intersection%2C_traffic_lights_in_Batman.jpg/960px-Street_intersection%2C_traffic_lights_in_Batman.jpg"
    ),
    "drainage": (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/"
        "Flooded_road_after_heavy_rain.jpg/960px-Flooded_road_after_heavy_rain.jpg"
    ),
}

SEED_INCIDENTS = [
    {
        "title": "Deep pothole near Ashram Road",
        "category": "Roads",
        "description": "Deep pothole on Ashram Road near Usmanpura, causing traffic to swerve and risking vehicle damage.",
        "status": "Open",
        "severity": "CRITICAL",
        "lat": 23.033,
        "lng": 72.557,
    },
    {
        "title": "Broken streetlight at Maninagar",
        "category": "Lighting",
        "description": "Streetlight out near Krishna Bridge in Maninagar for several nights, dark stretch on a busy pedestrian street.",
        "status": "In Progress",
        "severity": "MEDIUM",
        "lat": 22.9945,
        "lng": 72.6017,
    },
    {
        "title": "Illegal garbage dumping in Bapunagar",
        "category": "Sanitation",
        "description": "Construction debris and household waste dumped behind the Odhav Industrial Estate, needs municipal cleanup.",
        "status": "Open",
        "severity": "MEDIUM",
        "lat": 23.0416,
        "lng": 72.6213,
    },
    {
        "title": "Damaged traffic signal on SG Highway",
        "category": "Traffic",
        "description": "Pedestrian signal not activating at the SG Highway and Satellite intersection, risk to crossing pedestrians.",
        "status": "In Progress",
        "severity": "MEDIUM",
        "lat": 23.0285,
        "lng": 72.5405,
    },
    {
        "title": "Waterlogging under Sabarmati riverfront bridge",
        "category": "Drainage",
        "description": "Water pooling under the Sabarmati riverfront bridge after rain, entering the roadway and blocking cyclists.",
        "status": "Open",
        "severity": "LOW",
        "lat": 23.0546,
        "lng": 72.5859,
    },
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE,
                role TEXT NOT NULL DEFAULT 'citizen',
                password_hash TEXT,
                phone TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                address TEXT,
                lat REAL,
                lng REAL,
                image_url TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                reporter_email TEXT NOT NULL,
                created_at TEXT NOT NULL,
                events TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL,
                severity TEXT NOT NULL DEFAULT 'MEDIUM',
                image_url TEXT,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_reports_email ON reports(reporter_email);
            CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
            """
        )

        # Migration for databases created before the phone column existed.
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)")}
        if "phone" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN phone TEXT")

        # Migration for incidents created before severity existed.
        incident_columns = {row["name"] for row in conn.execute("PRAGMA table_info(incidents)")}
        if "severity" not in incident_columns:
            conn.execute("ALTER TABLE incidents ADD COLUMN severity TEXT NOT NULL DEFAULT 'MEDIUM'")
        if "image_url" not in incident_columns:
            conn.execute("ALTER TABLE incidents ADD COLUMN image_url TEXT")

        # Created after the migration above so existing databases work too.
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone)")


def seed_data() -> None:
    with get_connection() as conn:
        # Demo incidents are refreshed on every startup so the map always shows
        # the current seed set (recently switched to Ahmedabad area).
        conn.execute("DELETE FROM incidents")
        for inc in SEED_INCIDENTS:
            image_url = inc.get("image_url") or SEED_INCIDENT_IMAGES.get(inc["category"].lower())
            conn.execute(
                """
                INSERT INTO incidents (title, category, description, status, severity, image_url, lat, lng, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    inc["title"],
                    inc["category"],
                    inc["description"],
                    inc["status"],
                    inc["severity"],
                    image_url,
                    inc["lat"],
                    inc["lng"],
                    _now(),
                ),
            )


def create_user(email: str, role: str = "citizen", username: str | None = None, password_hash: str | None = None) -> dict:
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO users (email, username, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (email, username, role, password_hash, _now()),
        )
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        return dict(row)


def get_user_by_email(email: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
        return dict(row) if row else None


def get_user_by_username(username: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username.lower(),)).fetchone()
        return dict(row) if row else None


def get_user_by_phone(phone: str) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE phone = ?", (phone,)).fetchone()
        return dict(row) if row else None


def register_citizen(username: str, password_hash: str, phone: str) -> dict | None:
    """Create a citizen account. Returns the user row, or None if the username
    or phone number is already registered."""
    with get_connection() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (email, username, role, password_hash, phone, created_at) "
                "VALUES (?, ?, 'citizen', ?, ?, ?)",
                (f"{username}@civiclens.local", username, password_hash, phone, _now()),
            )
        except sqlite3.IntegrityError:
            return None
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)


def get_user_by_id(user_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None


def update_user_password(user_id: int, password_hash: str) -> None:
    with get_connection() as conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (password_hash, user_id))


def create_report(data: dict, reporter_email: str) -> dict:
    report_id = uuid.uuid4().hex
    now = _now()
    events = json.dumps([{"status": "pending", "timestamp": now}])
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO reports (id, title, category, description, address, lat, lng, image_url, status, reporter_email, created_at, events)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
            """,
            (
                report_id,
                data["title"],
                data["category"],
                data["description"],
                data.get("address"),
                data.get("lat"),
                data.get("lng"),
                data.get("image_url"),
                reporter_email,
                now,
                events,
            ),
        )
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
        return dict(row)


def list_reports(reporter_email: str | None = None) -> list[dict]:
    with get_connection() as conn:
        if reporter_email:
            rows = conn.execute(
                "SELECT * FROM reports WHERE reporter_email = ? ORDER BY created_at DESC",
                (reporter_email,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


def list_incidents() -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM incidents ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]


def update_incident_status(incident_id: int, status: str) -> dict | None:
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?",
            (status, _now(), incident_id),
        )
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        return dict(row) if row else None
