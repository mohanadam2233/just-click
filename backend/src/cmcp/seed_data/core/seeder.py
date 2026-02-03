from __future__ import annotations

import logging
from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from cmcp.modules.auth.models import User, UserTypeEnum
from cmcp.common.security.passwords import hash_password
from cmcp.seed_data.core.data import SYSTEM_OWNER_USERS

logger = logging.getLogger(__name__)


# ------------------------------------------------------------
# helpers
# ------------------------------------------------------------
def _get_or_create(
    db: Session,
    model,
    *,
    defaults: Optional[dict] = None,
    **filters,
) -> Tuple[object, bool]:
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


def _safe_hash(plain: str) -> str:
    return hash_password(plain)



# ------------------------------------------------------------
# seeders
# ------------------------------------------------------------
def _seed_system_owner_users(db: Session) -> None:
    """
    Create global system owner users.
    ✅ No companies
    ✅ No affiliations
    ✅ No user_roles (role assignment is per company)
    """
    logger.info("Seeding system owner users...")

    for spec in SYSTEM_OWNER_USERS:
        username = spec["username"].strip()

        user, created = _get_or_create(
            db,
            User,
            username=username,
            defaults={
                "password_hash": _safe_hash(spec["password"]),
                "user_type": UserTypeEnum.ADMIN,   # sensible default for sys owner
                "is_system_owner": True,
                "is_enabled": True,
            },
        )

        # If user already existed, ensure flags are correct (idempotent seed)
        changed = False
        if getattr(user, "is_system_owner", False) is not True:
            user.is_system_owner = True
            changed = True
        if getattr(user, "is_enabled", True) is not True:
            user.is_enabled = True
            changed = True
        if getattr(user, "user_type", None) != UserTypeEnum.ADMIN:
            user.user_type = UserTypeEnum.ADMIN
            changed = True

        if changed:
            db.flush([user])

        logger.info("✅ %s system owner: %s", "Created" if created else "Ensured", username)

    logger.info("✅ System owner users seeded.")


# ------------------------------------------------------------
# PUBLIC ENTRY POINT (called by seed cli: seed core)
# ------------------------------------------------------------
def seed_core(db: Session) -> None:
    """
    CORE seeding only:
      - system owner users (platform admins)
      - optional: global sections

    ❌ No companies
    ❌ No affiliations
    ❌ No user_roles (company-scoped)
    """
    logger.info("🚀 Seeding CORE data...")

    _seed_system_owner_users(db)


    logger.info("🎉 Core seeding complete.")
