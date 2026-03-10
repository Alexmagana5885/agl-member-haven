"""Communications routes - Send messages to members with recipient selection."""
import os
import json
import logging
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
communications_bp = Blueprint('communications', __name__, url_prefix='/api/admin/messages')


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


# ==================== Member Search/Filter Endpoints ====================

@communications_bp.route('/members/search', methods=['GET'])
def search_members():
    """
    Search for members based on query string.
    Used for autocomplete in Specific Recipient field.
    
    Query params:
        q: Search query (name or email)
        limit: Maximum number of results (default 20)
    
    Returns:
        JSON response with list of matching members from personalmembership and organizationmembership
    """
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 20)
        
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 20
        
        if not query:
            return jsonify({
                "success": True,
                "members": []
            }), 200
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Search in both personalmembership and organizationmembership
        search_pattern = f"%{query}%"
        
        # Get personal members
        cursor.execute("""
            SELECT id, name as member_name, email, 'personal' as member_type
            FROM personalmembership
            WHERE name LIKE %s OR email LIKE %s
            LIMIT %s
        """, (search_pattern, search_pattern, limit))
        
        personal_members = cursor.fetchall()
        
        # Get organization members
        cursor.execute("""
            SELECT id, organization_name as member_name, organization_email as email, 'organization' as member_type
            FROM organizationmembership
            WHERE organization_name LIKE %s OR organization_email LIKE %s
            LIMIT %s
        """, (search_pattern, search_pattern, limit))
        
        organization_members = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Combine and return results
        all_members = personal_members + organization_members
        
        return jsonify({
            "success": True,
            "members": all_members
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching members: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error searching members"
        }), 500


@communications_bp.route('/members/all', methods=['GET'])
def get_all_members():
    """
    Get all members (personal and organization).
    Used for "All Members" recipient option.
    
    Returns:
        JSON response with list of all members
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all personal members
        cursor.execute("""
            SELECT id, name as member_name, email, 'personal' as member_type
            FROM personalmembership
            ORDER BY name
        """)
        
        personal_members = cursor.fetchall()
        
        # Get all organization members
        cursor.execute("""
            SELECT id, organization_name as member_name, organization_email as email, 'organization' as member_type
            FROM organizationmembership
            ORDER BY organization_name
        """)
        
        organization_members = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Combine results
        all_members = personal_members + organization_members
        
        return jsonify({
            "success": True,
            "members": all_members,
            "count": len(all_members)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching all members: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching members"
        }), 500


@communications_bp.route('/members/officials', methods=['GET'])
def get_officials():
    """
    Get all officials.
    Used for "Officials" recipient option.
    
    Returns:
        JSON response with list of officials
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get officials with their email from personalmembership
        cursor.execute("""
            SELECT o.id, o.personalmembership_email, o.position, o.start_date, o.number_of_terms,
                   p.name as member_name, p.email
            FROM officialsmembers o
            LEFT JOIN personalmembership p ON o.personalmembership_email = p.email
            ORDER BY o.position
        """)
        
        officials = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Convert date objects to strings
        for official in officials:
            if official.get('start_date'):
                official['start_date'] = str(official['start_date'])
        
        return jsonify({
            "success": True,
            "officials": officials,
            "count": len(officials)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching officials: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching officials"
        }), 500


# ==================== Message Sending Endpoints ====================

