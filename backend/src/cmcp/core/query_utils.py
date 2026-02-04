from __future__ import annotations

from math import ceil
from typing import Any, Dict, Mapping, Optional, Sequence, List, Tuple

from sqlalchemy import and_, or_, asc, desc, func, select
from sqlalchemy.sql import Select
from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.orm import Session


# -------------------------
# Helpers
# -------------------------
def _is_col(x: Any) -> bool:
    return isinstance(x, InstrumentedAttribute) or hasattr(x, "ilike") or hasattr(x, "like")


def _safe_str(v: Any) -> str:
    return ("" if v is None else str(v)).strip()


def _escape_like(term: str) -> str:
    """
    Escape LIKE wildcards so searching for '%' doesn't match everything.
    """
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _parse_bool(v: Any) -> Any:
    if isinstance(v, str):
        lv = v.strip().lower()
        if lv in ("true", "1", "yes", "y", "on"):
            return True
        if lv in ("false", "0", "no", "n", "off"):
            return False
    return v


# -------------------------
# Search
# -------------------------
def apply_search(stmt: Select, columns: Sequence[Any], q: Optional[str]) -> Select:
    """
    Basic "q" search across given columns (ILIKE).
    - Splits by spaces -> ALL tokens must match (AND of OR groups)
    """
    q = _safe_str(q)
    if not q:
        return stmt

    cols = [c for c in (columns or []) if _is_col(c)]
    if not cols:
        return stmt

    # token search: "python intro" => both tokens must match somewhere
    tokens = [t for t in q.split() if t.strip()]
    if not tokens:
        return stmt

    groups = []
    for t in tokens:
        term = f"%{_escape_like(t)}%"
        ors = []
        for c in cols:
            if hasattr(c, "ilike"):
                ors.append(c.ilike(term, escape="\\"))  # Postgres supports escape
            elif hasattr(c, "like"):
                ors.append(c.like(term, escape="\\"))
        if ors:
            groups.append(or_(*ors))

    if not groups:
        return stmt

    return stmt.where(and_(*groups))


# -------------------------
# Sort
# -------------------------
def apply_sort(
    stmt: Select,
    *,
    sort_key: Optional[str],
    sort_order: Optional[str],
    sort_fields: Dict[str, Any],
    default_sort: Optional[List[Any]] = None,
) -> Select:
    if sort_fields is None:
        sort_fields = {}

    # user sort
    sk = _safe_str(sort_key)
    if sk and sk in sort_fields:
        col = sort_fields[sk]
        direction = desc if _safe_str(sort_order).lower() == "desc" else asc
        return stmt.order_by(direction(col))

    # default sort list
    if default_sort:
        for s in default_sort:
            stmt = stmt.order_by(s)
        return stmt

    # fallback
    if "created_at" in sort_fields:
        return stmt.order_by(desc(sort_fields["created_at"]))
    if "id" in sort_fields:
        return stmt.order_by(desc(sort_fields["id"]))

    # last resort: first allowed field desc
    if sort_fields:
        first = next(iter(sort_fields.values()))
        return stmt.order_by(desc(first))

    return stmt


# -------------------------
# Filters
# -------------------------
def apply_filters(
    stmt: Select,
    *,
    filters: Optional[Mapping[str, Any]],
    allowed: Optional[Dict[str, Any]],
) -> Select:
    """
    filters examples:
      {"is_enabled": True}
      {"semester_id": ["=", 2]}
      {"title": ["ilike", "python"]}
      {"id": ["in", [1,2,3]]}
      {"deleted_at": ["is", None]}  -> IS NULL
      {"deleted_at": ["not", None]} -> IS NOT NULL

    Only fields in `allowed` are applied.
    """
    if not filters or not allowed:
        return stmt

    conds = []

    for field, raw in filters.items():
        col = allowed.get(field)
        if col is None:
            continue

        # normalize (op, val)
        if isinstance(raw, (list, tuple)) and len(raw) == 2:
            op, val = raw
        else:
            op, val = "=", raw

        op = _safe_str(op).lower()
        val = _parse_bool(val)

        # Operators
        def _as_list(v: Any) -> List[Any]:
            if isinstance(v, (list, tuple, set)):
                return list(v)
            return [v]

        ops = {
            "=": lambda c, v: c == v,
            "!=": lambda c, v: c != v,
            ">": lambda c, v: c > v,
            "<": lambda c, v: c < v,
            ">=": lambda c, v: c >= v,
            "<=": lambda c, v: c <= v,
            "in": lambda c, v: c.in_(_as_list(v)),
            "not in": lambda c, v: ~c.in_(_as_list(v)),
            "like": lambda c, v: c.like(f"%{_escape_like(_safe_str(v))}%", escape="\\"),
            "ilike": lambda c, v: c.ilike(f"%{_escape_like(_safe_str(v))}%", escape="\\")
            if hasattr(c, "ilike")
            else c.like(f"%{_escape_like(_safe_str(v))}%", escape="\\"),
            "startswith": lambda c, v: c.ilike(f"{_escape_like(_safe_str(v))}%", escape="\\")
            if hasattr(c, "ilike")
            else c.like(f"{_escape_like(_safe_str(v))}%", escape="\\"),
            "endswith": lambda c, v: c.ilike(f"%{_escape_like(_safe_str(v))}", escape="\\")
            if hasattr(c, "ilike")
            else c.like(f"%{_escape_like(_safe_str(v))}", escape="\\"),
            # NULL checks
            "is": lambda c, v: c.is_(v),
            "not": lambda c, v: c.is_not(v),
            "is null": lambda c, v: c.is_(None),
            "not null": lambda c, v: c.is_not(None),
        }

        fn = ops.get(op)
        if fn:
            try:
                conds.append(fn(col, val))
            except Exception:
                # ignore invalid comparisons (fail-safe)
                continue

    if conds:
        stmt = stmt.where(and_(*conds))
    return stmt


# -------------------------
# Pagination
# -------------------------
def paginate(
    session: Session,
    stmt: Select,
    *,
    page: int = 1,
    page_size: int = 20,
    max_page_size: int = 500,
) -> Tuple[List[Any], Dict[str, Any]]:
    """
    Execute paginated query and return (items, meta)

    meta includes:
      page, page_size, total, total_pages,
      from, to, has_next, has_prev
    """
    # clamp inputs
    try:
        page = int(page)
    except Exception:
        page = 1
    try:
        page_size = int(page_size)
    except Exception:
        page_size = 20

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 1
    if page_size > max_page_size:
        page_size = max_page_size

    # total count (remove ORDER BY for count)
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = int(session.execute(count_stmt).scalar_one() or 0)

    total_pages = max(1, ceil(total / page_size)) if total > 0 else 1
    if page > total_pages:
        page = total_pages

    offset = (page - 1) * page_size
    items = list(session.execute(stmt.limit(page_size).offset(offset)).scalars().all())

    start = offset + 1 if total > 0 else 0
    end = min(offset + len(items), total) if total > 0 else 0

    meta = {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "from": start,
        "to": end,
        "has_prev": page > 1,
        "has_next": page < total_pages,
    }
    return items, meta
