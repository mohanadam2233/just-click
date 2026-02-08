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

    # global super power
    is_system_owner: bool

    # all enabled affiliations
    companies: List[CompanyMini]

    # chosen company for this request
    active_company_id: Optional[int]

    # role names within active_company_id
    roles: List[str]

    # permissions like {"Material:READ", ...} or {"*"} wildcard
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


def build_auth_context(*, user_id: int, company_id: Optional[int] = None) -> AuthContext:
    """
    Build context for one request.
    If company_id not provided, uses primary affiliation, else first affiliation.
    """
    s = db.session
    user = s.scalar(select(User).where(User.id == int(user_id)))
    if not user or not user.is_enabled:
        return AuthContext(
            user_id=int(user_id),
            username="",
            user_type="unknown",
            is_system_owner=False,
            companies=[],
            active_company_id=None,
            roles=[],
            permissions=set(),
            is_company_admin=False,
        )

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

    # If system owner: wildcard permissions everywhere (scope check bypass)
    if bool(getattr(user, "is_system_owner", False)):
        return AuthContext(
            user_id=int(user.id),
            username=str(user.username),
            user_type=str(user.user_type.value),
            is_system_owner=True,
            companies=companies,
            active_company_id=active_company_id,
            roles=["System Owner"],
            permissions={"*"},
            is_company_admin=True,
        )

    # If no company selected, keep minimal
    if active_company_id is None:
        return AuthContext(
            user_id=int(user.id),
            username=str(user.username),
            user_type=str(user.user_type.value),
            is_system_owner=False,
            companies=companies,
            active_company_id=None,
            roles=[],
            permissions=set(),
            is_company_admin=False,
        )

    # roles for this company
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
    roles = []
    if role_ids:
        role_rows = list(
            s.scalars(select(Role).where(Role.id.in_(role_ids), Role.is_enabled.is_(True))).all()
        )
        role_by_id = {int(r.id): r for r in role_rows}
        roles = [str(role_by_id[rid].name) for rid in role_ids if rid in role_by_id]

    # company owner => wildcard inside company
    is_company_owner = any(c.company_id == int(active_company_id) and c.is_company_owner for c in companies)

    # also treat Role name "Admin" as company admin (optional, but useful)
    is_role_admin = any(r.lower() == "admin" for r in roles)

    if is_company_owner or is_role_admin:
        perms = {"*"}
        is_company_admin = True
    else:
        perms = compute_permissions_for_role_ids(role_ids=role_ids)
        is_company_admin = False

    return AuthContext(
        user_id=int(user.id),
        username=str(user.username),
        user_type=str(user.user_type.value),
        is_system_owner=False,
        companies=companies,
        active_company_id=int(active_company_id),
        roles=roles,
        permissions=perms,
        is_company_admin=is_company_admin,
    )
