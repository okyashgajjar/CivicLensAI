"""ChromaDB-backed session store for the agent pipeline.

Every step of the LangGraph pipeline is persisted to a persistent Chroma
collection keyed by ``session_id``. Downstream agents (e.g. the summary agent)
re-read earlier steps from this store instead of trusting only the in-memory
graph state, so re-runs and concurrent sessions cannot mix results up.

A deterministic hash-based embedding function is used so no external embedding
model or network download is required.
"""

import hashlib
import json
import threading

from chromadb import PersistentClient
from chromadb.api.models.Collection import Collection

from config import CHROMA_DIR

_EMBED_DIM = 256
_STATUS_STEP = "__status__"
_session_store: "SessionStore | None" = None
_store_lock = threading.Lock()


def _embed(text: str) -> list[float]:
    """Deterministic bag-of-hashes embedding (no external model required)."""
    vector = [0.0] * _EMBED_DIM
    for token in text.lower().split():
        digest = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
        vector[digest % _EMBED_DIM] += 1.0
    norm = sum(value * value for value in vector) ** 0.5
    if norm > 0:
        vector = [value / norm for value in vector]
    return vector


class SessionStore:
    """Persistent per-session storage of agent step outputs."""

    def __init__(self, persist_dir) -> None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        self._client = PersistentClient(path=str(CHROMA_DIR))
        self._collection = self._client.get_or_create_collection(
            name="civiclens_sessions",
            metadata={"hnsw:space": "cosine"},
        )
        self._lock = threading.Lock()

    def _doc_id(self, session_id: str, step: str) -> str:
        return f"{session_id}:{step}"

    def save_step(self, session_id: str, step: str, payload: dict) -> None:
        """Upsert one structured step output for a session."""
        doc_id = self._doc_id(session_id, step)
        text = json.dumps(payload, ensure_ascii=False)
        metadata = {
            "session_id": session_id,
            "step": step,
            "category": str(payload.get("category", "")) if isinstance(payload.get("category"), str) else "",
        }
        with self._lock:
            self._collection.upsert(
                ids=[doc_id],
                documents=[text],
                metadatas=[metadata],
                embeddings=[_embed(text)],
            )

    def set_status(self, session_id: str, status: str) -> None:
        """Persist a session lifecycle status (running/completed/failed)."""
        self.save_step(session_id, _STATUS_STEP, {"status": status, "session_id": session_id})

    def get_status(self, session_id: str) -> str:
        """Current lifecycle status for a session, or "unknown"."""
        step = self.get_step(session_id, _STATUS_STEP)
        if not step:
            return "unknown"
        return str(step.get("status", "unknown"))

    def get_step(self, session_id: str, step: str) -> dict | None:
        doc_id = self._doc_id(session_id, step)
        with self._lock:
            result = self._collection.get(ids=[doc_id], include=["documents", "metadatas"])
        if not result or not result.get("documents"):
            return None
        try:
            return json.loads(result["documents"][0])
        except (TypeError, json.JSONDecodeError):
            return None

    def load_session(self, session_id: str) -> list[dict]:
        """All stored steps for a session, ordered by step name (status excluded)."""
        with self._lock:
            result = self._collection.get(where={"session_id": session_id}, include=["metadatas", "documents"])
        if not result or not result.get("metadatas"):
            return []
        steps = []
        for meta, doc in zip(result["metadatas"], result["documents"]):
            if meta.get("step") == _STATUS_STEP:
                continue
            try:
                payload = json.loads(doc)
            except (TypeError, json.JSONDecodeError):
                payload = {"raw": doc}
            steps.append({"step": meta.get("step", ""), "payload": payload})
        return sorted(steps, key=lambda item: item["step"])

    def query_context(self, session_id: str, query: str, n: int = 3) -> list[dict]:
        """Semantically relevant stored steps for a session (cosine similarity)."""
        with self._lock:
            result = self._collection.query(
                query_embeddings=[_embed(query)],
                where={"session_id": session_id},
                n_results=n,
                include=["documents", "metadatas", "distances"],
            )
        hits = []
        metas = result.get("metadatas") or [[]]
        docs = result.get("documents") or [[]]
        distances = result.get("distances") or [[]]
        for meta, doc, distance in zip(metas[0], docs[0], distances[0]):
            hits.append({"step": meta.get("step", ""), "text": doc, "score": round(1 - float(distance), 4)})
        return hits


def get_session_store() -> SessionStore:
    """Lazily create the shared session store (thread-safe)."""
    global _session_store
    with _store_lock:
        if _session_store is None:
            _session_store = SessionStore(CHROMA_DIR)
        return _session_store
