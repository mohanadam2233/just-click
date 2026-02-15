from cmcp.api.health import bp as health_bp
from cmcp.api.media_api import media_bp
from cmcp.api.people_api import bp as education_people_bp
from cmcp.api.auth_api import bp as auth_bp
from cmcp.api.academic_api import bp as academic_bp
from cmcp.api.material_api import bp as material_bp
def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(auth_bp)  # ✅ add this
    app.register_blueprint(academic_bp)
    app.register_blueprint(education_people_bp)
    app.register_blueprint(material_bp)


