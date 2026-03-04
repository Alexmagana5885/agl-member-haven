"""Registration routes for organization and individual membership."""
from flask import Blueprint, request, jsonify
from .service import register_organisation, register_individual

register_bp = Blueprint('register', __name__, url_prefix='/api/auth/register')


@register_bp.route('/organisation', methods=['POST'])
def register_org():
    """
    Register a new organization.
    
    Expected form data:
    - organizationName (str)
    - organizationEmail (str)
    - contactPerson (str)
    - contactPhone (str)
    - organizationAddress (str)
    - country (str)
    - county (str)
    - town (str)
    - organizationType (str)
    - startDate (date)
    - whatYouDo (str)
    - password (str)
    - registrationDate (date, optional)
    
    Expected files:
    - logoFile (image file)
    - certificateFile (document file)
    
    Returns:
        JSON with status and organization id
    """
    try:
        success, org_id, message = register_organisation(request.form, request.files)
        
        if success:
            return jsonify({"status": "success", "id": org_id, "message": message}), 201
        else:
            return jsonify({"status": "error", "message": message}), 400
    
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500


@register_bp.route('/individual', methods=['POST'])
def register_indiv():
    """
    Register a new individual member.
    
    Expected form data:
    - name (str)
    - email (str)
    - phone (str)
    - gender (str)
    - homeAddress (str)
    - highestDegree (str)
    - institution (str)
    - graduationYear (int)
    - profession (str)
    - experience (str)
    - currentCompany (str)
    - position (str)
    - workAddress (str)
    - password (str)
    
    Expected files:
    - passportFile (image file)
    - completionLetterFile (document file)
    
    Returns:
        JSON with status and person id
    """
    try:
        success, person_id, message = register_individual(request.form, request.files)
        
        if success:
            return jsonify({"status": "success", "id": person_id, "message": message}), 201
        else:
            return jsonify({"status": "error", "message": message}), 400
    
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500
