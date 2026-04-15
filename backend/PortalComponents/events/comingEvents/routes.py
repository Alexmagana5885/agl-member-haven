"""Planned Events routes - Store and retrieve planned events in plannedevent table."""
import os
import json
import logging
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
planned_events_bp = Blueprint('planned_events', __name__, url_prefix='/api/admin/planned-events')


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


@planned_events_bp.route('', methods=['GET'])
def get_planned_events():
    """
    Get all planned events.
    
    Returns:
        JSON response with list of planned events
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_name, event_image_path, event_description, event_location, 
                   event_date, created_at, RegistrationAmount
            FROM plannedevent
            ORDER BY event_date ASC
        """)
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime/date objects to strings
        for result in results:
            if result.get('event_date'):
                result['event_date'] = str(result['event_date'])
            if result.get('created_at'):
                result['created_at'] = str(result['created_at'])
            if result.get('RegistrationAmount'):
                result['RegistrationAmount'] = float(result['RegistrationAmount'])
        
        return jsonify({
            "success": True,
            "events": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching planned events: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching planned events"
        }), 500


@planned_events_bp.route('/<int:event_id>', methods=['GET'])
def get_planned_event(event_id):
    """
    Get a specific planned event by ID.
    
    Args:
        event_id: The event ID
    
    Returns:
        JSON response with event details
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_name, event_image_path, event_description, event_location, 
                   event_date, created_at, RegistrationAmount
            FROM plannedevent
            WHERE id = %s
        """, (event_id,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            return jsonify({
                "success": False,
                "message": "Event not found"
            }), 404
        
        # Convert datetime/date objects to strings
        if result.get('event_date'):
            result['event_date'] = str(result['event_date'])
        if result.get('created_at'):
            result['created_at'] = str(result['created_at'])
        if result.get('RegistrationAmount'):
            result['RegistrationAmount'] = float(result['RegistrationAmount'])
        
        return jsonify({
            "success": True,
            "event": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching planned event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching event details"
        }), 500


@planned_events_bp.route('', methods=['POST'])
def create_planned_event():
    """
    Create a new planned event.
    
    Expected JSON payload:
    {
        "title": "Event Name",
        "date": "2025-03-23",
        "venue": "Event Location",
        "description": "Event description",
        "regAmount": "500" or "0"
    }
    
    Returns:
        JSON response with success status and message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract and validate input
        event_name = data.get('title', '').strip()
        event_date = data.get('date', '').strip()
        event_location = data.get('venue', '').strip()
        event_description = data.get('description', '').strip()
        reg_amount = data.get('regAmount', '0')
        
        # Handle regAmount - could be string or number
        if isinstance(reg_amount, str):
            reg_amount = reg_amount.strip()
        else:
            reg_amount = str(reg_amount) if reg_amount else '0'
        
        # Validation
        errors = []
        if not event_name:
            errors.append("Event name is required")
        if not event_date:
            errors.append("Event date is required")
        if not event_location:
            errors.append("Event location is required")
        if not event_description:
            errors.append("Event description is required")
        
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Use default image path (file uploads will be handled in future)
        event_image_path = '../assets/img/PlannedEvent/default.jpg'
        
        # Parse registration amount
        try:
            registration_amount = float(reg_amount.replace(',', '').replace(' ', '').strip()) if reg_amount else 0
        except (ValueError, TypeError):
            registration_amount = 0
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert into plannedevent table
        insert_sql = """INSERT INTO plannedevent 
            (event_name, event_image_path, event_description, event_location, event_date, created_at, RegistrationAmount) 
            VALUES (%s, %s, %s, %s, %s, NOW(), %s)"""
        
        insert_values = (event_name, event_image_path, event_description, event_location, event_date, registration_amount)
        
        try:
            cursor.execute(insert_sql, insert_values)
            conn.commit()
            
            event_id = cursor.lastrowid
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Planned event created successfully",
                "event_id": event_id
            }), 201
            
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Database error occurred while creating event"
            }), 500
            
    except Exception as e:
        logger.error(f"Error creating planned event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@planned_events_bp.route('/<int:event_id>', methods=['PUT'])
def update_planned_event(event_id):
    """
    Update an existing planned event.
    
    Args:
        event_id: The event ID
    
    Expected JSON payload:
    {
        "title": "Event Name",
        "type": "Conference",
        "date": "2025-03-23",
        "venue": "Event Location",
        "description": "Event description",
        "objectives": "Event objectives",
        "whyAttend": "Why attend this event",
        "subthemes": "subtheme1, subtheme2",
        "regAmount": "500" or "0",
        "imagePath": "/path/to/image.jpg"
    }
    
    Returns:
        JSON response with success status and message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract input
        event_name = data.get('title', '').strip()
        event_date = data.get('date', '').strip()
        event_location = data.get('venue', '').strip()
        event_description = data.get('description', '').strip()
        event_image_path = data.get('imagePath', '../assets/img/PlannedEvent/default.jpg')
        reg_amount = data.get('regAmount', '0').strip()
        
        # Parse registration amount
        try:
            registration_amount = float(reg_amount.replace(',', '').replace(' ', '').strip()) if reg_amount else 0
        except (ValueError, TypeError):
            registration_amount = 0
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update plannedevent table
        update_sql = """UPDATE plannedevent 
            SET event_name = %s, event_image_path = %s, event_description = %s, 
                event_location = %s, event_date = %s, RegistrationAmount = %s
            WHERE id = %s"""
        
        update_values = (event_name, event_image_path, event_description, event_location, 
                       event_date, registration_amount, event_id)
        
        try:
            cursor.execute(update_sql, update_values)
            conn.commit()
            
            if cursor.rowcount == 0:
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "Event not found"
                }), 404
            
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Planned event updated successfully"
            }), 200
            
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Database error occurred while updating event"
            }), 500
            
    except Exception as e:
        logger.error(f"Error updating planned event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@planned_events_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_planned_event(event_id):
    """
    Delete a planned event.
    
    Args:
        event_id: The event ID
    
    Returns:
        JSON response with success status and message
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM plannedevent WHERE id = %s", (event_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Event not found"
            }), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Planned event deleted successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting planned event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error deleting event"
        }), 500

