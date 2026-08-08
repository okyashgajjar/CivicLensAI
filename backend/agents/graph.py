"""LangGraph pipeline for the CivicLens report agents.

Graph: classify -> duplicate -> route -> summarize.

Each node is a LangGraph state node; every agent writes its structured output
both to the shared ``PipelineState`` and to the Chroma session store.
"""

import logging

from langgraph.graph import END, START, StateGraph

from agents.classification import node as classify_node
from agents.duplication import node as duplicate_node
from agents.router import node as route_node
from agents.summary import node as summarize_node
from agents.state import PipelineState

logger = logging.getLogger("civiclens.agents.graph")

_graph = None


def build_pipeline():
    """Build and compile the agent pipeline (cached)."""
    global _graph
    if _graph is not None:
        return _graph

    builder = StateGraph(PipelineState)
    builder.add_node("classify", classify_node)
    builder.add_node("duplicate", duplicate_node)
    builder.add_node("route", route_node)
    builder.add_node("summarize", summarize_node)

    builder.add_edge(START, "classify")
    builder.add_edge("classify", "duplicate")
    builder.add_edge("duplicate", "route")
    builder.add_edge("route", "summarize")
    builder.add_edge("summarize", END)

    _graph = builder.compile()
    logger.info("Compiled CivicLens agent pipeline")
    return _graph


def run_pipeline(state: PipelineState) -> dict:
    """Invoke the full agent pipeline and return the final state."""
    pipeline = build_pipeline()
    try:
        return pipeline.invoke(state)
    except Exception:
        logger.exception("agent pipeline failed")
        errors = list(state.get("errors", []))
        errors.append("Agent pipeline failed")
        return {**state, "errors": errors}
