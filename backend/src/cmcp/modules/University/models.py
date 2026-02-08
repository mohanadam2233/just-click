# app/apps/application_org/models.py
from __future__ import annotations

from typing import Optional
from enum import Enum
from sqlalchemy import UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel

class CodeScopeEnum(str, Enum):
    GLOBAL = "GLOBAL"    # no company
    COMPANY = "COMPANY"  # per company



class ResetPolicyEnum(str, Enum):
    NEVER = "NEVER"
    YEARLY = "YEARLY"
    MONTHLY = "MONTHLY"
class Company(BaseModel):
    """
    Company == University / Institution (Tenant)
    Keep it minimal for CMCP.
    """
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(db.String(200), nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(
        db.String(30),
        nullable=True,
        index=True,
        comment="Short code, e.g. CMCP, UOS, etc."
    )

    contact_email: Mapped[Optional[str]] = mapped_column(db.String(255), nullable=True, index=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)

    country: Mapped[Optional[str]] = mapped_column(db.String(100), nullable=True, index=True)
    city: Mapped[Optional[str]] = mapped_column(db.String(100), nullable=True, index=True)

    logo_key: Mapped[Optional[str]] = mapped_column(
        db.String(512),
        nullable=True,
        comment="Object-storage key/path for logo",
        index=True,
    )

    timezone: Mapped[Optional[str]] = mapped_column(
        db.String(50),
        nullable=True,
        comment="IANA timezone string (e.g., Africa/Mogadishu)",
    )

    is_enabled: Mapped[bool] = mapped_column(db.Boolean, default=True, nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("name", name="uq_companies_name"),
        UniqueConstraint("code", name="uq_companies_code"),
    )

    def __repr__(self) -> str:
        return f"<Company id={self.id} name={self.name!r}>"

class CodeType(BaseModel):
    __tablename__ = "code_types"

    name: Mapped[str] = mapped_column(db.String(100), nullable=False, unique=True)
    prefix: Mapped[str] = mapped_column(db.String(50), nullable=False, unique=True, index=True)

    # Tokens: {PREFIX}, {YYYY}, {MM}, {SEQ}
    pattern: Mapped[str] = mapped_column(db.String(120), nullable=False, default="{PREFIX}-{SEQ}")

    scope: Mapped[CodeScopeEnum] = mapped_column(
        db.Enum(CodeScopeEnum, name="code_scope_enum"),
        nullable=False,
        default=CodeScopeEnum.COMPANY,
        index=True,
    )
    reset_policy: Mapped[ResetPolicyEnum] = mapped_column(
        db.Enum(ResetPolicyEnum, name="code_reset_policy_enum"),
        nullable=False,
        default=ResetPolicyEnum.NEVER,
        index=True,
    )
    padding: Mapped[int] = mapped_column(db.Integer, nullable=False, default=5)

    __table_args__ = (
        Index("ix_code_type_name_prefix", "name", "prefix"),
    )


class CodeCounter(BaseModel):
    """
    One row per (code_type, company partition, period_key).
    period_key:
      NEVER   -> NULL
      YEARLY  -> 'YYYY'
      MONTHLY -> 'YYYY-MM'
    """
    __tablename__ = "code_counters"

    code_type_id: Mapped[int] = mapped_column(
        db.BigInteger, db.ForeignKey("code_types.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Only used when scope == COMPANY, else NULL for GLOBAL series
    company_id: Mapped[Optional[int]] = mapped_column(
        db.BigInteger, db.ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True
    )

    period_key: Mapped[Optional[str]] = mapped_column(db.String(20), nullable=True, index=True)
    last_sequence_number: Mapped[int] = mapped_column(db.BigInteger, nullable=False, default=0)

    code_type: Mapped["CodeType"] = relationship("CodeType", lazy="joined")
    __table_args__ = (
        UniqueConstraint("code_type_id", "company_id", "period_key", name="uq_code_counter_partition"),
        Index("ix_code_counter_company", "company_id"),
    )

