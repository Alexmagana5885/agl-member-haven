"""Decorators for protecting routes that require login."""
from functools import wraps
from flask import session, jsonify


def login_required(f):
    """
    Decorator to require login for a route.
    
    Usage:
        @app.route('/protected')
        @login_required
        def protected_route():
            return jsonify({"data": "secret"})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"status": "error", "message": "Authentication required"}), 401
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
