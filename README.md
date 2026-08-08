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
| Agents       | LangGraph (StateGraph pipeline) + LangChain tools |
| LLM          | OpenRouter free models (default `openai/gpt-oss-20b:free`) or local Ollama |
| Session store| ChromaDB (persistent, hash-based embeddings) |

---

## Features

- **Citizen reports** — create a report with category, description, address, map pin, and photo.
- **AI-style review** — duplicate detection panel and AI assessment summary before submission.
- **Duplicate scan** — when a photo is uploaded, the backend scans open issues at the pinned location and flags exact-location duplicates; the review step shows a duplicate alert and community severity votes.
- **LangGraph agent pipeline** — `classify → duplicate → route → summarize` agents produce structured outputs (YOLO classification + confidence gate, location/category duplication check, department routing, and an authority summary). Every step is persisted to a ChromaDB session store; the review page shows the routed department and summary.
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
│   ├── routers.py           # API routes (auth, reports, incidents, uploads, agents)
│   ├── database.py          # SQLite schema, seeding, queries
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py              # Password hashing + JWT helpers
│   ├── config.py            # Env config (JWT secret, LLM, admin credentials)
│   ├── detection.py         # YOLO image classification
│   ├── agents/              # LangGraph agent pipeline
│   │   ├── graph.py         # StateGraph: classify → duplicate → route → summarize
│   │   ├── state.py         # Structured-output schemas + pipeline state
│   │   ├── llm.py           # Ollama factory + structured invoke (with fallback)
│   │   ├── session_store.py # ChromaDB session persistence
│   │   ├── tools.py         # LangChain tools (duplicates, departments, session)
│   │   ├── classification.py# Classification agent (YOLO + confidence gate)
│   │   ├── duplication.py   # Duplication agent (lat/lng + class + location)
│   │   ├── router.py        # Router agent (responsible department)
│   │   └── summary.py       # Summary agent (authority brief)
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

The LangGraph agent pipeline runs on **OpenRouter free models** by default (needs a free API key from [openrouter.ai](https://openrouter.ai/keys)):

```bash
# backend/.env
CIVICLENS_LLM_PROVIDER=openrouter
CIVICLENS_OPENROUTER_API_KEY=sk-or-v1-...
CIVICLENS_OPENROUTER_MODEL=openai/gpt-oss-20b:free
```

Prefer a fully local setup? Switch the provider to **Ollama** (no API key needed):

```bash
ollama pull qwen2.5:3b
```

```ini
# backend/.env
CIVICLENS_LLM_PROVIDER=ollama
CIVICLENS_OLLAMA_MODEL=qwen2.5:3b
CIVICLENS_OLLAMA_BASE_URL=http://localhost:11434
```

Set `CIVICLENS_LLM_PROVIDER=none` to disable the LLM entirely (agents use deterministic rules only). The backend falls back gracefully: OpenRouter → Ollama → rules.

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
| GET    | `/reports/duplicates` | Scan for open issues at a location (lat, lng) |
| POST   | `/reports/analyze`    | Run the agent pipeline (multipart: file/image_url, lat, lng, category, location, description) |
| GET    | `/reports/analyze/{id}`| Retrieve stored agent steps for a session  |
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
- The agent pipeline (`backend/agents/`) is a LangGraph `StateGraph`. Each node writes its structured output (Pydantic) both to the graph state and to the ChromaDB session store under `backend/chroma/`. If the LLM is unavailable or a structured call fails, every agent falls back to deterministic rules so the flow never breaks.
- Department routes are defined in `backend/agents/tools.py` (`DEPARTMENT_ROUTES`).
