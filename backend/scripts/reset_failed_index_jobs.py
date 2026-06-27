#!/usr/bin/env python3
"""Reset failed chatbot index jobs and material index rows for retry."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp import create_app
    from cmcp.config.database import db
    from cmcp.config.settings import settings
    from cmcp.modules.chatbot.models import ChatbotIndexJob, ChatbotMaterialIndex

    app = create_app()
    company_id = int(settings.DEFAULT_COMPANY_ID or 1)

    with app.app_context():
        failed_jobs = ChatbotIndexJob.query.filter_by(company_id=company_id, status="failed").all()
        for job in failed_jobs:
            job.status = "pending"
            job.attempt_count = 0
            job.error_message = None
            job.started_at = None
            job.finished_at = None

        failed_indexes = ChatbotMaterialIndex.query.filter_by(
            company_id=company_id,
            index_status="failed",
        ).all()
        for row in failed_indexes:
            row.index_status = "pending"
            row.last_error = None

        db.session.commit()
        print(
            f"Reset {len(failed_jobs)} failed jobs and {len(failed_indexes)} failed material indexes."
        )
        print("Next step: python scripts/chatbot_index_worker.py")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
