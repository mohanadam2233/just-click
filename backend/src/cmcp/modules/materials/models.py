# app/apps/education_content/models.py
from __future__ import annotations

from typing import Optional
import enum

from sqlalchemy import UniqueConstraint, CheckConstraint, Index
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

    course_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    chapter_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_chapters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)

    material_type: Mapped[MaterialTypeEnum] = mapped_column(
        db.Enum(MaterialTypeEnum, name="edu_material_type_enum"),
        nullable=False,
        index=True,
    )

    # File storage
    file_url: Mapped[Optional[str]] = mapped_column(db.String(512), nullable=True)

    # Metadata
    page_count: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)
    slide_count: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)

    learning_objectives: Mapped[Optional[list[str]]] = mapped_column(
        JSONB,
        nullable=True,
        comment='e.g. ["Learn Syntax", "Understand Loops"]',
    )

    description: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)
    file_size_mb: Mapped[Optional[float]] = mapped_column(db.Float, nullable=True)

    is_downloadable: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)
    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)


    # Global Analytics
    view_count: Mapped[int] = mapped_column(db.Integer, default=0)
    download_count: Mapped[int] = mapped_column(db.Integer, default=0)

    interactions: Mapped[list["StudentMaterialInteraction"]] = db.relationship(
        "StudentMaterialInteraction",
        back_populates="material",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("company_id", "course_id", "chapter_id", "title", name="uq_edu_materials_scope_title"),
        CheckConstraint("(page_count is null) OR (page_count >= 1)", name="ck_edu_material_page_min"),
        CheckConstraint("(slide_count is null) OR (slide_count >= 1)", name="ck_edu_material_slide_min"),
        CheckConstraint("(file_size_mb is null) OR (file_size_mb >= 0)", name="ck_edu_material_size_min"),
        Index("ix_edu_materials_company_course", "company_id", "course_id"),
    )


class StudentMaterialInteraction(BaseModel, TenantMixin):
    """
    One row per (user, material) to keep it simple:
      - favorite
      - per-user view/download counts
      - last seen / last downloaded timestamps
    """
    __tablename__ = "edu_material_interactions"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    material_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_favorite: Mapped[bool] = mapped_column(db.Boolean, default=False, nullable=False, index=True)

    view_count: Mapped[int] = mapped_column(db.Integer, default=0, nullable=False)
    download_count: Mapped[int] = mapped_column(db.Integer, default=0, nullable=False)

    last_viewed_at: Mapped[Optional[db.DateTime]] = mapped_column(db.DateTime(timezone=True), nullable=True)
    last_downloaded_at: Mapped[Optional[db.DateTime]] = mapped_column(db.DateTime(timezone=True), nullable=True)

    material: Mapped["Material"] = db.relationship("Material", back_populates="interactions", lazy="select")

    __table_args__ = (
        UniqueConstraint("company_id", "user_id", "material_id", name="uq_user_material_interaction"),
        Index("ix_interactions_company_user", "company_id", "user_id"),
        Index("ix_interactions_company_material", "company_id", "material_id"),
    )
