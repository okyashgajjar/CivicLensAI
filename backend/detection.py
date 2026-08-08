"""YOLO-based civic-issue image classification.

Loads the fine-tuned YOLO11 classification model (see YOLOModel/best.pt) once,
then runs it on uploaded evidence images. If ultralytics / the weights are not
available, inference is skipped and ``detect_image`` returns ``None`` so the
upload flow keeps working.
"""

import logging
import threading
from io import BytesIO

from PIL import Image

from config import MODEL_PATH

logger = logging.getLogger("civiclens.detection")

SEVERITY_ORDER = ("LOW", "MEDIUM", "CRITICAL")

CLASS_INFO = {
    "garbage": {"label": "Garbage / Illegal Dumping", "severity": "MEDIUM"},
    "open_manhole": {"label": "Open Manhole", "severity": "CRITICAL"},
    "pothole": {"label": "Pothole", "severity": "MEDIUM"},
    "waterlogging": {"label": "Waterlogging", "severity": "CRITICAL"},
    "road_normal": {"label": "Road (No Issue)", "severity": "LOW"},
}

# Below this confidence the model is considered unsure, so the severity is
# downgraded one step (CRITICAL -> MEDIUM -> LOW).
CONFIDENCE_DOWNGRADE = 0.5

_model = None
_model_lock = threading.Lock()


def _load_model():
    """Load the YOLO classifier once, thread-safely. Returns None on failure."""
    global _model
    with _model_lock:
        if _model is not None:
            return _model
        try:
            from ultralytics import YOLO

            _model = YOLO(str(MODEL_PATH))
            logger.info("Loaded YOLO classification model from %s", MODEL_PATH)
        except Exception:
            logger.exception("YOLO model unavailable; continuing without detection")
            _model = None
    return _model


def _downgrade(severity: str, confidence: float) -> str:
    if severity == "LOW" or confidence >= CONFIDENCE_DOWNGRADE:
        return severity
    index = SEVERITY_ORDER.index(severity)
    return SEVERITY_ORDER[max(0, index - 1)]


def detect_image(image_bytes: bytes) -> dict | None:
    """Classify a single image and return a detection dict, or None on failure."""
    model = _load_model()
    if model is None:
        return None

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        logger.exception("Unable to decode uploaded image for detection")
        return None

    try:
        results = model.predict(image, verbose=False)
        probs = results[0].probs
        class_id = int(probs.top1)
        class_name = results[0].names[class_id]
        confidence = round(float(probs.top1conf), 4)
    except Exception:
        logger.exception("YOLO inference failed")
        return None

    info = CLASS_INFO.get(
        class_name,
        {"label": class_name.replace("_", " ").title(), "severity": "MEDIUM"},
    )
    return {
        "category": class_name,
        "label": info["label"],
        "confidence": confidence,
        "severity": _downgrade(info["severity"], confidence),
        "is_issue": class_name != "road_normal",
    }
