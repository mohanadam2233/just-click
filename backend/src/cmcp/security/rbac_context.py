from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, List, Set

from sqlalchemy import select
from cmcp.config.database import db
from cmcp.modules.auth.models import User, UserAffiliation
from cmcp.modules.rbac.models import UserRole, Role
from cmcp.security.rbac_permissions import compute_permissions_for_role_ids


@dataclass(frozen=True)
class CompanyMini:
    company_id: int
    is_primary: bool
    is_company_owner: bool


@dataclass(frozen=True)
class AuthContext:
    user_id: int
    username: str
    user_type: str

    # system-wide bypass (User.is_system_owner OR Administrator role anywhere)
    is_system_owner: bool
    is_system_admin: bool

    companies: List[CompanyMini]
    active_company_id: Optional[int]

    roles: List[str]
    permissions: Set[str]

    # company-level full access (owner/admin)
    is_company_admin: bool


def _pick_active_company_id(companies: List[CompanyMini], requested: Optional[int]) -> Optional[int]:
    if requested is not None:
        return int(requested)
    primary = next((c for c in companies if c.is_primary), None)
    if primary:
        return int(primary.company_id)
    return int(companies[0].company_id) if companies else None


def _user_has_administrator_role(*, user_id: int) -> bool:
    """
    System-wide admin: if user has Role 'Administrator' in ANY company,
    treat them as system admin (scope bypass).
    """
    s = db.session
    q = (
        select(UserRole.id)
        .select_from(UserRole)
        .join(Role, Role.id == UserRole.role_id)
        .where(
            UserRole.user_id == int(user_id),
            UserRole.is_enabled.is_(True),
            Role.is_enabled.is_(True),
            Role.name == "Administrator",
        )
        .limit(1)
    )
    return bool(s.scalar(q))


def build_auth_context(*, user_id: int, company_id: Optional[int] = None) -> AuthContext:
    s = db.session
    user = s.scalar(select(User).where(User.id == int(user_id)))

    if not user or not user.is_enabled:
        return AuthContext(
            user_id=int(user_id),
            username="",
            user_type="unknown",
            is_system_owner=False,
            is_system_admin=False,
            companies=[],
            active_company_id=None,
            roles=[],
            permissions=set(),
            is_company_admin=False,
        )

    # affiliations
    affs = list(
        s.scalars(
            select(UserAffiliation).where(
                UserAffiliation.user_id == user.id,
                UserAffiliation.is_enabled.is_(True),
            )
        ).all()
    )

    companies: List[CompanyMini] = [
        CompanyMini(
            company_id=int(a.company_id),
            is_primary=bool(a.is_primary),
            is_company_owner=bool(getattr(a, "is_company_owner", False)),
        )
        for a in affs
    ]

    active_company_id = _pick_active_company_id(companies, company_id)

    # system owner flag
    is_system_owner = bool(getattr(user, "is_system_owner", False))
    is_system_admin = bool(is_system_owner) or _user_has_administrator_role(user_id=int(user.id))

    # System-wide: wildcard
    if is_system_admin:
        return AuthContext(
            user_id=int(user.id),
            username=str(user.username),
            user_type=str(user.user_type.value),
            is_system_owner=is_system_owner,
            is_system_admin=True,
            companies=companies,
            active_company_id=active_company_id,
            roles=["Administrator"] if not is_system_owner else ["System Owner"],
            permissions={"*"},
            is_company_admin=True,
        )

    # If no company selected, minimal context
    if active_company_id is None:
        return AuthContext(
            user_id=int(user.id),
            username=str(user.username),
            user_type=str(user.user_type.value),
            is_system_owner=False,
            is_system_admin=False,
            companies=companies,
            active_company_id=None,
            roles=[],
            permissions=set(),
            is_company_admin=False,
        )

    # roles for active company
    urs = list(
        s.scalars(
            select(UserRole).where(
                UserRole.user_id == user.id,
                UserRole.company_id == int(active_company_id),
                UserRole.is_enabled.is_(True),
            )
        ).all()
    )

    role_ids = [int(x.role_id) for x in urs]
    roles: List[str] = []
    if role_ids:
        role_rows = list(s.scalars(select(Role).where(Role.id.in_(role_ids), Role.is_enabled.is_(True))).all())
        role_by_id = {int(r.id): r for r in role_rows}
        roles = [str(role_by_id[rid].name) for rid in role_ids if rid in role_by_id]

    is_company_owner = any(c.company_id == int(active_company_id) and c.is_company_owner for c in companies)
    is_role_admin = any(r.lower() in ("admin", "super admin") for r in roles)

    if is_company_owner or is_role_admin:
        perms = {"*"}  # wildcard inside company
        is_company_admin = True
    else:
        perms = compute_permissions_for_role_ids(role_ids=role_ids)
        is_company_admin = False

    return AuthContext(
        user_id=int(user.id),
        username=str(user.username),
        user_type=str(user.user_type.value),
        is_system_owner=False,
        is_system_admin=False,
        companies=companies,
        active_company_id=int(active_company_id),
        roles=roles,
        permissions=perms,
        is_company_admin=is_company_admin,
    )
