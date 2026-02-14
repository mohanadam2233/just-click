from __future__ import annotations

from flask import request

from cmcp.config.settings import settings


def resolve_company_id_for_public(
    *,
    allow_header: bool = True,
    allow_body: bool = True,
    allow_subdomain: bool = False,
) -> int:
    # 1) Header
    if allow_header:
        hdr = (request.headers.get("X-Company-Id") or "").strip()
        if hdr.isdigit():
            return int(hdr)

    # 2) Body
    if allow_body:
        body = request.get_json(silent=True) or {}
        cid = body.get("company_id")
        if isinstance(cid, int):
            return int(cid)
        if isinstance(cid, str) and cid.strip().isdigit():
            return int(cid.strip())

    # 3) (future) subdomain mapping…

    # 4) MVP default (required)
    if not settings.DEFAULT_COMPANY_ID:
        raise RuntimeError("DEFAULT_COMPANY_ID is required for public endpoints.")
    return int(settings.DEFAULT_COMPANY_ID)