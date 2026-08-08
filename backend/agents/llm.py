"""LLM factory for the CivicLens agent pipeline.

Defaults to OpenRouter free models (requires an API key). If the configured
provider is unavailable, it falls back to a local Ollama model, and finally to
deterministic rules, so the pipeline keeps working.
"""

import logging
from typing import TypeVar

from pydantic import BaseModel

import config

logger = logging.getLogger("civiclens.agents.llm")

T = TypeVar("T", bound=BaseModel)


def _openrouter_llm():
    """Return a ChatOpenAI client pointed at OpenRouter, or None."""
    if not config.OPENROUTER_API_KEY:
        logger.warning("CIVICLENS_OPENROUTER_API_KEY is not set; skipping OpenRouter")
        return None
    try:
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=config.OPENROUTER_MODEL,
            api_key=config.OPENROUTER_API_KEY,
            base_url=config.OPENROUTER_BASE_URL,
            temperature=0.2,
            max_retries=1,
            request_timeout=120,
            default_headers={
                "HTTP-Referer": "https://civiclens.dev",
                "X-Title": "CivicLens",
            },
        )
    except Exception:
        logger.exception("OpenRouter provider unavailable; falling back to Ollama")
        return None


def _ollama_llm():
    """Return a local ChatOllama client, or None."""
    try:
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=config.OLLAMA_MODEL,
            base_url=config.OLLAMA_BASE_URL,
            temperature=0.2,
            num_predict=512,
        )
    except Exception:
        logger.exception("Ollama provider unavailable; falling back to rules")
        return None


def get_llm():
    """Return a configured chat model, or None when no provider is available."""
    if config.LLM_PROVIDER in ("openrouter", "ollama"):
        if config.LLM_PROVIDER == "openrouter":
            llm = _openrouter_llm()
            if llm is not None:
                return llm
        return _ollama_llm()
    return None


def structured_invoke(schema: type[T], prompt: str) -> T | None:
    """Ask the LLM for structured output matching ``schema``.

    Returns None (rather than raising) whenever the LLM is unavailable or the
    response fails to validate, so callers can use deterministic fallbacks.
    """
    llm = get_llm()
    if llm is None:
        return None
    try:
        result = llm.with_structured_output(schema).invoke(prompt)
        return result if isinstance(result, schema) else None
    except Exception:
        logger.warning("Structured LLM output failed for %s", schema.__name__, exc_info=True)
        return None
