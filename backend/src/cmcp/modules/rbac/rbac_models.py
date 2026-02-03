# app/apps/rbac/models.py
from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import CITEXT

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel, TenantMixin


class DocType(BaseModel):
    """
    Global DocType registry (shared by all companies).
    Examples: Material, Course, Chapter, Faculty, User
    Seed once.
    """
    __tablename__ = "doc_types"

    name: Mapped[str] = mapped_column(CITEXT(), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(db.Text)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        Index("ix_doctype_enabled", "is_enabled"),
    )


class Action(BaseModel):
    """
    Global actions (shared by all companies).
    Examples: READ, CREATE, UPDATE, DELETE, UPLOAD, DOWNLOAD
    Seed once.
    """
    __tablename__ = "actions"

    name: Mapped[str] = mapped_column(db.String(32), nullable=False, unique=True, index=True)  # "READ"
    label: Mapped[str] = mapped_column(db.String(64), nullable=False)                         # "Read"
    description: Mapped[Optional[str]] = mapped_column(db.Text)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        Index("ix_actions_enabled", "is_enabled"),
    )


class Permission(BaseModel):
    """
    Global permission matrix (doctype × action).
    Shared by all companies.
    Seed once.
    """
    __tablename__ = "permissions"

    doctype_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("doc_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("actions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("doctype_id", "action_id", name="uq_perm_doctype_action"),
        Index("ix_permissions_doctype", "doctype_id"),
        Index("ix_permissions_action", "action_id"),
    )


class Role(BaseModel):
    """
    Global roles (shared by all companies).
    Examples: Student, Teacher, Admin, Staff
    Seed once.
    """
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(CITEXT(), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(db.Text)

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        Index("ix_roles_enabled", "is_enabled"),
    )


class RolePermission(BaseModel):
    """
    Role permissions are also global (Role -> Permission).
    Seed once.
    """
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    permission_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("permissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_allowed: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_perm"),
        Index("ix_role_permissions_role", "role_id"),
        Index("ix_role_permissions_perm", "permission_id"),
    )


class UserRole(BaseModel, TenantMixin):
    """
    Assign a global role to a user *inside a company*.
    ✅ company_id stays here (TenantMixin) because role assignment is per university/company.
    """
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role_id: Mapped[int] = mapped_column(
        db.BigInteger,
        db.ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("company_id", "user_id", "role_id", name="uq_user_roles_company_user_role"),
        Index("ix_user_roles_company_user", "company_id", "user_id"),
        Index("ix_user_roles_company_role", "company_id", "role_id"),
    )
