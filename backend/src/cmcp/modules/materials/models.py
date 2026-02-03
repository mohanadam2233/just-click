# app/apps/education_content/models.py
from __future__ import annotations

from typing import Optional
import enum

from sqlalchemy import UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin


class MaterialTypeEnum(str, enum.Enum):
    SLIDES = "slides"
    PDF = "pdf"
    DOC = "doc"
    VIDEO = "video"
    LINK = "link"
    OTHER = "other"


class Material(BaseModel, TenantMixin):
    __tablename__ = "edu_materials"

    # Linking to Course (Required) and Chapter (Optional)
    course_id: Mapped[int] = mapped_column(db.BigInteger, db.ForeignKey("edu_courses.id"), nullable=False)
    chapter_id: Mapped[Optional[int]] = mapped_column(db.BigInteger, db.ForeignKey("edu_chapters.id"), nullable=True)

    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)

    material_type: Mapped[MaterialTypeEnum] = mapped_column(
        db.Enum(MaterialTypeEnum, name="edu_material_type_enum"),
        nullable=False,
        index=True,
    )

    # File Storage
    file_url: Mapped[Optional[str]] = mapped_column(
        db.String(512),
        nullable=True,
        comment="Public accessible URL if needed"
    )

    # Your Requested Metadata
    page_count: Mapped[Optional[int]] = mapped_column(
        db.Integer,
        nullable=True,
        comment="Total pages in PDF or Doc"
    )

    slide_count: Mapped[Optional[int]] = mapped_column(
        db.Integer,
        nullable=True,
        comment="Total slides if PPT"
    )
    # "Objectives... list"
    learning_objectives: Mapped[Optional[list[str]]] = mapped_column(
        JSONB,
        nullable=True,
        comment='e.g. ["Learn Syntax", "Understand Loops"]'
    )
    # --- TRACKING COUNTERS (Aggregated) ---
    # We increment these when a student acts.
    view_count: Mapped[int] = mapped_column(db.Integer, default=0)
    download_count: Mapped[int] = mapped_column(db.Integer, default=0)
    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    file_size_mb: Mapped[Optional[float]] = mapped_column(db.Float, nullable=True)

    is_downloadable: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)
    # Relationships
    interactions: Mapped[list["StudentMaterialInteraction"]] = db.relationship("StudentMaterialInteraction",
                                                                            back_populates="material")
    __table_args__ = (
        UniqueConstraint(
            "company_id", "course_id", "chapter_id", "title",
            name="uq_edu_materials_scope_title"
        ),
        CheckConstraint("(page_count is null) OR (page_count >= 1)", name="ck_edu_material_page_min"),
        CheckConstraint("(slide_count is null) OR (slide_count >= 1)", name="ck_edu_material_slide_min"),
        CheckConstraint("(file_size_mb is null) OR (file_size_mb >= 0)", name="ck_edu_material_size_min"),
    )
class StudentMaterialInteraction(BaseModel, TenantMixin):
    """
    Tracks per-student data:
    1. Is it a Favorite?
    2. Has this specific student downloaded it?
    """
    __tablename__ = "material_interactions"

    user_id: Mapped[int] = mapped_column(db.BigInteger, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    material_id: Mapped[int] = mapped_column(db.BigInteger, db.ForeignKey("edu_materials.id", ondelete="CASCADE"), nullable=False)

    is_favorite: Mapped[bool] = mapped_column(db.Boolean, default=False, index=True)
    has_downloaded: Mapped[bool] = mapped_column(db.Boolean, default=False)
    last_viewed_at: Mapped[Optional[db.DateTime]] = mapped_column(db.DateTime(timezone=True))

    material: Mapped["Material"] = db.relationship("Material", back_populates="interactions")

    __table_args__ = (
        UniqueConstraint("company_id", "student_id", "material_id", name="uq_student_material_interaction"),
    )