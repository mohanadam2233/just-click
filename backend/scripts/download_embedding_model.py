#!/usr/bin/env python3
"""Download the local embedding model for JustClick chatbot RAG."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp.config.settings import settings

    cache_dir = Path(settings.CHATBOT_EMBEDDING_CACHE_DIR)
    if not cache_dir.is_absolute():
        cache_dir = backend_root / settings.CHATBOT_EMBEDDING_CACHE_DIR

    model_name = settings.CHATBOT_EMBEDDING_MODEL.replace("/", "--")
    target = cache_dir / model_name

    if target.is_dir() and any(target.iterdir()):
        print(f"Embedding model already present at: {target}")
        return 0

    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print("ERROR: sentence-transformers is not installed. Run: pip install sentence-transformers")
        return 1

    cache_dir.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {settings.CHATBOT_EMBEDDING_MODEL} to {target} ...")

    try:
        model = SentenceTransformer(settings.CHATBOT_EMBEDDING_MODEL)
        model.save(str(target))
    except Exception as exc:
        print(f"ERROR: Failed to download embedding model: {exc}")
        return 1

    print(f"SUCCESS: Embedding model saved to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
