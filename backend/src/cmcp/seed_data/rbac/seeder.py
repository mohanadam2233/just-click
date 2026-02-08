from __future__ import annotations

import logging
from typing import Dict, Iterable, List, Optional, Set, Tuple

from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from cmcp.modules.rbac.models import DocType, Action, Permission, Role, RolePermission

from .data import (
    DEFAULT_ACTIONS,
    DEFAULT_DOCTYPE_MAPPINGS,
    DEFAULT_ROLES,
    ROLE_PERMISSION_MAP,
    WILDCARD_DOCTYPE_NAME,
    WILDCARD_ACTION_NAME,
)

logger = logging.getLogger(__name__)


# ---------------- helpers ----------------
def _ensure_citext(db: Session) -> None:
    """
    Your models use CITEXT (Postgres). This is safe to call multiple times.
    If you are not on Postgres, you can delete this.
    """
    try:
        db.execute(text("CREATE EXTENSION IF NOT EXISTS citext;"))
    except Exception:
        pass


def _get_or_create(db: Session, model, *, defaults: Optional[dict] = None, **filters):
    obj = db.scalar(select(model).filter_by(**filters))
    if obj:
        return obj, False
    obj = model(**{**filters, **(defaults or {})})
    db.add(obj)
    try:
        db.flush([obj])
        return obj, True
    except IntegrityError:
        db.rollback()
        return db.scalar(select(model).filter_by(**filters)), False


def _label_from_action(name: str) -> str:
    return name.strip().replace("_", " ").title()


def _expand_manage(actions_index: Dict[str, Action]) -> List[str]:
    """
    MANAGE = CRUD + UPLOAD + DOWNLOAD (if these actions exist).
    """
    order = ["READ", "CREATE", "UPDATE", "DELETE", "UPLOAD", "DOWNLOAD"]
    return [a for a in order if a in actions_index]


def _expand_perm_strings(
    strings: Iterable[str],
    *,
    actions_index: Dict[str, Action],
    perm_index: Dict[Tuple[str, str], Permission],
) -> Set[int]:
    """
    Supports:
      "*:*" -> only the single wildcard permission
      "DocType:MANAGE" -> expands to READ/CREATE/UPDATE/DELETE/UPLOAD/DOWNLOAD
      "DocType:ACTION" -> exact
    """
    out: Set[int] = set()

    for s in strings:
        if ":" not in s:
            logger.warning("Skipping malformed permission string %r", s)
            continue

        raw_dt, raw_ac = s.split(":", 1)
        dt = raw_dt.strip()
        ac = raw_ac.strip().upper()

        # --- wildcard permission only ---
        if dt == WILDCARD_DOCTYPE_NAME and ac == WILDCARD_ACTION_NAME:
            p = perm_index.get((WILDCARD_DOCTYPE_NAME, WILDCARD_ACTION_NAME))
            if p:
                out.add(int(p.id))
            else:
                logger.warning("Missing (*:*) permission - check seed order.")
            continue

        # --- manage expansion ---
        if ac == "MANAGE":
            for base_ac in _expand_manage(actions_index):
                p = perm_index.get((dt, base_ac))
                if p:
                    out.add(int(p.id))
            continue

        # --- exact ---
        p = perm_index.get((dt, ac))
        if not p:
            logger.warning("Permission not found: %s", s)
            continue
        out.add(int(p.id))

    return out


# ---------------- seed steps ----------------
def _seed_actions(db: Session) -> Dict[str, Action]:
    logger.info("Seeding Actions...")
    idx: Dict[str, Action] = {}

    for name, description in DEFAULT_ACTIONS:
        upper = name.upper()
        a, _ = _get_or_create(
            db,
            Action,
            name=upper,
            defaults={
                "label": _label_from_action(upper),
                "description": description,
                "is_enabled": True,
            },
        )
        idx[upper] = a

    logger.info("✅ Actions seeded: %d", len(idx))
    return idx


