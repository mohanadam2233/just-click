# app/core/query_utils.py
from __future__ import annotations

from typing import Any, Dict, Iterable, Optional, Sequence, List, Tuple
from sqlalchemy import and_, or_, asc, desc
from sqlalchemy.sql import Select
from sqlalchemy.orm.attributes import InstrumentedAttribute


def _is_col(x: Any) -> bool:
    return isinstance(x, InstrumentedAttribute) or hasattr(x, "ilike") or hasattr(x, "like")


def apply_search(stmt: Select, columns: Sequence[Any], q: Optional[str]) -> Select:
    if not q:
        return stmt
    like_expr = f"%{q.strip()}%"
    cols = [c for c in (columns or []) if _is_col(c) and hasattr(c, "ilike")]
    if not cols:
        return stmt
    return stmt.where(or_(*[c.ilike(like_expr) for c in cols]))


def apply_sort(
    stmt: Select,
    *,
    sort_key: Optional[str],
    sort_order: Optional[str],
    sort_fields: Dict[str, Any],
    default_sort: Optional[List[Any]] = None,
) -> Select:
    # user sort
    if sort_key and sort_key in (sort_fields or {}):
        col = sort_fields[sort_key]
        direction = desc if (sort_order or "").lower() == "desc" else asc
        return stmt.order_by(direction(col))

    # default sort
    if default_sort:
        for s in default_sort:
            stmt = stmt.order_by(s)
        return stmt

    # fallback
    if "created_at" in (sort_fields or {}):
        return stmt.order_by(desc(sort_fields["created_at"]))
    if "id" in (sort_fields or {}):
        return stmt.order_by(desc(sort_fields["id"]))

    # last resort: first field desc
    if sort_fields:
        first = next(iter(sort_fields.values()))
        return stmt.order_by(desc(first))
    return stmt


def apply_filters(
    stmt: Select,
    *,
    filters: Optional[Dict[str, Any]],
    allowed: Optional[Dict[str, Any]],
) -> Select:
    """
    filters format examples:
      {"is_enabled": True}
      {"semester_id": ["=", 2]}
      {"title": ["like", "python"]}
      {"id": ["in", [1,2,3]]}
    """
    if not filters or not allowed:
        return stmt

    conds = []
    for field, raw in filters.items():
        col = allowed.get(field)
        if col is None:
            continue

        if isinstance(raw, (list, tuple)) and len(raw) == 2:
            op, val = raw
        else:
            op, val = "=", raw

        op = (op or "=").strip().lower()

        # bool strings
        if isinstance(val, str):
            lv = val.strip().lower()
            if lv in ("true", "false"):
                val = (lv == "true")

        ops = {
            "=": lambda c, v: c == v,
            "!=": lambda c, v: c != v,
            ">": lambda c, v: c > v,
            "<": lambda c, v: c < v,
            ">=": lambda c, v: c >= v,
            "<=": lambda c, v: c <= v,
            "in": lambda c, v: c.in_(list(v) if isinstance(v, (list, tuple, set)) else [v]),
            "not in": lambda c, v: ~c.in_(list(v) if isinstance(v, (list, tuple, set)) else [v]),
            "like": lambda c, v: c.like(f"%{v}%"),
            "ilike": lambda c, v: c.ilike(f"%{v}%") if hasattr(c, "ilike") else c.like(f"%{v}%"),
        }

        fn = ops.get(op)
        if fn:
            conds.append(fn(col, val))

    if conds:
        stmt = stmt.where(and_(*conds))
    return stmt
