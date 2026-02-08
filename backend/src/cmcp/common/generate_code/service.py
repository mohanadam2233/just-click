from __future__ import annotations

import re
from datetime import date
from typing import Optional, Dict, Any, Callable

from sqlalchemy import select
from sqlalchemy.orm import Session as SASession

from cmcp.config.database import db
from cmcp.common.cache.cache import get_or_build_detail
from cmcp.modules.University.models import CodeType, CodeCounter, CodeScopeEnum, ResetPolicyEnum, Company
from cmcp.common.generate_code.repo import get_code_type_by_prefix, get_or_create_counter_row


# -----------------------------------------------------------------------------
# CodeType cache
# -----------------------------------------------------------------------------
def _build_codetype_detail(prefix: str) -> Dict[str, Any]:
    ct = get_code_type_by_prefix(prefix)
    if not ct:
        return {"ok": False}
    return {
        "ok": True,
        "id": int(ct.id),
        "prefix": str(ct.prefix),
        "pattern": str(ct.pattern),
        "scope": str(ct.scope.value),
        "reset_policy": str(ct.reset_policy.value),
        "padding": int(ct.padding),
    }


def _get_codetype_cached(prefix: str) -> Optional[CodeType]:
    """
    Cache-safe:
      - If prefix missing and cached as not ok, we still re-check DB later.
    """
    d = get_or_build_detail(
        "codetype",
        prefix,
        builder=lambda: _build_codetype_detail(prefix),
        ttl=3600,
    )

    if not d:
        return get_code_type_by_prefix(prefix)

    if not d.get("ok"):
        # prefix might be added later after first request
        return get_code_type_by_prefix(prefix)

    return CodeType(
        id=d["id"],  # type: ignore[arg-type]
        prefix=d["prefix"],
        pattern=d["pattern"],
        scope=CodeScopeEnum(d["scope"]),
        reset_policy=ResetPolicyEnum(d["reset_policy"]),
        padding=d["padding"],
    )


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _period_key(reset: ResetPolicyEnum, today: Optional[date] = None) -> Optional[str]:
    dt = today or date.today()
    if reset == ResetPolicyEnum.YEARLY:
        return f"{dt.year}"
    if reset == ResetPolicyEnum.MONTHLY:
        return f"{dt.year}-{dt.month:02d}"
    return None


def _format_code(
    ct: CodeType,
    seq: int,
    today: Optional[date] = None,
    override_prefix: Optional[str] = None,
) -> str:
    dt = today or date.today()
    final_prefix = override_prefix if override_prefix is not None else ct.prefix

    tokens = {
        "PREFIX": final_prefix,
        "YYYY": f"{dt.year}",
        "MM": f"{dt.month:02d}",
        "SEQ": str(seq).zfill(int(ct.padding or 5)),
    }

    out = ct.pattern
    for k, v in tokens.items():
        out = out.replace(f"{{{k}}}", v)
    return out


def _resolve_partition(ct: CodeType, company_id: Optional[int]) -> Optional[int]:
    """
    Only GLOBAL and COMPANY exist now.
    """
    if ct.scope == CodeScopeEnum.GLOBAL:
        return None
    if ct.scope == CodeScopeEnum.COMPANY:
        if company_id is None:
            raise ValueError("company_id required for COMPANY scope")
        return int(company_id)

    # Defensive: if DB still has BRANCH from old enum, fail loudly
    raise ValueError(f"Unsupported scope {ct.scope!r}. Only GLOBAL and COMPANY are supported.")


def _parse_seq_from_code(ct: CodeType, code: str, override_prefix: Optional[str] = None) -> Optional[int]:
    final_prefix = override_prefix if override_prefix is not None else ct.prefix

    pat = re.escape(ct.pattern)
    pat = pat.replace(r"\{PREFIX\}", re.escape(final_prefix))
    pat = pat.replace(r"\{YYYY\}", r"\d{4}")
    pat = pat.replace(r"\{MM\}", r"\d{2}")
    pat = pat.replace(r"\{SEQ\}", r"(?P<seq>\d+)")
    m = re.fullmatch(pat, code.strip())
    if not m:
        return None
    try:
        return int(m.group("seq"))
    except Exception:
        return None


# -----------------------------------------------------------------------------
# Manual strict (manual code must be next in series)
# -----------------------------------------------------------------------------
def ensure_manual_code_is_next_and_bump(
    *,
    prefix: str,
    company_id: Optional[int],
    code: str,
    today: Optional[date] = None,
    session: Optional[SASession] = None,
) -> None:
    ct = _get_codetype_cached(prefix)
    if not ct:
        raise ValueError(f"Unknown code type prefix: {prefix}")

    part_company = _resolve_partition(ct, company_id)
    pk = _period_key(ct.reset_policy, today)
    sess = session or db.session

    stmt = (
        select(CodeCounter.last_sequence_number)
        .where(
            CodeCounter.code_type_id == ct.id,
            (CodeCounter.company_id.is_(None) if part_company is None else CodeCounter.company_id == part_company),
            (CodeCounter.period_key.is_(None) if pk is None else CodeCounter.period_key == pk),
        )
    )
    cur = sess.execute(stmt).scalar_one_or_none() or 0
    expected = int(cur) + 1

    seq = _parse_seq_from_code(ct, code)
    if seq is None:
        raise ValueError("Code does not match the configured pattern for this series.")
    if seq != expected:
        pad = int(ct.padding or 5)
        raise ValueError(f"Code must be the next in series ({expected:0{pad}d}).")

    row = get_or_create_counter_row(
        code_type_id=int(ct.id),
        company_id=part_company,
        period_key=pk,
        session=sess,
    )
    if int(row.last_sequence_number) < seq:
        row.last_sequence_number = seq
        sess.flush([row])


