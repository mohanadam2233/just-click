from __future__ import annotations

from typing import Dict, List

from sqlalchemy import select
from cmcp.config.database import db
from cmcp.modules.rbac.models import DocType, Role, RolePermission, Permission, Action
from cmcp.modules.rbac.schemas import DocPermissionOut


class PermissionMatrixService:
    def get_matrix_for_doctype(self, *, doctype_name: str) -> List[DocPermissionOut]:
        s = db.session

        dt = s.scalar(select(DocType).where(DocType.name == doctype_name, DocType.is_enabled.is_(True)))
        if not dt:
            return []

        roles = list(s.scalars(select(Role).where(Role.is_enabled.is_(True)).order_by(Role.name)).all())
        if not roles:
            return []

        # Single query: role_id + action_name for this doctype
        q = (
            select(RolePermission.role_id, Action.name)
            .select_from(RolePermission)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .join(Action, Action.id == Permission.action_id)
            .where(
                Permission.doctype_id == dt.id,
                RolePermission.is_enabled.is_(True),
                RolePermission.is_allowed.is_(True),
                Permission.is_enabled.is_(True),
                Action.is_enabled.is_(True),
            )
        )

        matrix: Dict[int, Dict[str, bool]] = {int(r.id): {} for r in roles}
        for rid, act in s.execute(q).all():
            rid = int(rid)
            if rid in matrix:
                matrix[rid][str(act).upper()] = True

        out: List[DocPermissionOut] = []
        for r in roles:
            acts = matrix.get(int(r.id), {})
            out.append(
                DocPermissionOut(
                    role=str(r.name),
                    level=0,
                    can_read=acts.get("READ", False),
                    can_create=acts.get("CREATE", False),
                    can_write=acts.get("UPDATE", False),
                    can_delete=acts.get("DELETE", False),
                    can_upload=acts.get("UPLOAD", False),
                    can_download=acts.get("DOWNLOAD", False),
                )
            )
        return out


permission_matrix_service = PermissionMatrixService()
