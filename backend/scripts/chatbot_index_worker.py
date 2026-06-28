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
    from cmcp.modules.chatbot.models import ChatbotIndexJob
    from cmcp.modules.chatbot.service import ChatbotService

    app = create_app()
    svc = ChatbotService()
    poll_seconds = settings.CHATBOT_INDEX_WORKER_POLL_SECONDS

    print(f"Chatbot index worker started (poll every {poll_seconds}s)")

    while True:
        job_id = None
        with app.app_context():
            from cmcp.config.database import db

            try:
                with db.session.begin():
                    job = svc.claim_next_index_job()
                    if job:
                        job_id = int(job.id)
            except Exception as exc:
                db.session.rollback()
                print(f"Worker claim error: {exc}")

        if job_id:
            with app.app_context():
                from cmcp.config.database import db

                try:
                    svc.run_index_job(job_id)
                    job = db.session.get(ChatbotIndexJob, job_id)
                    if job:
                        print(
                            f"Job {job.id} material={job.material_id} "
                            f"status={job.status} attempts={job.attempt_count}"
                        )
                except Exception as exc:
                    db.session.rollback()
                    print(f"Worker index error: {exc}")

        time.sleep(poll_seconds)


if __name__ == "__main__":
    raise SystemExit(main())
