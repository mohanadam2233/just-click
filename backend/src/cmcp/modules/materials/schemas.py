# src/cmcp/modules/materials/schemas.py
from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_validator


class _BaseIn(BaseModel):
    # reject unknown fields like company_id, course_id, etc.
    model_config = ConfigDict(extra="forbid")


class MaterialCreateIn(_BaseIn):
    # ✅ Material belongs to course offering, not direct course
    course_offering_id: int
    chapter_id: Optional[int] = None

    title: str = Field(..., min_length=1, max_length=200)
    material_type: str

    # optional if uploading file via multipart; service can set it after upload
    file_url: Optional[str] = None

    page_count: Optional[int] = None
    slide_count: Optional[int] = None

    file_size_mb: Optional[float] = None
    learning_objectives: Optional[List[str]] = None
    description: Optional[str] = None

    is_downloadable: bool = True
    is_enabled: bool = True

    @field_validator("course_offering_id")
    @classmethod
    def validate_course_offering_id(cls, v: int):
        if v < 1:
            raise ValueError("course_offering_id must be valid.")
        return v

    @field_validator("chapter_id")
    @classmethod
    def validate_chapter_id(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("chapter_id must be valid.")
        return v

    @field_validator("page_count", "slide_count")
    @classmethod
    def validate_counts(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("Count must be at least 1.")
        return v

    @field_validator("file_size_mb")
    @classmethod
    def validate_file_size_mb(cls, v: Optional[float]):
        if v is not None and v < 0:
            raise ValueError("file_size_mb cannot be negative.")
        return v


class MaterialUpdateIn(_BaseIn):
    # ✅ allow changing offering if admin made mistake
    # If you do NOT want this, remove course_offering_id from update.
    course_offering_id: Optional[int] = None
    chapter_id: Optional[int] = None

    material_type: Optional[str] = None

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    learning_objectives: Optional[List[str]] = None

    is_downloadable: Optional[bool] = None
    is_enabled: Optional[bool] = None

    file_url: Optional[str] = None
    file_size_mb: Optional[float] = None

    page_count: Optional[int] = None
    slide_count: Optional[int] = None

    @field_validator("course_offering_id")
    @classmethod
    def validate_course_offering_id(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("course_offering_id must be valid.")
        return v

    @field_validator("chapter_id")
    @classmethod
    def validate_chapter_id(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("chapter_id must be valid.")
        return v

    @field_validator("page_count", "slide_count")
    @classmethod
    def validate_counts(cls, v: Optional[int]):
        if v is not None and v < 1:
            raise ValueError("Count must be at least 1.")
        return v

    @field_validator("file_size_mb")
    @classmethod
    def validate_file_size_mb(cls, v: Optional[float]):
        if v is not None and v < 0:
            raise ValueError("file_size_mb cannot be negative.")
        return v


class MaterialTrackEventOut(BaseModel):
    material_id: int
    user_id: int
    event: str  # "view" | "download"
    counted: bool
    reason: Optional[str] = None

    global_view_count: int
    global_download_count: int

    user_view_count: int
    user_download_count: int

    last_viewed_at: Optional[str] = None
    last_downloaded_at: Optional[str] = None


class MaterialFavoriteIn(_BaseIn):
    is_favorite: bool