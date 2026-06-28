from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.common.models.base import BaseModel, TenantMixin
from cmcp.config.database import db


class ChatbotMaterialIndex(BaseModel, TenantMixin):
    __tablename__ = "chatbot_material_indexes"

    material_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_hash: Mapped[str] = mapped_column(db.String(64), nullable=False, index=True)
    chunk_count: Mapped[int] = mapped_column(db.Integer, default=0, nullable=False)
    semester_label: Mapped[str] = mapped_column(db.String(80), nullable=False, index=True)
    subject_name: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(db.String(255), nullable=False)

    course_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_offering_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_course_offerings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    chapter_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_course_chapters.id", ondelete="SET NULL"), nullable=True, index=True
    )
    semester_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_semesters.id", ondelete="SET NULL"), nullable=True, index=True
    )
    department_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_departments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    faculty_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_faculties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_year_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_academic_years.id", ondelete="SET NULL"), nullable=True, index=True
    )

    embedding_provider: Mapped[Optional[str]] = mapped_column(db.String(80), nullable=True)
    embedding_model: Mapped[Optional[str]] = mapped_column(db.String(120), nullable=True)
    embedding_dimension: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)
    chunk_size: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)
    chunk_overlap: Mapped[Optional[int]] = mapped_column(db.Integer, nullable=True)

    index_status: Mapped[str] = mapped_column(db.String(20), default="pending", nullable=False, index=True)
    indexed_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    material: Mapped["Material"] = db.relationship("Material", lazy="select")

    __table_args__ = (
        UniqueConstraint("company_id", "material_id", name="uq_chatbot_index_company_material"),
        Index("ix_chatbot_index_company_subject", "company_id", "semester_label", "subject_name"),
        Index("ix_chatbot_index_company_status", "company_id", "index_status"),
        Index("ix_chatbot_index_company_offering", "company_id", "course_offering_id"),
        Index("ix_chatbot_index_company_chapter", "company_id", "chapter_id"),
    )


class ChatSession(BaseModel, TenantMixin):
    __tablename__ = "chatbot_sessions"

    id: Mapped[str] = mapped_column(db.String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    semester_label: Mapped[str] = mapped_column(db.String(80), nullable=False, index=True)
    subject_name: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    title: Mapped[Optional[str]] = mapped_column(db.String(255), nullable=True)

    material_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_materials.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_offering_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_course_offerings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    chapter_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_course_chapters.id", ondelete="SET NULL"), nullable=True, index=True
    )
    semester_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_semesters.id", ondelete="SET NULL"), nullable=True, index=True
    )
    department_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_departments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    faculty_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_faculties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_year_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("edu_academic_years.id", ondelete="SET NULL"), nullable=True, index=True
    )

    scope: Mapped[str] = mapped_column(db.String(30), default="material", nullable=False)
    context_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    vector_filter_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    messages: Mapped[list["ChatMessage"]] = db.relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="ChatMessage.created_at.asc()",
    )

    __table_args__ = (
        Index("ix_chatbot_sessions_company_user", "company_id", "user_id"),
    )


class ChatMessage(BaseModel, TenantMixin):
    __tablename__ = "chatbot_messages"

    session_id: Mapped[str] = mapped_column(
        db.String(64),
        db.ForeignKey("chatbot_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role_name: Mapped[str] = mapped_column(db.String(20), nullable=False, index=True)
    message_text: Mapped[str] = mapped_column(db.Text, nullable=False)

    session: Mapped["ChatSession"] = db.relationship(
        "ChatSession",
        back_populates="messages",
        lazy="select",
    )

    __table_args__ = (
        Index("ix_chatbot_messages_company_session", "company_id", "session_id"),
    )


class ChatbotIndexJob(BaseModel, TenantMixin):
    __tablename__ = "chatbot_index_jobs"

    material_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("edu_materials.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requested_by_user_id: Mapped[Optional[int]] = mapped_column(db.BigInteger, nullable=True, index=True)

    trigger_type: Mapped[str] = mapped_column(db.String(30), nullable=False, index=True)
    status: Mapped[str] = mapped_column(db.String(20), default="pending", nullable=False, index=True)
    attempt_count: Mapped[int] = mapped_column(db.Integer, default=0, nullable=False)

    file_hash: Mapped[Optional[str]] = mapped_column(db.String(64), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True), nullable=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    __table_args__ = (
        Index("ix_chatbot_jobs_company_status", "company_id", "status"),
        Index("ix_chatbot_jobs_company_material", "company_id", "material_id"),
    )
