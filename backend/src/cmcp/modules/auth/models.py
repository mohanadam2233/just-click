# app/apps/auth/models.py
from __future__ import annotations

from typing import Optional
from datetime import datetime
import enum

from sqlalchemy import UniqueConstraint, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel


class UserTypeEnum(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    STAFF = "staff"
    ADMIN = "admin"


class LinkedEntityTypeEnum(str, enum.Enum):
    STUDENT_PROFILE = "student_profile"
    STAFF_PROFILE = "staff_profile"


class User(BaseModel):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(db.String(150), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(db.String(255), nullable=False)

    user_type: Mapped[UserTypeEnum] = mapped_column(
        db.Enum(UserTypeEnum, name="user_type_enum"),
        nullable=False,
        index=True,
    )

    is_system_owner: Mapped[bool] = mapped_column(db.Boolean, default=False, nullable=False, index=True)

    last_login: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    affiliations: Mapped[list["UserAffiliation"]] = db.relationship(
        "UserAffiliation",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("username", name="uq_users_username"),
        Index("ix_users_enabled", "is_enabled"),
    )


class UserAffiliation(BaseModel):
    """
    Links a global User to a Company (University).
    Also links to the actual profile record (StudentProfile or StaffProfile) using polymorphic reference.
    """
    __tablename__ = "user_affiliations"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_primary: Mapped[bool] = mapped_column(db.Boolean, default=False, nullable=False, index=True)
    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    is_company_owner: Mapped[bool] = mapped_column(db.Boolean, default=False, nullable=False, index=True)

    # Polymorphic link to profile table
    linked_entity_type: Mapped[Optional[LinkedEntityTypeEnum]] = mapped_column(
        db.Enum(LinkedEntityTypeEnum, name="linked_entity_type_enum"),
        nullable=True,
        index=True,
    )
    linked_entity_id: Mapped[Optional[int]] = mapped_column(db.BigInteger, nullable=True, index=True)

    user: Mapped["User"] = db.relationship("User", back_populates="affiliations", lazy="select")

    __table_args__ = (
        UniqueConstraint("user_id", "company_id", name="uq_user_affiliation_user_company"),
        # If you set a type, you must set an id (and vice versa)
        CheckConstraint(
            "(linked_entity_type is null and linked_entity_id is null) OR "
            "(linked_entity_type is not null and linked_entity_id is not null)",
            name="ck_user_affiliation_linked_entity_pair",
        ),
        Index("ix_user_aff_company_user", "company_id", "user_id"),
    )
