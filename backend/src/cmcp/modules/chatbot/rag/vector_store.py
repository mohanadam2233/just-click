from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from cmcp.config.settings import settings
from cmcp.core.exceptions import BusinessValidationError


def _backend_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _chroma_dir() -> Path:
    chroma_dir = Path(settings.CHATBOT_CHROMA_DIR)
    if not chroma_dir.is_absolute():
        chroma_dir = _backend_root() / settings.CHATBOT_CHROMA_DIR
    chroma_dir.mkdir(parents=True, exist_ok=True)
    return chroma_dir


@lru_cache(maxsize=1)
def get_collection():
    os.environ.setdefault("ANONYMIZED_TELEMETRY", "false" if not settings.ANONYMIZED_TELEMETRY else "true")

    try:
        import chromadb
        from chromadb.config import Settings as ChromaSettings
    except Exception as exc:
        raise BusinessValidationError("chromadb is not installed.") from exc

    client = chromadb.PersistentClient(
        path=str(_chroma_dir()),
        settings=ChromaSettings(anonymized_telemetry=False),
    )
    return client.get_or_create_collection(name=settings.CHATBOT_COLLECTION_NAME)


def add_chunks(
    *,
    chunks: list[str],
    vectors: list[list[float]],
    metadatas: list[dict[str, Any]],
    ids: list[str],
) -> None:
    coll = get_collection()
    coll.add(documents=chunks, embeddings=vectors, metadatas=metadatas, ids=ids)


def query_chunks(
    *,
    query_vector: list[float],
    where_filter: dict[str, Any],
    n_results: int,
) -> tuple[list[str], list[dict[str, Any]], list[float]]:
    coll = get_collection()
    res = coll.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )
    return (
        res.get("documents", [[]])[0],
        res.get("metadatas", [[]])[0],
        res.get("distances", [[]])[0],
    )


def delete_material_chunks(company_id: int, material_id: int) -> int:
    coll = get_collection()
    res = coll.get(
        where={"$and": [{"company_id": int(company_id)}, {"material_id": int(material_id)}]},
        include=[],
    )
    ids = res.get("ids") or []
    if ids:
        coll.delete(ids=ids)
    return len(ids)
