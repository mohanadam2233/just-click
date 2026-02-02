from cmcp.api.health import bp as health_bp
from cmcp.api.media_api import media_bp
def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(media_bp)