@communications_bp.route('', methods=['POST'])
def send_message():
    """
    Send a message to selected recipients.
    
    Expected JSON payload (NEW FORMAT):
    {
        "recipient_group": {
            "type": "all_members" | "officials" | "specific_recipients",
            "recipients": ["email1@example.com", "email2@example.com"]  // Only for specific_recipients
        },
        "subject": "Message Subject",
        "message": "Message content",
        "sender_name": "Sender Name",
        "sender_email": "sender@email.com"
    }
    
    Legacy format still supported for backward compatibility:
    {
        "recipient": "officials" | "all_members" | "specific_recipient",
        "recipient_email": "specific@email.com" (required if recipient is specific_recipient),
        ...
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
        
        # Extract input - check for new JSON format first, then fall back to legacy
        recipient_group = data.get('recipient_group')
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        sender_name = data.get('sender_name', 'AGL Admin').strip()
        sender_email = data.get('sender_email', 'admin@agl.or.ke').strip()
        
        # Handle new JSON format for recipient_group
        if recipient_group and isinstance(recipient_group, dict):
            recipient_type = recipient_group.get('type', '').strip().lower()
            specific_recipients = recipient_group.get('recipients', [])
        else:
            # Legacy format support
            recipient_type = data.get('recipient', '').strip().lower()
            recipient_email = data.get('recipient_email', '').strip()
            specific_recipients = [recipient_email] if recipient_email else []
        
        # Validation
        errors = []
        if not recipient_type:
            errors.append("Recipient type is required")
        elif recipient_type not in ['officials', 'all_members', 'specific_recipients', 'specific_recipient']:
            errors.append("Invalid recipient type. Must be: officials, all_members, or specific_recipients")
        
        if recipient_type in ['specific_recipients', 'specific_recipient'] and not specific_recipients:
            errors.append("At least one recipient email is required for specific recipient")
        
        if not subject:
            errors.append("Subject is required")
        if not message:
            errors.append("Message is required")
        
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Get recipients based on selection
        recipients = []
        
        if recipient_type == 'officials':
            recipients = _get_official_emails()
        elif recipient_type == 'all_members':
            recipients = _get_all_member_emails()
        elif recipient_type in ['specific_recipients', 'specific_recipient']:
            # Validate and filter the specific recipients
            recipients = [email.strip() for email in specific_recipients if email.strip() and '@' in email.strip()]
        
        if not recipients:
            return jsonify({
                "success": False,
                "message": "No recipients found for the selected category"
            }), 400
        
        # Store message in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Determine recipient_group string for storage (as JSON for new format)
        if recipient_type in ['specific_recipients', 'specific_recipient']:
            recipient_group_str = json.dumps({
                "type": "specific_recipients",
                "recipients": recipients
            })
        else:
            recipient_group_map = {
                'officials': 'Officials',
                'all_members': 'All Members'
            }
            recipient_group_str = recipient_group_map.get(recipient_type, recipient_type)
        
        # Insert message
        insert_sql = """INSERT INTO membermessages 
            (sender_name, sender_email, recipient_group, subject, message, date_sent) 
            VALUES (%s, %s, %s, %s, %s, NOW())"""
        
        insert_values = (sender_name, sender_email, recipient_group_str, subject, message)
        
        try:
            cursor.execute(insert_sql, insert_values)
            conn.commit()
            
            message_id = cursor.lastrowid
            cursor.close()
            conn.close()
            
            # TODO: Implement actual email sending here
            # For now, we just store the message
            
            logger.info(f"Message {message_id} sent to {len(recipients)} recipients: {recipients}")
            
            return jsonify({
                "success": True,
                "message": f"Message sent successfully to {len(recipients)} recipient(s)",
                "message_id": message_id,
                "recipients_count": len(recipients)
            }), 201
            
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "Database error occurred while sending message"
            }), 500
            
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@communications_bp.route('', methods=['GET'])
def get_messages():
    """
    Get all messages (for viewing message history).
    
    Returns:
        JSON response with list of messages
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, sender_name, sender_email, recipient_group, subject, message, date_sent
            FROM membermessages
            ORDER BY date_sent DESC
        """)
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings
        for result in results:
            if result.get('date_sent'):
                result['date_sent'] = str(result['date_sent'])
        
        return jsonify({
            "success": True,
            "messages": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching messages"
        }), 500


@communications_bp.route('/<int:message_id>', methods=['GET'])
def get_message(message_id):
    """
    Get a specific message by ID.
    
    Args:
        message_id: The message ID
    
    Returns:
        JSON response with message details
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, sender_name, sender_email, recipient_group, subject, message, date_sent
            FROM membermessages
            WHERE id = %s
        """, (message_id,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not result:
            return jsonify({
                "success": False,
                "message": "Message not found"
            }), 404
        
        # Convert datetime objects to strings
        if result.get('date_sent'):
            result['date_sent'] = str(result['date_sent'])
        
        return jsonify({
            "success": True,
            "message": result
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching message: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching message details"
        }), 500


# ==================== Helper Functions ====================

def _get_official_emails():
    """Get all official email addresses from officialsmembers and personalmembership."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT DISTINCT p.email
            FROM officialsmembers o
            JOIN personalmembership p ON o.personalmembership_email = p.email
            WHERE p.email IS NOT NULL AND p.email != ''
        """)
        
        emails = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return emails
        
    except Exception as e:
        logger.error(f"Error getting official emails: {str(e)}")
        return []


def _get_all_member_emails():
    """Get all member email addresses from personalmembership and organizationmembership."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get personal member emails
        cursor.execute("""
            SELECT email FROM personalmembership WHERE email IS NOT NULL AND email != ''
        """)
        personal_emails = [row[0] for row in cursor.fetchall()]
        
        # Get organization member emails
        cursor.execute("""
            SELECT organization_email FROM organizationmembership 
            WHERE organization_email IS NOT NULL AND organization_email != ''
        """)
        org_emails = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        # Combine and remove duplicates
        all_emails = list(set(personal_emails + org_emails))
        
        return all_emails
        
    except Exception as e:
        logger.error(f"Error getting all member emails: {str(e)}")
        return []

