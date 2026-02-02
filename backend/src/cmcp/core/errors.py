from flask import jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError
from cmcp.config.database import db

class BizValidationError(ValueError):
    def __init__(self, message: str, code: str = "VALIDATION_ERROR", field: str | None = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.field = field

    def to_dict(self):
        d = {"code": self.code, "message": self.message}
        if self.field:
            d["field"] = self.field
        return d

def register_error_handlers(app):
    @app.errorhandler(BizValidationError)
    def _biz(e: BizValidationError):
        return jsonify({"ok": False, "error": e.to_dict()}), 400

    @app.errorhandler(HTTPException)
    def _http(e: HTTPException):
        return jsonify({"ok": False, "error": {"message": e.description or e.name}}), e.code

    @app.errorhandler(IntegrityError)
    def _integrity(e: IntegrityError):
        db.session.rollback()
        return jsonify({"ok": False, "error": {"message": "Database conflict."}}), 409

    @app.errorhandler(Exception)
    def _unknown(e: Exception):
        app.logger.exception("Unhandled error", exc_info=True)
        return jsonify({"ok": False, "error": {"message": "Internal server error."}}), 500
