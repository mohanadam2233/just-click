from __future__ import annotations

import os
from typing import Optional

from flask import request


def resolve_company_id_for_public(
    *,
    allow_header: bool = True,
    allow_body: bool = True,
    allow_subdomain: bool = False,
) -> int:
    """
    MVP: uses DEFAULT_COMPANY_ID.
    Future: can resolve from:
      - Header: X-Company-Id
      - Body: company_id
      - Subdomain mapping (optional)
    """

    # 1) Header (future-ready)
    if allow_header:
        hdr = (request.headers.get("X-Company-Id") or "").strip()
        if hdr.isdigit():
            return int(hdr)

    # 2) Body (future-ready)
    if allow_body:
        body = request.get_json(silent=True) or {}
        cid = body.get("company_id")
        if isinstance(cid, int):
            return int(cid)
        if isinstance(cid, str) and cid.strip().isdigit():
            return int(cid.strip())

    # 3) Subdomain (optional future)
    # Example: companyA.yourdomain.com -> resolve to ID from DB mapping
    # if allow_subdomain:
    #     host = (request.host or "").split(":")[0]
    #     sub = host.split(".")[0]
    #     # TODO: lookup company by subdomain in DB

    # 4) MVP default (required)
    default_id = (os.getenv("DEFAULT_COMPANY_ID") or "").strip()
    if not default_id.isdigit():
        raise RuntimeError("DEFAULT_COMPANY_ID is required for public endpoints.")
    return int(default_id)