def _seed_doctypes(db: Session) -> Dict[str, DocType]:
    logger.info("Seeding DocTypes...")

    # wildcard doctype
    _get_or_create(
        db,
        DocType,
        name=WILDCARD_DOCTYPE_NAME,
        defaults={"description": "Wildcard DocType", "is_enabled": True},
    )

    # flatten mappings into a unique list
    names: List[str] = []
    seen = set()

    for _, dts in DEFAULT_DOCTYPE_MAPPINGS.items():
        for n in dts:
            nn = n.strip()
            if not nn or nn in seen:
                continue
            seen.add(nn)
            names.append(nn)

    for name in names:
        _get_or_create(
            db,
            DocType,
            name=name,
            defaults={"description": None, "is_enabled": True},
        )

    all_dt = db.scalars(select(DocType)).all()
    idx = {str(d.name): d for d in all_dt}
    logger.info("✅ DocTypes seeded: %d", len(idx))
    return idx


def _seed_permissions(db: Session, actions_idx: Dict[str, Action], doctypes_idx: Dict[str, DocType]) -> Dict[Tuple[str, str], Permission]:
    logger.info("Seeding Permissions (DocType × Action)...")

    dt_w = doctypes_idx.get(WILDCARD_DOCTYPE_NAME)
    ac_w = actions_idx.get(WILDCARD_ACTION_NAME)

    # create perms for every doctype (except wildcard doctype) × every action (except wildcard action)
    for dt_name, dt in doctypes_idx.items():
        if dt_name == WILDCARD_DOCTYPE_NAME:
            continue

        for act_name, act in actions_idx.items():
            if act_name == WILDCARD_ACTION_NAME:
                continue

            exists = db.scalar(
                select(Permission).where(
                    Permission.doctype_id == dt.id,
                    Permission.action_id == act.id,
                )
            )
            if not exists:
                db.add(Permission(doctype_id=int(dt.id), action_id=int(act.id), is_enabled=True))

    # ensure single wildcard permission (*:*)
    if dt_w and ac_w:
        _get_or_create(
            db,
            Permission,
            doctype_id=int(dt_w.id),
            action_id=int(ac_w.id),
            defaults={"is_enabled": True},
        )

    all_perms = db.scalars(
        select(Permission).options(joinedload(Permission.doctype), joinedload(Permission.action))
    ).all()

    idx: Dict[Tuple[str, str], Permission] = {}
    for p in all_perms:
        idx[(str(p.doctype.name), str(p.action.name).upper())] = p

    logger.info("✅ Permissions seeded: %d", len(idx))
    return idx


def _seed_roles(db: Session) -> Dict[str, Role]:
    logger.info("Seeding Roles...")
    out: Dict[str, Role] = {}

    for r in DEFAULT_ROLES:
        role, _ = _get_or_create(
            db,
            Role,
            name=r["name"],
            defaults={"description": r.get("description"), "is_enabled": True},
        )
        out[str(role.name)] = role

    logger.info("✅ Roles seeded: %d", len(out))
    return out


def _seed_role_permissions(
    db: Session,
    roles_idx: Dict[str, Role],
    actions_idx: Dict[str, Action],
    perms_idx: Dict[Tuple[str, str], Permission],
) -> None:
    logger.info("Assigning Role → Permission mappings...")

    for role_name, perm_strings in ROLE_PERMISSION_MAP.items():
        role = roles_idx.get(role_name)
        if not role:
            logger.warning("Role not found: %s", role_name)
            continue

        desired_perm_ids = _expand_perm_strings(
            perm_strings,
            actions_index=actions_idx,
            perm_index=perms_idx,
        )
        if not desired_perm_ids:
            continue

        existing = db.scalars(select(RolePermission).where(RolePermission.role_id == role.id)).all()
        existing_ids = {int(x.permission_id) for x in existing}

        added = 0
        for pid in desired_perm_ids:
            if pid in existing_ids:
                continue
            db.add(RolePermission(role_id=int(role.id), permission_id=int(pid), is_allowed=True))
            added += 1

        logger.info("  %-15s -> +%d perms", role_name, added)

    logger.info("✅ Role permissions assigned.")


# ---------------- entrypoint ----------------
def seed_rbac(db: Session) -> None:
    """
    Seeds RBAC globals:
      Actions, DocTypes, Permissions, Roles, RolePermissions
    """
    logger.info("🚀 RBAC seed started")
    _ensure_citext(db)

    actions_idx = _seed_actions(db)
    doctypes_idx = _seed_doctypes(db)
    perms_idx = _seed_permissions(db, actions_idx, doctypes_idx)
    roles_idx = _seed_roles(db)
    _seed_role_permissions(db, roles_idx, actions_idx, perms_idx)

    logger.info("🎉 RBAC seed complete")
