"""Login routes for authentication."""
import logging
from flask import Blueprint, request, jsonify, session
from datetime import datetime
import json
import mysql.connector
import os
from .auth import authenticate_user, get_user_info, get_profile_data, find_user_by_email, hash_password, update_user_password



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


import smtplib
import secrets
import string
from datetime import datetime, timedelta
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def generate_otp():
    """Generate 6-digit OTP."""
    return ''.join(secrets.choice(string.digits) for _ in range(6))


def send_otp_email(email, otp):
    """Send OTP via SMTP."""
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    
    if not all([smtp_email, smtp_password]):
        logger.error("SMTP credentials missing from env")
        return False
    
    msg = MIMEMultipart()
    msg['From'] = smtp_email
    msg['To'] = email
    msg['Subject'] = "AGL Password Reset Code"
    
    body = f"""Your AGL password reset code is: {otp}

This code expires in 15 minutes.

If you did not request this, please ignore this email.

AGL Member Haven"""
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_email, email, text)
        server.quit()
        logger.info(f"OTP email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        return False



@login_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Send OTP to registered email."""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        
        if not email:
            return jsonify({"status": "error", "message": "Email required"}), 400
        
        # Check if email exists
        user = find_user_by_email(email)
        if not user:
            # Don't reveal if email exists (security)
            return jsonify({"status": "success", "message": "If email exists, check your inbox for code"}), 200
        
        # Generate and store OTP
        otp = generate_otp()
        expiry = datetime.now() + timedelta(minutes=15)
        session_key = f"otp_{email}"
        session[session_key] = f"{otp}|{expiry.isoformat()}"
        logger.info(f"RESET-PASSWORD stored session[{session_key}]='{session[session_key]}', expiry={expiry}")
        
        # Send email
        if send_otp_email(email, otp):
            logger.info(f"Reset OTP sent for {email}")
            return jsonify({"status": "success", "message": "Check your email for reset code"}), 200
        else:
            # Clear session on failure
            session.pop(session_key, None)
            return jsonify({"status": "error", "message": "Failed to send email. Try again."}), 500
            
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        return jsonify({"status": "error", "message": "Server error"}), 500


@login_bp.route('/verify-code', methods=['POST'])
def verify_code():
    """Verify OTP code."""
    try:
        data = request.get_json()
        logger.info(f"VERIFY-CODE REQUEST: data={data}, session_keys={list(session.keys())}")
        email = data.get('email', '').lower().strip()
        code = data.get('code', '').strip()
        logger.info(f"VERIFY-CODE: email='{email}', code_len={len(code) if code else 0}")
        
        if not email or not code:
            logger.warning(f"VERIFY-CODE 400: missing email or code")
            return jsonify({"status": "error", "message": "Email and code required"}), 400
        
        session_key = f"otp_{email}"
        logger.info(f"VERIFY-CODE session_key='{session_key}', exists={session_key in session}, all_sessions={list(session.keys())}")
        stored = session.get(session_key)
        logger.info(f"VERIFY-CODE stored='{stored}'")
        if not stored:
            return jsonify({"status": "error", "message": "No reset request found. Resend code."}), 400
        
        logger.info(f"VERIFY-CODE split: otp='{stored.split('|')[0] if stored else None}', expiry_str='{expiry_str if 'expiry_str' in locals() else 'N/A'}'")
        stored_otp, expiry_str = stored.split('|')
        try:
            expiry = datetime.fromisoformat(expiry_str.replace('Z', '+00:00') if 'Z' in expiry_str else expiry_str)
            logger.info(f"VERIFY-CODE expiry parsed: {expiry}")
        except Exception as parse_err:
            logger.error(f"VERIFY-CODE expiry parse error: {parse_err}, raw='{expiry_str}'")
            return jsonify({"status": "error", "message": "Invalid session data"}), 400
        
        if datetime.now() > expiry:
            session.pop(session_key, None)
            return jsonify({"status": "error", "message": "Code expired. Resend new code."}), 400
        
        if code != stored_otp:
            return jsonify({"status": "error", "message": "Invalid code"}), 400
        
        # Mark as verified
        session[f"verified_{email}"] = True
        session.pop(session_key, None)  # Clear OTP
        
        logger.info(f"Code verified for {email}")
        return jsonify({"status": "success", "message": "Code verified"}), 200
        
    except Exception as e:
        logger.error(f"Verify code error: {str(e)}")
        return jsonify({"status": "error", "message": "Server error"}), 500


@login_bp.route('/set-new-password', methods=['POST'])
@login_bp.route('/debug-session', methods=['GET'])
def debug_session():
    """Debug endpoint to check current session contents."""
    return jsonify({
        "session_keys": list(session.keys()),
        "session_contents": {k: str(v)[:100] + '...' if len(str(v)) > 100 else str(v) for k, v in session.items()}
    }), 200


def set_new_password():
    """Set new password after verification."""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        code = data.get('code')  # For extra security, but verified already
        
        if not all([email, password]):
            return jsonify({"status": "error", "message": "Email and password required"}), 400
        
        if len(password) < 8:
            return jsonify({"status": "error", "message": "Password must be at least 8 characters"}), 400
        
        # Check verification
        if not session.get(f"verified_{email}"):
            return jsonify({"status": "error", "message": "Please verify code first"}), 400
        
        # Find user
        user = find_user_by_email(email)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        # Hash and update
        hashed_pwd = hash_password(password)
        if update_user_password(user['id'], user['type'], hashed_pwd):
            # Clear session flags
            session.pop(f"verified_{email}", None)
            logger.info(f"Password reset successful for {email}")
            return jsonify({"status": "success", "message": "Password reset successful"}), 200
        else:
            return jsonify({"status": "error", "message": "Failed to update password"}), 500
            
    except Exception as e:
        logger.error(f"Set new password error: {str(e)}")
        return jsonify({"status": "error", "message": "Server error"}), 500


