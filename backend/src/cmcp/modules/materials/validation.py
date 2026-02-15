# src/cmcp/modules/materials/validation.py
from __future__ import annotations

from typing import Any, Optional, List
from urllib.parse import urlparse

from cmcp.core.exceptions import BusinessValidationError
from .constants import (
    ERR_MATERIAL_TITLE_REQUIRED,
    ERR_MATERIAL_TITLE_TOO_LONG,
    ERR_MATERIAL_TYPE_REQUIRED,
    ERR_MATERIAL_OBJECTIVES_INVALID,
    ERR_FILE_SIZE_NEGATIVE,
    ERR_FILE_SIZE_TOO_LARGE,
    ERR_MATERIAL_FILE_SIZE_INVALID,
    ERR_MATERIAL_COUNTS_CONFLICT,
    ERR_SLIDES_REQUIRE_SLIDE_COUNT,
    ERR_PDF_REQUIRE_PAGE_COUNT,
    ERR_DOC_REQUIRE_PAGE_COUNT,
    ERR_PAGE_COUNT_MIN,
    ERR_SLIDE_COUNT_MIN,
    ERR_LINK_INVALID_URL,
    ERR_MATERIAL_MISMATCH_TYPE_META,
    MAX_FILE_SIZE_MB,
)

def require_title(v: Optional[str]) -> str:
    s = (v or "").strip()
    if not s:
        raise BusinessValidationError(ERR_MATERIAL_TITLE_REQUIRED)
    if len(s) > 200:
        raise BusinessValidationError(ERR_MATERIAL_TITLE_TOO_LONG)
    return s

def require_material_type(v: Any) -> str:
    s = (str(v or "")).strip()
    if not s:
        raise BusinessValidationError(ERR_MATERIAL_TYPE_REQUIRED)
    return s

def validate_learning_objectives(v: Any) -> Optional[List[str]]:
    if v is None:
        return None
    if not isinstance(v, list):
        raise BusinessValidationError(ERR_MATERIAL_OBJECTIVES_INVALID)
    out: List[str] = []
    for item in v:
        if not isinstance(item, str):
            raise BusinessValidationError(ERR_MATERIAL_OBJECTIVES_INVALID)
        s = item.strip()
        if s:
            out.append(s)
    return out or None

def validate_file_size_mb(v: Any) -> Optional[float]:
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except Exception:
        raise BusinessValidationError(ERR_MATERIAL_FILE_SIZE_INVALID)
    if f < 0:
        raise BusinessValidationError(ERR_FILE_SIZE_NEGATIVE)
    if f > float(MAX_FILE_SIZE_MB):
        raise BusinessValidationError(ERR_FILE_SIZE_TOO_LARGE)
    return f

def validate_link_url_if_needed(material_type: str, file_url: Optional[str]) -> Optional[str]:
    """
    For LINK type: must be valid URL.
    For others: accept None or any string (we store our generated media URL).
    """
    s = (file_url or "").strip() or None
    t = (material_type or "").strip().lower()
    if t == "link":
        if not s:
            raise BusinessValidationError(ERR_LINK_INVALID_URL)
        u = urlparse(s)
        if u.scheme not in ("http", "https") or not u.netloc:
            raise BusinessValidationError(ERR_LINK_INVALID_URL)
        return s
    return s

def validate_counts(material_type: str, page_count: Any, slide_count: Any) -> tuple[Optional[int], Optional[int]]:
    t = (material_type or "").strip().lower()

    def _to_int_or_none(x: Any) -> Optional[int]:
        if x is None or x == "":
            return None
        try:
            return int(x)
        except Exception:
            return None

    p = _to_int_or_none(page_count)
    s = _to_int_or_none(slide_count)

    if p is not None and p < 1:
        raise BusinessValidationError(ERR_PAGE_COUNT_MIN)
    if s is not None and s < 1:
        raise BusinessValidationError(ERR_SLIDE_COUNT_MIN)

    if p is not None and s is not None:
        raise BusinessValidationError(ERR_MATERIAL_COUNTS_CONFLICT)

    if t == "slides":
        if p is not None:
            raise BusinessValidationError(ERR_MATERIAL_MISMATCH_TYPE_META)
        if s is None:
            raise BusinessValidationError(ERR_SLIDES_REQUIRE_SLIDE_COUNT)
        return None, s

    if t == "pdf":
        if s is not None:
            raise BusinessValidationError(ERR_MATERIAL_MISMATCH_TYPE_META)
        if p is None:
            raise BusinessValidationError(ERR_PDF_REQUIRE_PAGE_COUNT)
        return p, None

    if t == "doc":
        if s is not None:
            raise BusinessValidationError(ERR_MATERIAL_MISMATCH_TYPE_META)
        if p is None:
            raise BusinessValidationError(ERR_DOC_REQUIRE_PAGE_COUNT)
        return p, None

    # video/link/other => no counts
    if p is not None or s is not None:
        raise BusinessValidationError(ERR_MATERIAL_MISMATCH_TYPE_META)

    return None, None