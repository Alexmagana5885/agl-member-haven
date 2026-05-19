"""Past Events routes - Store and retrieve past events in pastevents table."""
import os
import json
import logging
from flask import Blueprint, jsonify, request
import mysql.connector

from .upload_utils import allowed_image_file, allowed_document_file, save_uploaded_file

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
past_events_bp = Blueprint('past_events', __name__, url_prefix='/api/admin/past-events')


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


@past_events_bp.route('', methods=['GET'])
def get_past_events():
    """
    Get all past events.
    
    Returns:
        JSON response with list of past events
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_name, event_details, event_location, event_date, 
                   event_image_paths, event_document_paths, created_at
            FROM pastevents
            ORDER BY event_date DESC
        """)
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime/date objects to strings and parse JSON fields
        for result in results:
            if result.get('event_date'):
                result['event_date'] = str(result['event_date'])
            if result.get('created_at'):
                result['created_at'] = str(result['created_at'])
            if result.get('event_image_paths'):
                try:
                    result['event_image_paths'] = json.loads(result['event_image_paths'])
                except:
                    result['event_image_paths'] = []
            if result.get('event_document_paths'):
                try:
                    result['event_document_paths'] = json.loads(result['event_document_paths'])
                except:
                    result['event_document_paths'] = []
        
        return jsonify({
            "success": True,
            "events": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching past events: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching past events"
        }), 500


