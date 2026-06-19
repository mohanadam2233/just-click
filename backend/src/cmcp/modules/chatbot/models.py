from __future__ import annotations

from typing import Optional

from sqlalchemy import Index, UniqueConstraint
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

    material: Mapped["Material"] = db.relationship("Material", lazy="select")

    __table_args__ = (
        UniqueConstraint("company_id", "material_id", name="uq_chatbot_index_company_material"),
        Index("ix_chatbot_index_company_subject", "company_id", "semester_label", "subject_name"),
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

