from __future__ import annotations

from functools import lru_cache
from typing import Any

from cmcp.config.settings import settings
from cmcp.modules.chatbot.rag.embeddings import embed_query
from cmcp.modules.chatbot.rag.vector_store import query_chunks


def material_where_filter(company_id: int, material_id: int) -> dict[str, Any]:
    return {
        "$and": [
            {"company_id": int(company_id)},
            {"material_id": int(material_id)},
        ]
    }


def get_relevant_chunks(
    *,
    company_id: int,
    material_id: int,
    query: str,
    n_results: int | None = None,
) -> list[dict[str, Any]]:
    query_vector = embed_query(query)
    docs, metas, distances = query_chunks(
        query_vector=query_vector,
        where_filter=material_where_filter(company_id, material_id),
        n_results=n_results or settings.CHATBOT_TOP_K,
    )

    results = []
    for doc, meta, distance in zip(docs, metas, distances):
        if distance >= settings.CHATBOT_RELEVANCE_THRESHOLD:
            continue
        results.append({
            "text": doc,
            "metadata": meta,
            "distance": distance,
        })
    return results
