"""Login routes for authentication."""
import logging
from flask import Blueprint, request, jsonify, session
from .auth import authenticate_user, get_user_info

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

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
    logger.info("=" * 60)
    logger.info("LOGIN REQUEST INITIATED")
    logger.info("=" * 60)
    
    data = request.get_json()
    
    if not data:
        logger.warning("Login attempt failed: No data provided in request")
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType', 'individual')
    
    logger.debug(f"Email: {email}")
    logger.debug(f"User Type: {user_type}")
    logger.debug(f"Password provided: {'Yes' if password else 'No'}")
    
    if not email or not password:
        logger.warning(f"Login attempt failed: Missing credentials. Email: {bool(email)}, Password: {bool(password)}")
        return jsonify({"status": "error", "message": "Email and password required"}), 400
    
    # Validate user_type
    if user_type not in ['individual', 'organization']:
        logger.warning(f"Login attempt failed: Invalid user type '{user_type}'")
        return jsonify({"status": "error", "message": "Invalid user type"}), 400
    
    logger.info(f"Attempting to authenticate user: {email} as {user_type}")
    
    # Authenticate user
    user = authenticate_user(email, password, user_type)
    
    if not user:
        logger.warning(f"Authentication failed for {email} ({user_type}): Invalid credentials")
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    
    logger.info(f"Authentication successful for {email} (ID: {user['id']})")
    
    # Create secure session
    logger.debug(f"Creating session for user ID: {user['id']}")
    session['user_id'] = user['id']
    session['user_email'] = user['email']
    session['user_type'] = user['type']
    session.permanent = True
    logger.debug(f"Session created successfully")
    
    # Get full user info
    logger.debug(f"Fetching full user information for user ID: {user['id']}")
    full_user_info = get_user_info(user['id'], user_type)
    
    if not full_user_info:
        logger.warning(f"Could not retrieve full user info for user ID: {user['id']}")
        full_user_info = {}
    
    user_name = full_user_info.get('name') if user_type == 'individual' else full_user_info.get('organization_name')
    logger.info(f"Full user info retrieved. User name: {user_name}")
    
    response_data = {
        "status": "success",
        "message": "Login successful",
        "redirect": "/portal",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "type": user['type'],
            "name": user_name
        }
    }
    
    logger.info(f"LOGIN SUCCESSFUL for {email}")
    logger.info("=" * 60)
    
    return jsonify(response_data), 200


@login_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint to clear session.
    
    Returns:
        JSON confirmation of logout
    """
    user_email = session.get('user_email', 'Unknown')
    logger.info(f"Logout requested for user: {user_email}")
    session.clear()
    logger.info(f"Session cleared for user: {user_email}")
    return jsonify({"status": "success", "message": "Logout successful"}), 200


@login_bp.route('/session', methods=['GET'])
def get_session():
    """
    Get current session information.
    
    Returns:
        JSON with current session data or error if not logged in
    """
    logger.debug("Session check requested")
    
    if 'user_id' not in session:
        logger.warning("Session check failed: User not authenticated")
        return jsonify({"status": "error", "message": "Not authenticated"}), 401
    
    logger.debug(f"Session found for user ID: {session['user_id']}")
    user_info = get_user_info(session['user_id'], session['user_type'])
    
    logger.debug(f"Session info retrieved for user: {session['user_email']}")
    
    return jsonify({
        "status": "success",
        "user": {
            "id": session['user_id'],
            "email": session['user_email'],
            "type": session['user_type'],
            "name": user_info.get('name') if session['user_type'] == 'individual' else user_info.get('organization_name')
        }
    }), 200
