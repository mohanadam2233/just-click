from __future__ import annotations

import logging
import os
import threading

log = logging.getLogger(__name__)

_warmup_started = False
_warmup_lock = threading.Lock()


from cmcp.config.settings import settings


def _disable_chroma_telemetry() -> None:
    os.environ.setdefault("CUDA_VISIBLE_DEVICES", "")
    os.environ["ANONYMIZED_TELEMETRY"] = "False"
    os.environ.setdefault("CHROMA_TELEMETRY", "FALSE")


def warmup_chatbot_rag(*, load_embedding_model: bool | None = None) -> None:
    """Preload RAG dependencies so the first student ask is fast."""
    _disable_chroma_telemetry()

    if load_embedding_model is None:
        load_embedding_model = settings.CHATBOT_WARMUP_EMBEDDING

    try:
        from cmcp.modules.chatbot.rag.vector_store import get_collection

        get_collection()
        log.info("Chatbot RAG: Chroma collection ready.")
    except Exception as exc:
        log.warning("Chatbot RAG: Chroma warmup failed: %s", exc)

    try:
        from cmcp.modules.chatbot.rag.answer import _llm_client

        _llm_client()
        log.info("Chatbot RAG: LLM client ready.")
    except Exception as exc:
        log.warning("Chatbot RAG: LLM client warmup failed: %s", exc)

    if not load_embedding_model:
        return

    try:
        from cmcp.modules.chatbot.rag.embeddings import get_embedding_model

        get_embedding_model()
        log.info("Chatbot RAG: embedding model ready.")
    except Exception as exc:
        log.warning("Chatbot RAG: embedding model warmup failed: %s", exc)


def schedule_chatbot_rag_warmup(app) -> None:
    """Run RAG warmup once per process, in a background thread."""
    global _warmup_started

    with _warmup_lock:
        if _warmup_started:
            return
        _warmup_started = True

    def _run() -> None:
        with app.app_context():
            warmup_chatbot_rag()

    threading.Thread(target=_run, name="chatbot-rag-warmup", daemon=True).start()
