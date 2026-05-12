"""Decorators for protecting routes that require login."""
from functools import wraps
from flask import session, jsonify


def login_required(f):
    """Decorator to require login + enforce 15 minutes inactivity timeout."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"status": "error", "message": "Authentication required"}), 401

        # Inactivity enforcement (15 minutes)
        last_activity = session.get('last_activity')
        if last_activity is None:
            # Backward compatibility: if legacy session has no marker, allow it once.
            session['last_activity'] = session.get('last_activity', __import__('time').time())
            return f(*args, **kwargs)

        try:
            now = __import__('time').time()
            if (now - float(last_activity)) > (15 * 60):
                session.clear()
                return jsonify({"status": "error", "message": "Session expired due to inactivity"}), 401

            # Update last activity (sliding expiration)
            session['last_activity'] = now
        except Exception:
            session.clear()
            return jsonify({"status": "error", "message": "Session invalid"}), 401

        return f(*args, **kwargs)

    return decorated_function


def user_type_required(user_type):
    """
    Decorator to require a specific user type for a route.
    
    Usage:
        @app.route('/org-only')
        @user_type_required('organization')
        def org_route():
            return jsonify({"data": "org data"})
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({"status": "error", "message": "Authentication required"}), 401
            
            if session.get('user_type') != user_type:
                return jsonify({"status": "error", "message": f"This resource requires {user_type} account"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
