from __future__ import annotations

import logging
import os
import time

from cmcp.config.database import db
from cmcp.common.email.service import EmailService

log = logging.getLogger(__name__)


def _load_create_app():
    """
    Try common app-factory import locations.
    Keep ONLY the one that matches your project.
    """
    try:
        # common: src/cmcp/app.py -> create_app()
        from cmcp.app import create_app  # type: ignore
        return create_app
    except Exception:
        pass

    try:
        # common: src/cmcp/__init__.py -> create_app()
        from cmcp import create_app  # type: ignore
        return create_app
    except Exception:
        pass

    try:
        # common: src/cmcp/wsgi.py -> app already created
        from cmcp.wsgi import app  # type: ignore
        return lambda: app
    except Exception:
        pass

    raise RuntimeError(
        "Could not import Flask app. Please update _load_create_app() to point to your create_app() or app."
    )


def run_email_worker_forever() -> None:
    create_app = _load_create_app()
    app = create_app()

    provider = os.getenv("MAIL_PROVIDER", "smtp")
    from_email = os.getenv("MAIL_FROM_EMAIL", "")
    from_name = os.getenv("MAIL_FROM_NAME", "CMCP")

    max_tries = int(os.getenv("EMAIL_OUTBOX_MAX_TRIES", "5"))
    batch_size = int(os.getenv("EMAIL_OUTBOX_BATCH_SIZE", "50"))

    with app.app_context():
        svc = EmailService(
            session=db.session,
            provider=provider,
            from_email=from_email,
            from_name=from_name,
            max_tries=max_tries,
        )

        log.info("Email worker started provider=%s batch_size=%s", provider, batch_size)

        while True:
            try:
                rows = svc.fetch_batch_for_sending(batch_size=batch_size)
                if not rows:
                    time.sleep(2)
                    continue

                for row in rows:
                    try:
                        svc.send_outbox_row_now(row)
                        db.session.commit()
                    except Exception:
                        # send_outbox_row_now already wrote last_error + status
                        db.session.commit()

            except Exception:
                log.exception("Email worker loop crashed; sleeping 3 seconds")
                try:
                    db.session.rollback()
                except Exception:
                    pass
                time.sleep(3)