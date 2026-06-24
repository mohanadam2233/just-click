#!/usr/bin/env python3
"""Queue index jobs for existing enabled materials with files."""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    backend_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(backend_root / "src"))

    from cmcp import create_app
    from cmcp.config.database import db
    from cmcp.config.settings import settings
    from cmcp.modules.chatbot.jobs import is_indexable_material, schedule_index_for_material
    from cmcp.modules.materials.models import Material

    app = create_app()
    company_id = int(settings.DEFAULT_COMPANY_ID or 1)

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
            schedule_index_for_material(material, trigger_type="system_reindex")
            queued += 1

        db.session.commit()
        print(f"Queued {queued} index jobs (skipped {skipped} non-indexable materials).")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
