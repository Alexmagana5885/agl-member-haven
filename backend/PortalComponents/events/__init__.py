from flask import Blueprint
from .comingEvents import planned_events_bp
from .pastEvents import past_events_bp
from .registeredEvents import registered_events_bp

events_bp = Blueprint('member_events', __name__, url_prefix='/api/events')

events_bp.register_blueprint(planned_events_bp)
events_bp.register_blueprint(past_events_bp) 
events_bp.register_blueprint(registered_events_bp)

__all__ = ['events_bp']