@past_events_bp.route('/<int:event_id>', methods=['GET'])
def get_past_event(event_id):
    """
    Get a specific past event by ID.
    
    Args:
        event_id: The event ID
    
    Returns:
        JSON response with event details
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_name, event_details, event_location, event_date, 
                   event_image_paths, event_document_paths, created_at
            FROM pastevents
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
        
        # Convert datetime/date objects to strings and parse JSON fields
        if result.get('event_date'):
            result['event_date'] = str(result['event_date'])
        if result.get('created_at'):
            result['created_at'] = str(result['created_at'])
        if result.get('event_image_paths'):
            try:
                result['event_image_paths'] = json.loads(result['event_image_paths'])
            except:
                result['event_image_paths'] = []
        if result.get('event_document_paths'):
            try:
                result['event_document_paths'] = json.loads(result['event_document_paths'])
            except:
                result['event_document_paths'] = []
        
        return jsonify({
            "success": True,
            "event": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching past event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching event details"
        }), 500


@past_events_bp.route('', methods=['POST'])
def create_past_event():
    """
    Create a new past event.
    
    Expected JSON payload:
    {
        "title": "Event Name",
        "date": "2024-11-09",
        "venue": "Event Location",
        "description": "Event details/description"
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
        event_details = data.get('description', '').strip()
        
        # Validation
        errors = []
        if not event_name:
            errors.append("Event name is required")
        if not event_date:
            errors.append("Event date is required")
        if not event_location:
            errors.append("Event location is required")
        if not event_details:
            errors.append("Event description is required")
        
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Image and document paths are empty by default (file uploads can be added later)
        event_image_paths = None
        event_document_paths = None
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insert into pastevents table
        insert_sql = """INSERT INTO pastevents 
            (event_name, event_details, event_location, event_date, event_image_paths, event_document_paths, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s, NOW())"""
        
        insert_values = (event_name, event_details, event_location, event_date, 
                        event_image_paths, event_document_paths)
        
        try:
            cursor.execute(insert_sql, insert_values)
            conn.commit()
            
            event_id = cursor.lastrowid
            cursor.close()
            conn.close()
            
            return jsonify({
                "success": True,
                "message": "Past event created successfully",
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
        logger.error(f"Error creating past event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@past_events_bp.route('/<int:event_id>/upload', methods=['POST'])
def upload_past_event_files(event_id):
    """Upload images and documents for a past event.

    Form fields:
      - eventImages: multiple files (optional)
      - eventDocuments: multiple files (optional)

    Stores JSON arrays in:
      - pastevents.event_image_paths
      - pastevents.event_document_paths
    """
    try:
        if 'eventImages' not in request.files and 'eventDocuments' not in request.files:
            return jsonify({"success": False, "message": "No files provided"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT event_image_paths, event_document_paths FROM pastevents WHERE id = %s",
            (event_id,),
        )
        row = cursor.fetchone()
        if not row:
            cursor.close(); conn.close()
            return jsonify({"success": False, "message": "Event not found"}), 404

        def to_list(val):
            if not val:
                return []
            try:
                parsed = json.loads(val)
                return parsed if isinstance(parsed, list) else []
            except Exception:
                return []

        image_paths = to_list(row.get('event_image_paths'))
        document_paths = to_list(row.get('event_document_paths'))

        # Ensure upload dirs exist and save under repo public assets
        uploads_base = os.path.join(os.getcwd(), 'backend', 'assets')

        # Images
        images = request.files.getlist('eventImages') if hasattr(request.files, 'getlist') else []
        for f in images:
            if not f or not getattr(f, 'filename', ''):
                continue
            if not allowed_image_file(f.filename):
                continue
            upload_dir = os.path.join(uploads_base, 'img', 'PastEventsDocs')  # placeholder; overridden below
            # Use separate subfolders
            upload_dir = os.path.join(uploads_base, 'img', 'PastEvents')
            saved = save_uploaded_file(f, upload_dir=upload_dir, relative_subdir=os.path.join('img', 'PastEvents'))
            image_paths.append(saved)

        # Documents
        documents = request.files.getlist('eventDocuments') if hasattr(request.files, 'getlist') else []
        for f in documents:
            if not f or not getattr(f, 'filename', ''):
                continue
            if not allowed_document_file(f.filename):
                continue
            upload_dir = os.path.join(uploads_base, 'Documents', 'PastEventsDocs')
            saved = save_uploaded_file(f, upload_dir=upload_dir, relative_subdir=os.path.join('Documents', 'PastEventsDocs'))
            document_paths.append(saved)

        event_image_paths_json = json.dumps(image_paths) if image_paths else None
        event_document_paths_json = json.dumps(document_paths) if document_paths else None

        cursor.execute(
            """UPDATE pastevents
               SET event_image_paths=%s, event_document_paths=%s
               WHERE id=%s""",
            (event_image_paths_json, event_document_paths_json, event_id),
        )
        conn.commit()

        cursor.close(); conn.close()
        return jsonify({
            "success": True,
            "message": "Files uploaded successfully",
            "event_id": event_id,
            "event_image_paths": image_paths,
            "event_document_paths": document_paths,
        }), 200

    except Exception as e:
        logger.error(f"Error uploading past event files: {str(e)}")
        return jsonify({"success": False, "message": "Upload failed"}), 500


@past_events_bp.route('/<int:event_id>', methods=['PUT'])
def update_past_event(event_id):
    """
    Update an existing past event.
    
    Args:
        event_id: The event ID
    
    Expected JSON payload:
    {
        "title": "Event Name",
        "type": "Conference",
        "date": "2024-11-09",
        "venue": "Event Location", 
        "description": "Event details/description",
        "attendees": "Number of attendees",
        "highlights": "Event highlights",
        "imagePaths": ["path1.jpg"],
        "documentPaths": ["doc1.pdf"]
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
        event_details = data.get('description', '').strip()
        
        # Handle image and document paths
        image_paths = data.get('imagePaths', [])
        document_paths = data.get('documentPaths', [])
        
        # Convert lists to JSON strings for storage
        event_image_paths = json.dumps(image_paths) if image_paths else None
        event_document_paths = json.dumps(document_paths) if document_paths else None
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update pastevents table
        update_sql = """UPDATE pastevents 
            SET event_name = %s, event_details = %s, event_location = %s, 
                event_date = %s, event_image_paths = %s, event_document_paths = %s
            WHERE id = %s"""
        
        update_values = (event_name, event_details, event_location, event_date,
                        event_image_paths, event_document_paths, event_id)
        
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
                "message": "Past event updated successfully"
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
        logger.error(f"Error updating past event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@past_events_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_past_event(event_id):
    """
    Delete a past event.
    
    Args:
        event_id: The event ID
    
    Returns:
        JSON response with success status and message
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM pastevents WHERE id = %s", (event_id,))
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
            "message": "Past event deleted successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting past event: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error deleting event"
        }), 500

