from flask import Blueprint, jsonify
from cmcp.core.auth import public
from cmcp.config.database import db_healthcheck
from cmcp.config.redis_config import ping_redis

bp = Blueprint("health", __name__)

@bp.get("/health")
@public
def health():
    return jsonify({"status": "ok"}), 200

@bp.get("/ready")
@public
def ready():
    return jsonify({"status": "ready", "db": db_healthcheck(), "redis": ping_redis()}), 200
