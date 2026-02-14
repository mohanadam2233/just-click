from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from cmcp.config.database import db
from cmcp.common.email.outbox_model import EmailOutbox, EmailOutboxStatus


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class EmailService:
    def __init__(
        self,
        *,
        session: Optional[Session] = None,
        provider: str,
        from_email: str,
        from_name: Optional[str] = None,
        max_tries: int = 5,
    ):
        self.s = session or db.session
        self.provider = provider
        self.from_email = from_email
        self.from_name = from_name
        self.max_tries = int(max_tries)

    def enqueue(self, *, to_email: str, subject: str, template: str, payload: Dict[str, Any],
                ref_type: Optional[str] = None, ref_id: Optional[int] = None,
                from_email: Optional[str] = None, from_name: Optional[str] = None) -> EmailOutbox:
        row = EmailOutbox(
            to_email=to_email,
            subject=subject,
            template=template,
            payload_json=json.dumps(payload or {}, ensure_ascii=False),
            status=EmailOutboxStatus.PENDING,
            tries=0,
            ref_type=ref_type,
            ref_id=ref_id,
            from_email=from_email,
            from_name=from_name,
        )
        self.s.add(row)
        self.s.commit()
        return row

    def fetch_batch_for_sending(self, *, batch_size: int = 50) -> List[EmailOutbox]:
        rows = (
            self.s.query(EmailOutbox)
            .filter(EmailOutbox.status == EmailOutboxStatus.PENDING)
            .order_by(EmailOutbox.created_at.asc())
            .limit(int(batch_size))
            .all()
        )
        if not rows:
            return []

        now = _utcnow()
        for r in rows:
            r.status = EmailOutboxStatus.SENDING
            r.locked_at = now
        self.s.commit()
        return rows

    def mark_sent(self, row: EmailOutbox) -> None:
        row.status = EmailOutboxStatus.SENT
        row.sent_at = _utcnow()
        row.last_error = None
        self.s.commit()

    def mark_failed(self, row: EmailOutbox, err: str) -> None:
        row.tries = int(row.tries or 0) + 1
        row.last_error = (err or "")[:800]
        if row.tries >= self.max_tries:
            row.status = EmailOutboxStatus.FAILED
        else:
            row.status = EmailOutboxStatus.PENDING
            row.locked_at = None
        self.s.commit()