# -----------------------------------------------------------------------------
# Relaxed bump (useful for usernames or imported codes)
# -----------------------------------------------------------------------------
def bump_counter_to_at_least(
    *,
    prefix: str,
    company_id: Optional[int],
    code: str,
    today: Optional[date] = None,
    session: Optional[SASession] = None,
) -> None:
    ct = _get_codetype_cached(prefix)
    if not ct:
        raise ValueError(f"Unknown code type prefix: {prefix}")

    part_company = _resolve_partition(ct, company_id)
    pk = _period_key(ct.reset_policy, today)
    sess = session or db.session

    seq = _parse_seq_from_code(ct, code)
    if seq is None:
        raise ValueError("Code does not match the configured pattern for this series.")

    row = get_or_create_counter_row(
        code_type_id=int(ct.id),
        company_id=part_company,
        period_key=pk,
        session=sess,
    )
    if int(row.last_sequence_number) < seq:
        row.last_sequence_number = seq
        sess.flush([row])


# -----------------------------------------------------------------------------
# Generators
# -----------------------------------------------------------------------------
def generate_next_code(
    *,
    prefix: str,
    company_id: Optional[int],
    today: Optional[date] = None,
    session: Optional[SASession] = None,
) -> str:
    ct = _get_codetype_cached(prefix)
    if not ct:
        raise ValueError(f"Unknown code type prefix: {prefix}")

    part_company = _resolve_partition(ct, company_id)
    pk = _period_key(ct.reset_policy, today)
    sess = session or db.session

    row = get_or_create_counter_row(
        code_type_id=int(ct.id),
        company_id=part_company,
        period_key=pk,
        session=sess,
    )
    row.last_sequence_number = int(row.last_sequence_number) + 1
    seq = int(row.last_sequence_number)
    sess.flush([row])
    return _format_code(ct, seq, today)


def preview_next_code(
    *,
    prefix: str,
    company_id: Optional[int],
    today: Optional[date] = None,
    session: Optional[SASession] = None,
) -> str:
    ct = _get_codetype_cached(prefix)
    if not ct:
        raise ValueError(f"Unknown code type prefix: {prefix}")

    part_company = _resolve_partition(ct, company_id)
    pk = _period_key(ct.reset_policy, today)
    sess = session or db.session

    stmt = (
        select(CodeCounter.last_sequence_number)
        .where(
            CodeCounter.code_type_id == ct.id,
            (CodeCounter.company_id.is_(None) if part_company is None else CodeCounter.company_id == part_company),
            (CodeCounter.period_key.is_(None) if pk is None else CodeCounter.period_key == pk),
        )
    )
    cur = sess.execute(stmt).scalar_one_or_none() or 0
    return _format_code(ct, int(cur) + 1, today)


# -----------------------------------------------------------------------------
# Company-based username helpers
# -----------------------------------------------------------------------------
USERNAME_CODE_TYPE_PREFIX = "USERNAME"


def _company_prefix(company: Company) -> str:
    # you renamed "prefix" to "code" in your new Company model
    if not company or not company.code:
        raise ValueError("Company with a valid company.code is required.")
    return str(company.code).strip()


def generate_next_username_for_company(company: Company, today: Optional[date] = None) -> str:
    ct = _get_codetype_cached(USERNAME_CODE_TYPE_PREFIX)
    if not ct:
        raise ValueError(f"CodeType '{USERNAME_CODE_TYPE_PREFIX}' is not configured in the database.")

    pk = _period_key(ct.reset_policy, today)
    row = get_or_create_counter_row(
        code_type_id=int(ct.id),
        company_id=int(company.id),
        period_key=pk,
        session=db.session,
    )
    row.last_sequence_number = int(row.last_sequence_number) + 1
    seq = int(row.last_sequence_number)
    db.session.flush([row])
    return _format_code(ct, seq, today, override_prefix=_company_prefix(company))


def preview_next_username_for_company(company: Company, today: Optional[date] = None) -> str:
    ct = _get_codetype_cached(USERNAME_CODE_TYPE_PREFIX)
    if not ct:
        raise ValueError(f"CodeType '{USERNAME_CODE_TYPE_PREFIX}' is not configured.")

    pk = _period_key(ct.reset_policy, today)

    stmt = (
        select(CodeCounter.last_sequence_number)
        .where(
            CodeCounter.code_type_id == ct.id,
            CodeCounter.company_id == int(company.id),
            (CodeCounter.period_key.is_(None) if pk is None else CodeCounter.period_key == pk),
        )
    )
    cur = db.session.execute(stmt).scalar_one_or_none() or 0
    return _format_code(ct, int(cur) + 1, today, override_prefix=_company_prefix(company))


def bump_username_counter_for_company(company: Company, code: str, today: Optional[date] = None) -> None:
    ct = _get_codetype_cached(USERNAME_CODE_TYPE_PREFIX)
    if not ct:
        raise ValueError(f"CodeType '{USERNAME_CODE_TYPE_PREFIX}' is not configured.")

    seq = _parse_seq_from_code(ct, code, override_prefix=_company_prefix(company))
    if seq is None:
        raise ValueError("Username does not match the configured pattern for this series.")

    pk = _period_key(ct.reset_policy, today)
    row = get_or_create_counter_row(
        code_type_id=int(ct.id),
        company_id=int(company.id),
        period_key=pk,
        session=db.session,
    )
    if int(row.last_sequence_number) < seq:
        row.last_sequence_number = seq
        db.session.flush([row])
