"""Login routes for authentication."""
import logging
from flask import Blueprint, request, jsonify, session
from datetime import datetime
import json
import mysql.connector
import os
from .auth import authenticate_user, get_user_info, get_profile_data


# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

login_bp = Blueprint('login', __name__, url_prefix='/api/auth')


def get_db_connection():
    """Create and return a MySQL database connection."""
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")

    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name
        )
        return conn
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise


def check_is_official(email):
    """Check if the user is an official member."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT COUNT(*) FROM officialsmembers 
            WHERE personalmembership_email = %s
        """, (email,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return result[0] > 0 if result else False
    except Exception as e:
        logger.error(f"Error checking official status: {str(e)}")
        return False


def get_member_data(email, user_type):
    """Get member data from personalmembership or organizationmembership."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            cursor.execute("SELECT * FROM organizationmembership WHERE organization_email = %s", (email,))
        else:
            cursor.execute("SELECT * FROM personalmembership WHERE email = %s", (email,))
        
        member = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return member
    except Exception as e:
        logger.error(f"Error getting member data: {str(e)}")
        return None


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
    
    try:
        data = request.get_json()
    except Exception as e:
        logger.error(f"Failed to parse JSON: {str(e)}")
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400
    
    if not data:
        logger.warning("Login attempt failed: No data provided in request")
        logger.info(f"Request headers: {dict(request.headers)}")
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    logger.info(f"Received data: {data}")
    
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('memberType', data.get('userType', 'individual'))
    
    logger.info(f"Extracted - email: {email}, user_type: {user_type}, password_provided: {bool(password)}")
    
    logger.debug(f"Email: {email}")
    logger.debug(f"User Type: {user_type}")
    logger.debug(f"Password provided: {'Yes' if password else 'No'}")
    
    if not email or not password:
        logger.warning(f"Login attempt failed: Missing credentials. Email: {bool(email)}, Password: {bool(password)}")
        return jsonify({"status": "error", "message": "Email and password required"}), 400
    
    # Normalize user_type (accept both "organisation" and "organization")
    if user_type == "organisation":
        user_type = "organization"
    
    # Validate user_type
    if user_type not in ['individual', 'organization']:
        logger.warning(f"Login attempt failed: Invalid user type '{user_type}'")
        return jsonify({"status": "error", "message": "Invalid user type"}), 400
    
    logger.info(f"Attempting to authenticate user: {email} as {user_type}")
    
    # Authenticate user
    try:
        user = authenticate_user(email, password, user_type)
    except Exception as e:
        logger.error(f"Exception during authentication: {str(e)}")
        return jsonify({"status": "error", "message": "Authentication failed", "error": str(e)}), 500
    
    if not user:
        logger.warning(f"Authentication failed for {email} ({user_type}): Invalid credentials")
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    
    logger.info(f"Authentication successful for {email} (ID: {user['id']})")
    
    # Create secure session
    logger.debug(f"Creating session for user ID: {user['id']}")
    session['user_id'] = user['id']
    session['user_email'] = user['email']
    session['user_type'] = user['type']  # 'individual' or 'organization'
    session['member_type'] = user_type  # Store the actual member type used for login
    session.permanent = True
    logger.debug(f"Session created successfully")
    
    # Check if user is an official
    is_official = check_is_official(email)
    session['is_official'] = is_official
    logger.debug(f"User official status: {is_official}")
    
    # Get member data and create season
    member_data = get_member_data(email, user_type)
    current_year = datetime.now().year
    
    # Get member name from member_data
    member_name = member_data.get('name') if user_type == 'individual' else member_data.get('organization_name') if member_data else ''
    
    # Create season data
    season_data = {
        "year": current_year,
        "member_id": user['id'],
        "member_name": member_name,
        "member_email": email,
        "member_type": user_type,
        "is_official": is_official,
        "login_timestamp": datetime.now().isoformat()
    }
    session['season'] = json.dumps(season_data)
    logger.debug(f"Season created: {season_data}")
    
    # Get profile data including payments/education
    logger.debug(f"Fetching profile data for user ID: {user['id']}")
    profile_data = get_profile_data(user['id'], user_type, email)
    
    if not profile_data:
        logger.warning(f"Could not retrieve profile data for user ID: {user['id']}")
        profile_data = {}
    
    # Enhanced season with payments
    season_data = {
        "year": current_year,
        "member_id": user['id'],
        "member_name": member_name,
        "member_email": email,
        "member_type": user_type,
        "is_official": is_official,
        "login_timestamp": datetime.now().isoformat(),
        **({"payments": profile_data.get("payments", {})} if profile_data.get("payments") else {})
    }
    session['season'] = json.dumps(season_data)
    session['profile_data'] = json.dumps(profile_data, default=str)

    logger.debug(f"Enhanced season/profile created")
    
    user_name = profile_data.get('name', 'N/A')
    
    response_data = {
        "status": "success",
        "message": "Login successful",
        "redirect": "/portal",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "type": user['type'],
            "name": user_name,
            "is_official": is_official,
            "member_type": user_type,
            "payments_status": profile_data.get("payments", {}).get("status", "Unknown")
        }
    }
    
    logger.info(f"LOGIN SUCCESSFUL for {email} - Payments: {profile_data.get('payments', {}).get('status', 'N/A')}")
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
    
    profile_data = None
    if session.get('profile_data'):
        try:
            profile_data = json.loads(session.get('profile_data'))
        except:
            profile_data = None
    
    # Use profile_data or fallback to basic user_info
    if profile_data and profile_data.get('name'):
        user_name = profile_data['name']
        payments_status = profile_data.get('payments', {}).get('status', 'N/A')
    else:
        user_info = get_user_info(session['user_id'], session['user_type'])
        user_name = user_info.get('name') if session['user_type'] == 'individual' else user_info.get('organization_name')
        payments_status = 'N/A'
    
    logger.debug(f"Session info retrieved for user: {session['user_email']}")
    
    # Parse season data if it exists
    season_data = None
    if session.get('season'):
        try:
            season_data = json.loads(session.get('season'))
        except:
            season_data = None
    
    return jsonify({
        "status": "success",
        "user": {
            "id": session['user_id'],
            "email": session['user_email'],
            "type": session['user_type'],
            "name": user_name,
            "is_official": session.get('is_official', False),
            "member_type": session.get('member_type', session['user_type']),
            "payments_status": payments_status
        },
        "season": season_data,
        "profile": profile_data
    }), 200

