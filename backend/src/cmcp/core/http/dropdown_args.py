from __future__ import annotations

from typing import Any, Dict, Optional, Tuple

from flask import request


def _as_int(v: Any, default: int) -> int:
    try:
        return int(v)
    except Exception:
        return default


def dropdown_args(*, parse_filters_func, parse_bool_func) -> Tuple[Optional[str], int, int, bool, Optional[Dict[str, Any]]]:
    """
    Standard dropdown args:
      - search (or q)
      - limit/offset
      - active_only
      - filters (JSON wins)
    """
    search = request.args.get("search") or request.args.get("q")
    limit = _as_int(request.args.get("limit"), 20)
    offset = _as_int(request.args.get("offset"), 0)
    active_only = parse_bool_func(request.args.get("active_only", "1"))
    filters = parse_filters_func()
    return search, limit, offset, active_only, filters