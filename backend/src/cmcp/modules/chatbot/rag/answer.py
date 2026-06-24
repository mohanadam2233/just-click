from __future__ import annotations

from functools import lru_cache
from typing import Any

from cmcp.config.settings import settings
from cmcp.core.exceptions import BusinessValidationError
from cmcp.modules.chatbot.models import ChatMessage
from cmcp.modules.chatbot.rag.modes import detect_mode
from cmcp.modules.chatbot.rag.prompts import (
    build_chat_prompt,
    build_qna_prompt,
    build_quiz_prompt,
    build_summary_prompt,
)
from cmcp.modules.chatbot.rag.retriever import get_relevant_chunks


@lru_cache(maxsize=1)
def _llm_client():
    if not settings.DEEPSEEK_API_KEY:
        raise BusinessValidationError("DEEPSEEK_API_KEY is not configured.")
    try:
        from openai import OpenAI
    except Exception as exc:
        raise BusinessValidationError("openai is not installed.") from exc
    return OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url=settings.CHATBOT_LLM_BASE_URL)


def call_llm(system_prompt: str, user_prompt: str) -> str:
    resp = _llm_client().chat.completions.create(
        model=settings.CHATBOT_LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return resp.choices[0].message.content or ""


def _chat_history(session_id: str, last_n: int = 6) -> str:
    rows = (
        ChatMessage.query
        .filter_by(session_id=session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()[-last_n:]
    )
    return "\n".join(f"{r.role_name.upper()}: {r.message_text}" for r in rows)


def _format_context(chunks: list[dict[str, Any]]) -> str:
    parts = []
    for item in chunks[: settings.CHATBOT_MAX_CONTEXT_CHUNKS]:
        meta = item.get("metadata") or {}
        source = meta.get("source_name") or meta.get("source") or "?"
        chapter = meta.get("chapter_label") or meta.get("chapter") or "General"
        parts.append(f"[Source: {source} | {chapter}]\n{item.get('text', '')}")
    return "\n\n".join(parts)


def _format_sources(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sources = []
    for item in chunks[: settings.CHATBOT_MAX_CONTEXT_CHUNKS]:
        meta = item.get("metadata") or {}
        sources.append({
            "source_name": meta.get("source_name") or meta.get("source"),
            "chapter_label": meta.get("chapter_label") or meta.get("chapter"),
            "chunk_index": meta.get("chunk_index"),
        })
    return sources


def answer_material_question(
    *,
    company_id: int,
    material_id: int,
    session_id: str,
    question: str,
    material_title: str,
) -> dict[str, Any]:
    mode = detect_mode(question)
    chunks = get_relevant_chunks(
        company_id=company_id,
        material_id=material_id,
        query=question,
    )

    if not chunks:
        return {
            "answer": "I do not have enough indexed content from this material to answer that question.",
            "sources": [],
            "mode_used": mode,
        }

    context = _format_context(chunks)
    history = _chat_history(session_id)

    if mode == "summary":
        system, user = build_summary_prompt(context=context, material_title=material_title)
    elif mode == "quiz":
        system, user = build_quiz_prompt(context=context, material_title=material_title)
    elif mode == "qna":
        system, user = build_qna_prompt(context=context, material_title=material_title)
    else:
        system, user = build_chat_prompt(
            context=context,
            history=history,
            question=question,
            material_title=material_title,
        )

    return {
        "answer": call_llm(system, user),
        "sources": _format_sources(chunks),
        "mode_used": mode,
    }
