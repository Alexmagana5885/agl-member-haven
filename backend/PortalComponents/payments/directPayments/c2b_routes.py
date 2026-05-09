"""C2B routes initializer."""

from .confirmation import confirmation_bp
from .validation import validation_bp


def init_app(app):

    app.register_blueprint(confirmation_bp)
    app.register_blueprint(validation_bp)