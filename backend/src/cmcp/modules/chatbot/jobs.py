from __future__ import annotations

from typing import Optional

from cmcp.config.database import db
from cmcp.modules.chatbot.models import ChatbotIndexJob
from cmcp.modules.materials.models import Material, MaterialTypeEnum

INDEXABLE_TYPES = {MaterialTypeEnum.PDF, MaterialTypeEnum.SLIDES, MaterialTypeEnum.DOC}


def is_indexable_material(material: Material) -> bool:
    if not material.is_enabled:
        return False
    if not material.file_url:
        return False
    return material.material_type in INDEXABLE_TYPES


def schedule_index_job(
    *,
    company_id: int,
    material_id: int,
    trigger_type: str,
    requested_by_user_id: Optional[int] = None,
    file_hash: Optional[str] = None,
) -> ChatbotIndexJob:
    job = ChatbotIndexJob(
        company_id=int(company_id),
        material_id=int(material_id),
        requested_by_user_id=requested_by_user_id,
        trigger_type=trigger_type,
        status="pending",
        file_hash=file_hash,
    )
    db.session.add(job)
    db.session.flush()
    return job


def schedule_index_for_material(
    material: Material,
    *,
    trigger_type: str,
    requested_by_user_id: Optional[int] = None,
) -> Optional[ChatbotIndexJob]:
    if not is_indexable_material(material):
        return None
    return schedule_index_job(
        company_id=int(material.company_id),
        material_id=int(material.id),
        trigger_type=trigger_type,
        requested_by_user_id=requested_by_user_id,
    )
