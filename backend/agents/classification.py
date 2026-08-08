"""Classification agent.

Runs the YOLO classifier on the evidence image and applies a confidence gate.
The agent's output is a validated ``ClassificationResult`` (structured output).
"""

import logging

import config
import detection
from agents.session_store import get_session_store
from agents.state import ClassificationResult, PipelineState

logger = logging.getLogger("civiclens.agents.classification")


def _fallback(state: PipelineState) -> ClassificationResult:
    """Deterministic classification when no image / YOLO result is available."""
    category = state.get("category", "").lower()
    info = detection.CLASS_INFO.get(category)
    if info is not None:
        label, severity = info["label"], info["severity"]
        is_issue = category != "road_normal"
    else:
        label = category.replace("_", " ").strip().title() or "Civic Issue"
        severity = "MEDIUM"
        is_issue = True
    return ClassificationResult(
        category=category,
        label=label,
        confidence=None,
        severity=severity,
        is_issue=is_issue,
        confidence_good=False,
        reasoning=f"No reliable image detection available; classified from the reported category '{category}'.",
    )


def run(state: PipelineState) -> ClassificationResult:
    """Classify the image (YOLO) and gate on confidence."""
    image_bytes = state.get("image_bytes")
    if image_bytes is None:
        result = _fallback(state)
    else:
        detection_result = detection.detect_image(image_bytes)
        if detection_result is None:
            result = _fallback(state)
        else:
            confidence = detection_result["confidence"]
            result = ClassificationResult(
                category=detection_result["category"],
                label=detection_result["label"],
                confidence=confidence,
                severity=detection_result["severity"],
                is_issue=detection_result["is_issue"],
                confidence_good=confidence is not None
                and confidence >= config.CLASSIFICATION_CONFIDENCE_THRESHOLD,
                reasoning=(
                    f"YOLO classified the image as '{detection_result['label']}' "
                    f"({detection_result['category']}) with {confidence:.0%} confidence. "
                    f"Confidence is {'good' if confidence >= config.CLASSIFICATION_CONFIDENCE_THRESHOLD else 'low'}, "
                    f"so severity is '{detection_result['severity']}'."
                ),
            )
    get_session_store().save_step(state["session_id"], "classification", result.model_dump())
    return result


def node(state: PipelineState) -> dict:
    """LangGraph node wrapper: persist the result and update graph state."""
    return {"classification": run(state)}
