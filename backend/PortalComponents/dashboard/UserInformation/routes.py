"""User Information routes for dashboard profile - membership data, education, payments."""
import logging
import mysql.connector
import os
from datetime import datetime, date
from flask import Blueprint, jsonify, session, g
from functools import wraps
from login.decorators import login_required
from login.auth import get_profile_data


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# DISABLED - migrated to PortalComponents/userInformation/
# user_info_bp = Blueprint('user_info', __name__, url_prefix='/api/dashboard/user-info')

def get_db_connection():
    """Database connection helper."""
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")
    return mysql.connector.connect(
        host=db_host, port=3306, user=db_user, password=db_password, database=db_name
    )

# Reuse from auth.py - removed duplicate


# DISABLED - all routes migrated to PortalComponents/userInformation/routes.py
# @user_info_bp.route('/profile', methods=['GET'])
# @login_required
# def get_profile():
#     """Get user profile: membership data, education, payments."""
#     user_id = session.get('user_id')
#     user_type = session.get('user_type')
#     email = session.get('user_email')
    
    if not all([user_id, user_type, email]):
        return jsonify({"status": "error", "message": "Incomplete session"}), 401
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query membership table
        table = "personalmembership" if user_type == "individual" else "organizationmembership"
        cursor.execute(f"SELECT * FROM {table} WHERE id = %s", (user_id,))
        member = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not member:
            return jsonify({"status": "error", "message": "Member not found"}), 404
        
        profile_data = get_profile_data(user_id, user_type, email)
        if not profile_data:
            return jsonify({"status": "error", "message": "Profile data unavailable"}), 500
            
        profile = {
            "status": "success",
            **profile_data
        }

        
        return jsonify(profile)
        
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch profile"}), 500

