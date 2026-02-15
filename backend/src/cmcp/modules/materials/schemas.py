# src/cmcp/modules/materials/schemas.py
from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class _BaseIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

class MaterialCreateIn(_BaseIn):
    course_id: int
    chapter_id: Optional[int] = None

    title: str = Field(..., min_length=1, max_length=200)
    material_type: str

    # optional if uploading file via multipart; will be set by service
    file_url: Optional[str] = None

    page_count: Optional[int] = None
    slide_count: Optional[int] = None

    file_size_mb: Optional[float] = None
    learning_objectives: Optional[List[str]] = None
    description: Optional[str] = None

    is_downloadable: bool = True
    is_enabled: bool = True

class MaterialUpdateIn(_BaseIn):
    # ❌ not allowed to change after create
    course_id: Optional[int] = None
    chapter_id: Optional[int] = None
    material_type: Optional[str] = None

    # ✅ allowed updates
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    is_downloadable: Optional[bool] = None
    is_enabled: Optional[bool] = None

    # if link type, user may update URL; if file type, service can replace via upload
    file_url: Optional[str] = None
    file_size_mb: Optional[float] = None

    page_count: Optional[int] = None
    slide_count: Optional[int] = None