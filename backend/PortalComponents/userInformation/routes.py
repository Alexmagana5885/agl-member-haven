"""User Information API routes for profile GET and UPDATE."""

import logging
import mysql.connector
import os
from flask import Blueprint, jsonify, request, session
from login.decorators import login_required
from login.auth import get_user_info, calculate_payments_status

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

user_info_bp = Blueprint('user_info', __name__, url_prefix='/api/dashboard/user-info')

def get_db_connection():
    """Database connection helper."""
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")
    return mysql.connector.connect(
        host=db_host, port=3306, user=db_user, password=db_password, database=db_name
    )

@user_info_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """Get user profile: membership data, education, payments."""
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    email = session.get('user_email')
    
    if not all([user_id, user_type, email]):
        return jsonify({"status": "error", "message": "Incomplete session"}), 401
    
    try:
        member_info = get_user_info(user_id, user_type)
        if not member_info:
            return jsonify({"status": "error", "message": "Member not found"}), 404
        
        payments = calculate_payments_status(email)
        profile_data = {
            "status": "success",
            "user_type": user_type,
            "name": member_info.get('name') if user_type == 'individual' else member_info.get('organization_name'),
            "email": email,
            "registration_date": str(member_info.get('registration_date') or member_info.get('date_of_registration')),
            "education": {
                "highest_degree": member_info.get('highest_degree'),
                "institution": member_info.get('institution'),
                "graduation_year": int(member_info.get('graduation_year') or 0)
            } if user_type == 'individual' else None,
            "payments": payments
        }
        return jsonify(profile_data)
        
    except Exception as e:
        logger.error(f"Profile fetch error: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch profile"}), 500

@user_info_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """Update user profile data."""
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    email = session.get('user_email')
    
    if not all([user_id, user_type, email]):
        return jsonify({"status": "error", "message": "Incomplete session"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table = "personalmembership" if user_type == "individual" else "organizationmembership"
        email_col = "email" if user_type == "individual" else "organization_email"
        
        # Base update fields
        update_fields = []
        params = [user_id]
        
        if 'name' in data and data['name']:
            name_field = "name" if user_type == "individual" else "organization_name"
            update_fields.append(f"{name_field} = %s")
            params.append(data['name'])
        
        if 'email' in data and data['email']:
            update_fields.append(f"{email_col} = %s")
            params.append(data['email'])
        
        # Individual-only education fields
        if user_type == "individual":
            if 'highest_degree' in data and data['highest_degree']:
                update_fields.append("highest_degree = %s")
                params.append(data['highest_degree'])
            if 'institution' in data and data['institution']:
                update_fields.append("institution = %s")
                params.append(data['institution'])
            if 'graduation_year' in data and data['graduation_year']:
                update_fields.append("graduation_year = %s")
                params.append(int(data['graduation_year']))
        
        if not update_fields:
            return jsonify({"status": "error", "message": "No valid fields to update"}), 400
        
        update_query = f"UPDATE {table} SET {', '.join(update_fields)} WHERE id = %s"
        params.append(user_id)  # id for WHERE
        
        cursor.execute(update_query, params)
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "No rows updated"}), 404
        
        cursor.close()
        conn.close()
        
        # Return updated profile
        member_info = get_user_info(user_id, user_type)
        payments = calculate_payments_status(email if 'email' not in data or not data['email'] else data['email'])
        profile_data = {
            "status": "success",
            "message": "Profile updated successfully",
            "user_type": user_type,
            "name": member_info.get('name') if user_type == 'individual' else member_info.get('organization_name'),
            "email": email if 'email' not in data or not data['email'] else data['email'],
            "registration_date": str(member_info.get('registration_date') or member_info.get('date_of_registration')),
            "education": {
                "highest_degree": member_info.get('highest_degree'),
                "institution": member_info.get('institution'),
                "graduation_year": int(member_info.get('graduation_year') or 0)
            } if user_type == 'individual' else None,
            "payments": payments
        }
        return jsonify(profile_data)
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        return jsonify({"status": "error", "message": "Failed to update profile"}), 500


