"""AI provider abstraction.

A provider-independent interface with a real OpenAI-compatible adapter.
When no provider is configured the service raises ProviderNotConfigured so
the UI can show an honest setup state instead of fabricating responses.
"""
from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass
from typing import AsyncIterator, Optional

import httpx

from app.config import get_settings
from app.core.errors import ExternalServiceError

logger = logging.getLogger("zention.ai")


class ProviderNotConfigured(Exception):
    """Raised when no AI provider credentials are configured."""


@dataclass
class ChatMessage:
    role: str
    content: str


@dataclass
class ChatChunk:
    delta: str
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    done: bool = False


@dataclass
class ChatResult:
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: int = 0
    model: str = ""


class AIProvider:
    """OpenAI-compatible chat/embeddings adapter."""

    def __init__(self, base_url: str, api_key: str, model: str, embedding_model: str):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.embedding_model = embedding_model
        self._client = httpx.AsyncClient(timeout=60.0)

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    async def chat(self, messages: list[ChatMessage], *, temperature: float = 0.7, max_tokens: int = 1024) -> ChatResult:
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        started = time.perf_counter()
        try:
            resp = await self._client.post(f"{self.base_url}/chat/completions", headers=self._headers(), json=payload)
        except httpx.HTTPError as exc:
            raise ExternalServiceError(f"AI provider unreachable: {exc}") from exc
        if resp.status_code >= 400:
            logger.error("AI provider error %s: %s", resp.status_code, resp.text[:500])
            raise ExternalServiceError("AI provider returned an error")
        data = resp.json()
        choice = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        latency_ms = int((time.perf_counter() - started) * 1000)
        return ChatResult(
            content=choice,
            prompt_tokens=int(usage.get("prompt_tokens", 0)),
            completion_tokens=int(usage.get("completion_tokens", 0)),
            latency_ms=latency_ms,
            model=self.model,
        )

    async def chat_stream(self, messages: list[ChatMessage], *, temperature: float = 0.7, max_tokens: int = 1024) -> AsyncIterator[ChatChunk]:
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        try:
            async with self._client.stream("POST", f"{self.base_url}/chat/completions", headers=self._headers(), json=payload) as resp:
                if resp.status_code >= 400:
                    raise ExternalServiceError("AI provider returned an error")
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if data == "[DONE]":
                        yield ChatChunk(delta="", done=True)
                        return
                    try:
                        parsed = json.loads(data)
                        delta = parsed["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield ChatChunk(delta=delta)
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
        except httpx.HTTPError as exc:
            raise ExternalServiceError(f"AI provider stream failed: {exc}") from exc

    async def embeddings(self, texts: list[str]) -> list[list[float]]:
        payload = {"model": self.embedding_model, "input": texts}
        try:
            resp = await self._client.post(f"{self.base_url}/embeddings", headers=self._headers(), json=payload)
        except httpx.HTTPError as exc:
            raise ExternalServiceError(f"AI provider unreachable: {exc}") from exc
        if resp.status_code >= 400:
            raise ExternalServiceError("Embedding request failed")
        data = resp.json()
        return [item["embedding"] for item in sorted(data["data"], key=lambda d: d["index"])]

    async def structured_output(self, messages: list[ChatMessage], schema: dict) -> dict:
        """Request JSON conforming to a schema (OpenAI-compatible response_format)."""
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages]
            + [
                {
                    "role": "user",
                    "content": "Respond ONLY with valid JSON matching this schema: "
                    + json.dumps(schema),
                }
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        }
        try:
            resp = await self._client.post(f"{self.base_url}/chat/completions", headers=self._headers(), json=payload)
        except httpx.HTTPError as exc:
            raise ExternalServiceError(f"AI provider unreachable: {exc}") from exc
        if resp.status_code >= 400:
            raise ExternalServiceError("Structured output request failed")
        text = resp.json()["choices"][0]["message"]["content"]
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            raise ExternalServiceError("Model did not return valid JSON") from exc


_provider_instance: Optional[AIProvider] = None


def get_provider() -> AIProvider:
    settings = get_settings()
    if not settings.ai_configured:
        raise ProviderNotConfigured(
            "No AI provider configured. Set AI_PROVIDER, AI_BASE_URL and AI_API_KEY in the environment."
        )
    global _provider_instance
    if _provider_instance is None or _provider_instance.base_url != settings.ai_base_url.rstrip("/"):
        _provider_instance = AIProvider(
            base_url=settings.ai_base_url,
            api_key=settings.ai_api_key,
            model=settings.ai_default_model,
            embedding_model=settings.ai_embedding_model,
        )
    return _provider_instance


def provider_status() -> dict:
    settings = get_settings()
    return {
        "configured": settings.ai_configured,
        "provider": settings.ai_provider,
        "model": settings.ai_default_model if settings.ai_configured else None,
        "setup_instructions": "Configure AI_PROVIDER, AI_BASE_URL and AI_API_KEY (OpenAI-compatible endpoint) to enable AI features."
        if not settings.ai_configured
        else None,
    }
