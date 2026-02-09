from __future__ import annotations

from typing import List, Set

from sqlalchemy import select
from cmcp.config.database import db
from cmcp.modules.rbac.models import RolePermission, Permission, DocType, Action

WILDCARD = "*"


def compute_permissions_for_role_ids(*, role_ids: List[int]) -> Set[str]:
    """
    Returns permission strings:
      {"Material:READ", "Course:CREATE", ...} or {"*"} wildcard.

    Notes:
    - If seed uses "*:*", normalize it to {"*"}.
    - Keep "Doctype:MANAGE" as-is; rbac_guards expands it at check-time.
    """
    if not role_ids:
        return set()

    s = db.session
    q = (
        select(DocType.name, Action.name)
        .select_from(RolePermission)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .join(DocType, DocType.id == Permission.doctype_id)
        .join(Action, Action.id == Permission.action_id)
        .where(
            RolePermission.role_id.in_(role_ids),
            RolePermission.is_enabled.is_(True),
            RolePermission.is_allowed.is_(True),
            Permission.is_enabled.is_(True),
            DocType.is_enabled.is_(True),
            Action.is_enabled.is_(True),
        )
    )

    perms: Set[str] = set()
    for dt_name, act_name in s.execute(q).all():
        dt = str(dt_name).strip()
        act = str(act_name).strip().upper()

        # normalize "*:*" to "*"
        if dt == WILDCARD and act == WILDCARD:
            perms.add(WILDCARD)
            continue

        perms.add(f"{dt}:{act}")
    return perms
