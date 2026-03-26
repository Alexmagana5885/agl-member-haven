"""User Information API routes for profile GET and UPDATE."""

import logging
import mysql.connector
import os
from datetime import datetime
from flask import Blueprint, jsonify, request, session
from werkzeug.utils import secure_filename

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
            "payments": payments,
            "image_path": member_info.get('passport_image') or member_info.get('logo_image')
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
        params = []
        
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

@user_info_bp.route('/profile/image', methods=['POST'])
@login_required
def upload_profile_image():
    """Upload profile image - delete old, save new to uploads/passports/, update DB."""
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    
    if not all([user_id, user_type]):
        return jsonify({"status": "error", "message": "Incomplete session"}), 401
    
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No image selected"}), 400
    
    try:
        # Get current image path from DB
        member_info = get_user_info(user_id, user_type)
        old_image_path = member_info.get('passport_image') if user_type == 'individual' else member_info.get('logo_image')
        
# Dynamic paths matching registration - passports/ for individual, organisation_logos/ for org
        UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "../uploads")  # Relative to backend/
        UPLOADS_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), UPLOAD_DIR)
        SUBFOLDER = "passports" if user_type == "individual" else "organisation_logos"
        target_dir = os.path.join(UPLOADS_BASE, SUBFOLDER)
        os.makedirs(target_dir, exist_ok=True)
        
        # Delete old image (handle type-specific path)
        if old_image_path:
            old_subfolder = "passports" if "passports" in old_image_path else "organisation_logos"
            old_filename = old_image_path.split('/')[-1]
            old_filepath = os.path.join(UPLOADS_BASE, old_subfolder, old_filename)
            if os.path.exists(old_filepath):
                os.remove(old_filepath)
                logger.info(f"Deleted old image: {old_filepath}")
        
        # Save new image (matches register/service.py exactly)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{secure_filename(file.filename)}"
        filepath = os.path.join(target_dir, filename)
        file.save(filepath)
        
        # Update DB
        conn = get_db_connection()
        cursor = conn.cursor()
        table = "personalmembership" if user_type == "individual" else "organizationmembership"
        image_field = "passport_image" if user_type == "individual" else "logo_image"
        cursor.execute(f"UPDATE {table} SET {image_field} = %s WHERE id = %s", (f"uploads/{SUBFOLDER}/{filename}", user_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Uploaded profile image: {filename}")
        return jsonify({
            "status": "success", 
            "message": "Image uploaded successfully", 
            "image_path": f"uploads/{SUBFOLDER}/{filename}"
        })
        
    except Exception as e:
        logger.error(f"Image upload error: {e}")
        return jsonify({"status": "error", "message": "Failed to upload image"}), 500





