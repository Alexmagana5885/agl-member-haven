from flask import Blueprint
from .comingEvents import planned_events_bp
from .pastEvents import past_events_bp
from .registeredEvents import registered_events_bp

events_bp = Blueprint('member_events', __name__, url_prefix='/api/events')

# Removed nested registrations to fix URL prefix conflicts
# planned_events_bp, past_events_bp, registered_events_bp should be registered directly in app.py


__all__ = ['events_bp']

