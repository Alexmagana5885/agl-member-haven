"""Login routes for authentication."""
from flask import Blueprint, request, jsonify, session
from .auth import authenticate_user, get_user_info

login_bp = Blueprint('login', __name__, url_prefix='/api/auth')


@login_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint for users.
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "password123",
        "userType": "individual" or "organization"
    }
    
    Returns:
        JSON with user data and session token
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType', 'individual')
    
    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400
    
    # Validate user_type
    if user_type not in ['individual', 'organization']:
        return jsonify({"status": "error", "message": "Invalid user type"}), 400
    
    # Authenticate user
    user = authenticate_user(email, password, user_type)
    
    if not user:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    
    # Create secure session
    session['user_id'] = user['id']
    session['user_email'] = user['email']
    session['user_type'] = user['type']
    session.permanent = True
    
    # Get full user info
    full_user_info = get_user_info(user['id'], user_type)
    
    response_data = {
        "status": "success",
        "message": "Login successful",
        "redirect": "/portal",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "type": user['type'],
            "name": full_user_info.get('name') if user_type == 'individual' else full_user_info.get('organization_name')
        }
    }
    
    return jsonify(response_data), 200


@login_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint to clear session.
    
    Returns:
        JSON confirmation of logout
    """
    session.clear()
    return jsonify({"status": "success", "message": "Logout successful"}), 200


@login_bp.route('/session', methods=['GET'])
def get_session():
    """
    Get current session information.
    
    Returns:
        JSON with current session data or error if not logged in
    """
    if 'user_id' not in session:
        return jsonify({"status": "error", "message": "Not authenticated"}), 401
    
    user_info = get_user_info(session['user_id'], session['user_type'])
    
    return jsonify({
        "status": "success",
        "user": {
            "id": session['user_id'],
            "email": session['user_email'],
            "type": session['user_type'],
            "name": user_info.get('name') if session['user_type'] == 'individual' else user_info.get('organization_name')
        }
    }), 200
