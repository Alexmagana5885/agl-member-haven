"""Registered Events routes - Get user-specific events from event_registrations table."""
import os
import logging
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint - PUBLIC endpoint for members
registered_events_bp = Blueprint('registered_events', __name__)


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


@registered_events_bp.route('/registered', methods=['GET'])
def get_user_registered_events():
    """
    Get registered events for specific user email.
    
    Query Param: email (required)
    
    Returns:
        JSON response with list of user's registered events
    """
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({
                "success": False,
                "message": "Email parameter is required"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_id, event_name, event_location, event_date, 
                   member_name, contact, registration_date, payment_code, invitation_card
            FROM event_registrations 
            WHERE member_email = %s 
            ORDER BY registration_date DESC
        """, (email,))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime/date objects to strings
        for result in results:
            if result.get('event_date'):
                result['event_date'] = str(result['event_date'])
            if result.get('registration_date'):
                result['registration_date'] = str(result['registration_date'])
        
        return jsonify({
            "success": True,
            "events": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching registered events: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching registered events"
        }), 500

