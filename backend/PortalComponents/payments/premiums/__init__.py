"""Member Premium Payments module."""
from .routes import premiums_bp
from .callback import callback_bp

__all__ = ['premiums_bp', 'callback_bp']

