from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Index
from sqlalchemy.orm import Mapped, mapped_column

from cmcp.config.database import db
from cmcp.common.models.base import BaseModel


class EmailOutboxStatus:
    PENDING = "pending"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"


class EmailOutbox(BaseModel):
    """
    Outbox pattern:
    - API writes rows here inside the same DB transaction as the business action
    - Worker sends emails later and updates status/tries/errors (retry-safe)
    """
    __tablename__ = "email_outbox"

    # who to send to
    to_email: Mapped[str] = mapped_column(db.String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(db.String(255), nullable=False)

    # template name like: "verify_email" or "approved"
    template: Mapped[str] = mapped_column(db.String(120), nullable=False, index=True)

    # JSON payload for template variables (store as stringified JSON)
    payload_json: Mapped[Optional[str]] = mapped_column(db.Text, nullable=True)

    # status / retry
    status: Mapped[str] = mapped_column(db.String(20), nullable=False, default=EmailOutboxStatus.PENDING, index=True)
    tries: Mapped[int] = mapped_column(db.Integer, nullable=False, default=0)
    last_error: Mapped[Optional[str]] = mapped_column(db.String(800), nullable=True)

    # anti-double-send lock (worker sets this when moving to SENDING)
    locked_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True), nullable=True)

    # optional references (recommended): helps debugging + resend verification
    ref_type: Mapped[Optional[str]] = mapped_column(db.String(50), nullable=True, index=True)   # e.g. "User"
    ref_id: Mapped[Optional[int]] = mapped_column(db.BigInteger, nullable=True, index=True)    # e.g. user.id

    # optional sender override (keep nullable)
    from_email: Mapped[Optional[str]] = mapped_column(db.String(255), nullable=True)
    from_name: Mapped[Optional[str]] = mapped_column(db.String(255), nullable=True)

    __table_args__ = (
        Index("ix_email_outbox_status_created", "status", "created_at"),
        Index("ix_email_outbox_template_status", "template", "status"),
        Index("ix_email_outbox_ref", "ref_type", "ref_id"),
        Index("ix_email_outbox_locked", "status", "locked_at"),
    )