#!/usr/bin/env python3
"""Queue bulk reindex jobs for existing enabled materials with files."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--company-id",
        type=int,
        default=None,
        help="Company ID to reindex (defaults to DEFAULT_COMPANY_ID or 1)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show how many jobs would be queued without writing to the database",
    )
    args = parser.parse_args()

    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp import create_app
    from cmcp.config.database import db
    from cmcp.config.settings import settings
    from cmcp.modules.chatbot.jobs import is_indexable_material, schedule_index_for_material
    from cmcp.modules.materials.models import Material

    app = create_app()
    company_id = int(args.company_id or settings.DEFAULT_COMPANY_ID or 1)

    with app.app_context():
        materials = Material.query.filter(
            Material.company_id == company_id,
            Material.is_enabled.is_(True),
            Material.file_url.is_not(None),
        ).order_by(Material.id.asc()).all()

        queued = 0
        skipped = 0
        for material in materials:
            if not is_indexable_material(material):
                skipped += 1
                continue
            queued += 1
            if not args.dry_run:
                schedule_index_for_material(material, trigger_type="bulk_reindex")

        if not args.dry_run:
            db.session.commit()

        print(
            f"{'Would queue' if args.dry_run else 'Queued'} up to {queued} bulk reindex jobs "
            f"(skipped {skipped} non-indexable materials; active jobs are reused automatically)."
        )
        print("Next step: run the worker in another terminal:")
        print("  python scripts/chatbot_index_worker.py")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
