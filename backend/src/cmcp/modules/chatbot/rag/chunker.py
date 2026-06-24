from __future__ import annotations

from cmcp.modules.chatbot.rag.extractor import RE_JUNK


def _is_junk_chunk(text: str) -> bool:
    if RE_JUNK.search(text):
        return True
    words = text.split()
    if not words:
        return True
    path_like = sum(1 for word in words if "/" in word or word.endswith(".xml") or word.endswith(".rels"))
    return path_like / len(words) > 0.3


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 80) -> list[str]:
    words = text.split()
    step = max(1, chunk_size - overlap)
    chunks = []
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk and not _is_junk_chunk(chunk):
            chunks.append(chunk)
    return chunks
