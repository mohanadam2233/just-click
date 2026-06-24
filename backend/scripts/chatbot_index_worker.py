#!/usr/bin/env python3
"""Background worker that processes chatbot index jobs."""

from __future__ import annotations

import sys
import time
from pathlib import Path


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp.config.settings import settings
    from cmcp import create_app
    from cmcp.modules.chatbot.service import ChatbotService

    app = create_app()
    svc = ChatbotService()
    poll_seconds = int(settings.CHATBOT_INDEX_WORKER_POLL_SECONDS)

    print(f"Chatbot index worker started (poll every {poll_seconds}s)")

    while True:
        with app.app_context():
            from cmcp.config.database import db

            try:
                with db.session.begin():
                    job = svc.claim_next_index_job()
                    if not job:
                        pass
                    else:
                        svc.process_index_job(job)
                        print(
                            f"Job {job.id} material={job.material_id} "
                            f"status={job.status} attempts={job.attempt_count}"
                        )
            except Exception as exc:
                db.session.rollback()
                print(f"Worker error: {exc}")

        time.sleep(poll_seconds)


if __name__ == "__main__":
    raise SystemExit(main())
