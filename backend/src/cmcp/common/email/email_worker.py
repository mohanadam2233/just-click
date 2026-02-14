from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path

from cmcp.common.email.client import SMTPEmailClient
from cmcp.common.email.renderer import build_renderer, render_template
from cmcp.common.email.service import EmailService

log = logging.getLogger(__name__)


def run_email_worker_forever() -> None:
    provider = os.getenv("MAIL_PROVIDER", "smtp")

    from_email = os.getenv("MAIL_FROM_EMAIL", "")
    from_name = os.getenv("MAIL_FROM_NAME", "CMCP")

    max_tries = int(os.getenv("EMAIL_OUTBOX_MAX_TRIES", "5"))
    batch_size = int(os.getenv("EMAIL_OUTBOX_BATCH_SIZE", "50"))

    templates_dir = Path(__file__).resolve().parents[1] / "common" / "email" / "templates"
    env = build_renderer(templates_dir=str(templates_dir))

    smtp = SMTPEmailClient(
        host=os.getenv("SMTP_HOST", "smtp.gmail.com"),
        port=int(os.getenv("SMTP_PORT", "587")),
        username=os.getenv("SMTP_USERNAME", ""),
        password=os.getenv("SMTP_PASSWORD", ""),
        use_tls=True,
    )

    svc = EmailService(provider=provider, from_email=from_email, from_name=from_name, max_tries=max_tries)

    log.info("Email worker started (provider=%s, batch=%s)", provider, batch_size)

    while True:
        rows = svc.fetch_batch_for_sending(batch_size=batch_size)
        if not rows:
            time.sleep(2)
            continue

        for row in rows:
            try:
                payload = json.loads(row.payload_json or "{}")
                html = render_template(env, f"{row.template}.html", payload)

                smtp.send_html(
                    from_email=row.from_email or from_email,
                    from_name=row.from_name or from_name,
                    to_email=row.to_email,
                    subject=row.subject,
                    html_body=html,
                    text_body=None,
                )
                svc.mark_sent(row)
            except Exception as e:
                log.exception("Email send failed for outbox_id=%s", getattr(row, "id", None))
                svc.mark_failed(row, str(e))