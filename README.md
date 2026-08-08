# CivicLens

A civic issue-reporting web app that lets citizens report street problems (potholes, broken streetlights, illegal dumping, waterlogging, etc.) and lets municipal authorities review, assign, and track fixes on a live map and dispatch queue.

The demo is seeded with real-world incidents across **Ahmedabad, Gujarat (India)** — map, report form, and queue all default to that city.

---

## Tech Stack

### Frontend

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | React 19 + TypeScript                   |
| Build tool   | Vite 8                                  |
| Routing      | React Router 7 (HashRouter)             |
| Styling      | Tailwind CSS 4 (design tokens + utilities) |
| Maps         | Leaflet (interactive incident + location maps) |
| Reverse geocoding | Nominatim (OpenStreetMap)          |
| Map tiles    | CARTO Positron (light) via `src/constants/map.ts` |
| State        | React Context + a small `useSyncExternalStore` store for live incidents |

### Backend

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | FastAPI (Python)                        |
| Server       | Uvicorn                                 |
| Database     | SQLite (via `sqlite3`, WAL mode)        |
| Auth         | JWT (PyJWT, HS256), HTTP Bearer         |
| Validation   | Pydantic                                |
| File uploads | `python-multipart`, served from `/api/files` |

---

## Features

- **Citizen reports** — create a report with category, description, address, map pin, and photo.
- **AI-style review** — duplicate detection panel and AI assessment summary before submission.
- **Live incident map** — seeded incidents shown as pins; map auto-fits to the incident bounds.
- **Authority dispatch queue** — Pending / Assigned / Resolved tabs driven by live backend data; Assign, Mark Resolved, and Reopen actions persist to the backend and update the map immediately.
- **My Reports** — track status and timeline of your submitted reports.
- **Notifications** — in-app notifications on key events.
- **Roles** — Citizen and Authority accounts with route protection.

---

## Project Structure

```
civic/
├── backend/                 # FastAPI application
│   ├── main.py              # App entrypoint, lifespan (init + seed)
│   ├── routers.py           # API routes (auth, reports, incidents, uploads)
│   ├── database.py          # SQLite schema, seeding, queries
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py              # Password hashing + JWT helpers
│   ├── config.py            # Env config (JWT secret, admin credentials)
│   ├── requirements.txt
│   └── .env.example
└── src/                     # React frontend
    ├── api/                 # API client + geocoding
    ├── components/          # UI components (home, report, dashboard, auth, …)
    ├── constants/           # Navigation + map tile config
    ├── context/             # Auth, Reports, Notifications providers
    ├── data/                # Static mock data + design assets
    ├── hooks/               # useReportForm, useIncidents, useDuplicateScan
    ├── pages/               # Home, Report, Review, Dashboard, Login, Profile, …
    └── App.tsx              # Routes
```

---

## Prerequisites

- **Node.js 18+** (and npm)
- **Python 3.10+**
- Internet access for map tiles (CARTO), Nominatim, and Wikimedia seed images

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

Optional: copy `.env.example` to `.env` and set a JWT secret.

Run the API (defaults to `http://127.0.0.1:8000`):

```bash
python -m uvicorn main:app --port 8000 --host 127.0.0.1
```

On startup the backend initializes the SQLite DB, re-seeds the demo incidents, and creates the demo authority account.

### 2. Frontend

From the project root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (Vite proxies `/api` to the backend on port 8000).

---

## Demo Accounts

| Role      | User ID / Identifier | Password    |
| --------- | -------------------- | ----------- |
| Authority | `admin`              | `civic2026` |
| Citizen   | Create one at sign-in | any password (≥ 6 chars) |

Citizen accounts are created through the app's registration form (choose a user ID, password, and phone number).

---

## Scripts

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Start the Vite dev server          |
| `npm run build`         | Type-check and build for production |
| `npm run preview`       | Preview the production build       |
| `npm run typecheck`     | Run `tsc --noEmit`                 |
| `npm run validate`      | Run the custom validation script   |

---

## API Overview

Base URL: `http://127.0.0.1:8000/api`

| Method | Endpoint              | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/health`             | Service health check                     |
| POST   | `/auth/register`      | Create a citizen account (returns JWT)   |
| POST   | `/auth/login`         | Sign in (returns JWT)                    |
| GET    | `/auth/me`            | Current user from bearer token           |
| POST   | `/auth/reset-password`| Reset a citizen password                 |
| POST   | `/reports`            | Create a report (auth required)          |
| GET    | `/reports`            | List reports (citizen: own; authority: all) |
| GET    | `/incidents`          | List live incidents (used by map + queue)|
| PATCH  | `/incidents/{id}`     | Update an incident's status              |
| POST   | `/upload`             | Upload an image, returns a public URL    |

---

## Demo Data

- **Incidents** are re-seeded on every backend start (table is cleared and refilled), so the map and queue always match the current seed set. Each seed maps to a representative photo from Wikimedia Commons and a severity (`CRITICAL` / `MEDIUM` / `LOW`).
- **Status flow:** `Open` → Pending, `In Progress` → Assigned, `Resolved` → Resolved.

---

## Notes

- Seed data lives in `backend/database.py`; edit `SEED_INCIDENTS` / `SEED_INCIDENT_IMAGES` there.
- Map tile provider is centralized in `src/constants/map.ts` (used by both the dashboard map and the report location picker).
- `REPORT` images and uploads are stored under `backend/uploads/`.
