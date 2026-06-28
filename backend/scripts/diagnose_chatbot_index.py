#!/usr/bin/env python3
"""Print chatbot indexing diagnostics without mutating data."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp import create_app
    from cmcp.config.settings import settings
    from cmcp.modules.chatbot.jobs import is_indexable_material
    from cmcp.modules.chatbot.models import ChatbotIndexJob, ChatbotMaterialIndex
    from cmcp.modules.chatbot.rag.embeddings import embedding_model_ready
    from cmcp.modules.chatbot.rag.extractor import material_filename
    from cmcp.modules.materials.models import Material

    app = create_app()
    company_id = int(settings.DEFAULT_COMPANY_ID or 1)

    with app.app_context():
        print(f"Collection: {settings.CHATBOT_COLLECTION_NAME}")
        print(f"Embedding model ready: {embedding_model_ready()}")

        jobs = ChatbotIndexJob.query.filter_by(company_id=company_id).all()
        by_status: dict[str, int] = {}
        for job in jobs:
            by_status[job.status] = by_status.get(job.status, 0) + 1
        print(f"Index jobs: {by_status or 'none'}")

        indexes = ChatbotMaterialIndex.query.filter_by(company_id=company_id).all()
        idx_status: dict[str, int] = {}
        for row in indexes:
            idx_status[row.index_status] = idx_status.get(row.index_status, 0) + 1
        print(f"Material indexes: {idx_status or 'none'}")

        pending_jobs = (
            ChatbotIndexJob.query.filter_by(company_id=company_id, status="pending")
            .order_by(ChatbotIndexJob.created_at.asc())
            .limit(5)
            .all()
        )
        if pending_jobs:
            print("Next pending jobs:")
            for job in pending_jobs:
                print(
                    f"  job={job.id} material={job.material_id} "
                    f"trigger={job.trigger_type} attempts={job.attempt_count} "
                    f"error={job.error_message or '-'}"
                )

        failed_indexes = (
            ChatbotMaterialIndex.query.filter_by(company_id=company_id, index_status="failed")
            .order_by(ChatbotMaterialIndex.updated_at.desc())
            .limit(10)
            .all()
        )
        if failed_indexes:
            print("Recent failed indexes:")
            for row in failed_indexes:
                print(f"  material={row.material_id} error={row.last_error}")

        ppt = pptx = pdf = 0
        materials = Material.query.filter_by(company_id=company_id, is_enabled=True).all()
        for material in materials:
            if not is_indexable_material(material):
                continue
            name = material_filename(material).lower()
            if name.endswith(".ppt") and not name.endswith(".pptx"):
                ppt += 1
            elif name.endswith(".pptx"):
                pptx += 1
            elif name.endswith(".pdf"):
                pdf += 1
        print(f"Indexable file mix: legacy_ppt={ppt} pptx={pptx} pdf={pdf}")

        if by_status.get("pending", 0) > 0:
            print("Worker is probably not running. Start it with:")
            print("  python scripts/chatbot_index_worker.py")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
