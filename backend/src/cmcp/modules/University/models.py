# app/apps/application_org/models.py
from __future__ import annotations

from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel


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
