from __future__ import annotations

import importlib
import logging
from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS
from flask_session import Session
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError

from cmcp.config.settings import settings
from cmcp.config.database import db, migrate, db_healthcheck
from cmcp.config.redis_config import get_redis_raw, ping_redis

from cmcp.common.api_response import api_error
from cmcp.common.cache.local_cache import clear_local_cache

from cmcp.core.errors import register_error_handlers  # optional: keep if you also have a central function
from cmcp.core.middleware.request_id import before_request_request_id, after_request_request_id
from cmcp.core.middleware.security_headers import after_request_security_headers
from cmcp.core.middleware.session_auth import before_request_session_auth
from cmcp.core.auth import require_login_globally

from cmcp.api import register_blueprints

# Media folders helper (if you have it)
from cmcp.modules.media.utils import ensure_local_media_folders

log = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)

    # ------------------------------------------------------------------
    # Core config
    # ------------------------------------------------------------------
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ------------------------------------------------------------------
    # Sessions (Redis-backed)
    # ------------------------------------------------------------------
    app.config.update(
        SESSION_TYPE="redis",
        SESSION_REDIS=get_redis_raw(),
        SESSION_PERMANENT=True,
        SESSION_USE_SIGNER=True,
        SESSION_KEY_PREFIX="cmcp_session:",
        PERMANENT_SESSION_LIFETIME=timedelta(seconds=settings.SESSION_COOKIE_MAX_AGE),
        SESSION_COOKIE_NAME=settings.SESSION_COOKIE_NAME,
        SESSION_COOKIE_HTTPONLY=settings.SESSION_COOKIE_HTTPONLY,
        SESSION_COOKIE_SECURE=settings.cookie_secure_effective,
        SESSION_COOKIE_SAMESITE=settings.cookie_samesite_effective,
        SESSION_COOKIE_DOMAIN=settings.SESSION_COOKIE_DOMAIN,
    )
    Session(app)

    # ------------------------------------------------------------------
    # DB + migrations
    # IMPORTANT: import all models BEFORE migrate.init_app
    # ------------------------------------------------------------------
    db.init_app(app)

    # ✅ This triggers auto-import of all models under cmcp.modules.*
    # (file: src/cmcp/models/__init__.py)
    importlib.import_module("cmcp.models")

    migrate.init_app(app, db)

    # ------------------------------------------------------------------
    # CORS (allow credentials for session cookie)
    # ------------------------------------------------------------------
    CORS(
        app,
        supports_credentials=True,
        origins=settings.CORS_ALLOWED_ORIGINS,
        allow_headers=["Content-Type", "Authorization", "Cookie"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # ------------------------------------------------------------------
    # Middleware hooks
    # ------------------------------------------------------------------
    app.before_request(before_request_request_id)
    app.before_request(before_request_session_auth)
    app.after_request(after_request_request_id)
    app.after_request(after_request_security_headers)

    # ------------------------------------------------------------------
    # Cache teardown hook (like your old project)
    # ------------------------------------------------------------------
    @app.teardown_request
    def _clear_cache_on_teardown(exc):
        try:
            clear_local_cache()
        except Exception:
            pass

    # ------------------------------------------------------------------
    # Global exception handlers (like your old project)
    # ------------------------------------------------------------------
    @app.errorhandler(HTTPException)
    def handle_http_exception(e: HTTPException):
        return api_error(getattr(e, "description", None) or e.name, status_code=e.code)

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(e: IntegrityError):
        db.session.rollback()
        return api_error("Database conflict.", status_code=409)

    @app.errorhandler(Exception)
    def handle_unexpected_exception(e: Exception):
        app.logger.exception("Unhandled error", exc_info=True)
        return api_error("Internal server error.", status_code=500)

    # ------------------------------------------------------------------
    # Ensure local media folders exist (you requested this)
    # ------------------------------------------------------------------
    try:
        ensure_local_media_folders()
    except Exception:
        app.logger.exception("ensure_local_media_folders failed")


    # ------------------------------------------------------------------
    # Register blueprints
    # ------------------------------------------------------------------
    register_blueprints(app)

    # ------------------------------------------------------------------
    # Require login by default (use @public to open endpoints)
    # ------------------------------------------------------------------
    require_login_globally(app)

    return app
