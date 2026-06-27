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
from cmcp.modules.chatbot.rag.retriever import get_material_context_chunks, get_relevant_chunks

_GENERIC_SOURCE_NAMES = frozenset({
    "file.pdf", "file.ppt", "file.pptx", "file.doc", "file.docx",
})


@lru_cache(maxsize=1)
def _llm_client():
    if not settings.DEEPSEEK_API_KEY:
        raise BusinessValidationError("DEEPSEEK_API_KEY is not configured.")
    try:
        from openai import OpenAI
    except Exception as exc:
        raise BusinessValidationError("openai is not installed.") from exc
    return OpenAI(
        api_key=settings.DEEPSEEK_API_KEY,
        base_url=settings.CHATBOT_LLM_BASE_URL,
        timeout=settings.CHATBOT_LLM_TIMEOUT_SECONDS,
    )


def _max_tokens_for_mode(mode: str) -> int:
    if mode == "summary":
        return settings.CHATBOT_LLM_MAX_TOKENS_SUMMARY
    if mode == "quiz":
        return settings.CHATBOT_LLM_MAX_TOKENS_QUIZ
    if mode == "qna":
        return settings.CHATBOT_LLM_MAX_TOKENS_QNA
    return settings.CHATBOT_LLM_MAX_TOKENS_CHAT


def call_llm(system_prompt: str, user_prompt: str, *, mode: str = "chat") -> str:
    resp = _llm_client().chat.completions.create(
        model=settings.CHATBOT_LLM_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=_max_tokens_for_mode(mode),
        temperature=0.2,
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


def _format_context(chunks: list[dict[str, Any]], *, material_title: str) -> str:
    parts = []
    for item in chunks[: settings.CHATBOT_MAX_CONTEXT_CHUNKS]:
        meta = item.get("metadata") or {}
        chapter = (meta.get("chapter_label") or "").strip()
        course = (meta.get("course_title") or meta.get("material_title") or material_title).strip()
        source_label = chapter or course or material_title
        parts.append(f"[{source_label}]\n{item.get('text', '')}")
    return "\n\n".join(parts)


def _source_label(meta: dict[str, Any], *, material_title: str) -> str:
    chapter = (meta.get("chapter_label") or "").strip()
    course = (meta.get("course_title") or meta.get("material_title") or material_title).strip()
    source_name = (meta.get("source_name") or meta.get("source") or "").strip()

    if chapter:
        return chapter
    if course:
        return course
    if source_name and source_name.lower() not in _GENERIC_SOURCE_NAMES:
        return source_name
    return material_title or "This material"


def _format_sources(
    chunks: list[dict[str, Any]],
    *,
    material_title: str,
) -> list[dict[str, Any]]:
    seen: set[str] = set()
    sources: list[dict[str, Any]] = []

    for item in chunks[: settings.CHATBOT_MAX_CONTEXT_CHUNKS]:
        meta = item.get("metadata") or {}
        label = _source_label(meta, material_title=material_title)
        key = label.strip().lower()
        if not key or key in seen:
            continue
        seen.add(key)
        sources.append({
            "label": label,
            "chapter_label": (meta.get("chapter_label") or "").strip() or None,
            "course_title": (meta.get("course_title") or meta.get("material_title") or material_title or "").strip() or None,
        })
        if len(sources) >= 3:
            break

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
    if mode in ("summary", "quiz", "qna"):
        chunks = get_material_context_chunks(
            company_id=company_id,
            material_id=material_id,
        )
    else:
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

    context = _format_context(chunks, material_title=material_title)
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
        "answer": call_llm(system, user, mode=mode),
        "sources": _format_sources(chunks, material_title=material_title),
        "mode_used": mode,
    }
