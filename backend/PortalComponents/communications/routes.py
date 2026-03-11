"""Communications routes - Send messages to members with recipient selection."""
import os
import json
import logging
from flask import Blueprint, jsonify, request, session
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


def get_user_email_from_session():
    """Get user email from session."""
    return session.get('user_email')


def is_user_official(email):
    """Check if user is an official member."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM officialsmembers WHERE personalmembership_email = %s", (email,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result[0] > 0 if result else False
    except Exception as e:
        logger.error(f"Error checking official status: {str(e)}")
        return False


def can_user_see_message(recipient_group, user_email):
    """Check if user can see a message based on recipient_group."""
    try:
        # Parse recipient_group if it's a JSON string
        if isinstance(recipient_group, str):
            try:
                recipient_group = json.loads(recipient_group)
            except:
                # Legacy format - direct string
                if recipient_group.lower() == 'all members':
                    return True
                elif recipient_group.lower() == 'officials':
                    return is_user_official(user_email)
                return False
        
        if isinstance(recipient_group, dict):
            recipient_type = recipient_group.get('type', '').lower()
            if recipient_type == 'all_members':
                return True
            elif recipient_type == 'officials':
                return is_user_official(user_email)
            elif recipient_type == 'specific_recipients':
                recipients = recipient_group.get('recipients', [])
                return user_email in recipients
        elif isinstance(recipient_group, str):
            # Legacy format
            if recipient_group.lower() == 'all members':
                return True
            elif recipient_group.lower() == 'officials':
                return is_user_official(user_email)
                
        return False
    except Exception as e:
        logger.error(f"Error checking message visibility: {str(e)}")
        return False


# ==================== Member Search/Filter Endpoints ====================

@communications_bp.route('/members/search', methods=['GET'])
def search_members():
    """Search for members based on query string."""
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 20)
        
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 20
        
        if not query:
            return jsonify({"success": True, "members": []}), 200
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        search_pattern = f"%{query}%"
        
        cursor.execute("""
            SELECT id, name as member_name, email, 'personal' as member_type
            FROM personalmembership
            WHERE name LIKE %s OR email LIKE %s
            LIMIT %s
        """, (search_pattern, search_pattern, limit))
        personal_members = cursor.fetchall()
        
        cursor.execute("""
            SELECT id, organization_name as member_name, organization_email as email, 'organization' as member_type
            FROM organizationmembership
            WHERE organization_name LIKE %s OR organization_email LIKE %s
            LIMIT %s
        """, (search_pattern, search_pattern, limit))
        organization_members = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        all_members = personal_members + organization_members
        return jsonify({"success": True, "members": all_members}), 200
        
    except Exception as e:
        logger.error(f"Error searching members: {str(e)}")
        return jsonify({"success": False, "message": "Error searching members"}), 500


@communications_bp.route('/members/all', methods=['GET'])
def get_all_members():
    """Get all members (personal and organization)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT id, name as member_name, email, 'personal' as member_type FROM personalmembership ORDER BY name")
        personal_members = cursor.fetchall()
        
        cursor.execute("SELECT id, organization_name as member_name, organization_email as email, 'organization' as member_type FROM organizationmembership ORDER BY organization_name")
        organization_members = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        all_members = personal_members + organization_members
        return jsonify({"success": True, "members": all_members, "count": len(all_members)}), 200
        
    except Exception as e:
        logger.error(f"Error fetching all members: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching members"}), 500


@communications_bp.route('/members/officials', methods=['GET'])
def get_officials():
    """Get all officials."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
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
        
        for official in officials:
            if official.get('start_date'):
                official['start_date'] = str(official['start_date'])
        
        return jsonify({"success": True, "officials": officials, "count": len(officials)}), 200
        
    except Exception as e:
        logger.error(f"Error fetching officials: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching officials"}), 500


# ==================== User Messages Endpoints ====================

@communications_bp.route('/my-messages', methods=['GET'])
def get_my_messages():
    """Get messages for the logged-in user based on their membership."""
    try:
        user_email = get_user_email_from_session()
        
        if not user_email:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all messages
        cursor.execute("""
            SELECT id, sender_name, sender_email, recipient_group, subject, message, date_sent
            FROM membermessages
            ORDER BY date_sent DESC
        """)
        
        all_messages = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Filter messages the user can see
        visible_messages = []
        for msg in all_messages:
            if can_user_see_message(msg['recipient_group'], user_email):
                msg['date_sent'] = str(msg['date_sent']) if msg['date_sent'] else None
                # Check if user has replied to this message
                msg['has_replied'] = False
                visible_messages.append(msg)
        
        return jsonify({
            "success": True,
            "messages": visible_messages,
            "count": len(visible_messages)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user messages: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching messages"}), 500


@communications_bp.route('/reply', methods=['POST'])
def reply_to_message():
    """Reply to a specific message."""
    try:
        user_email = get_user_email_from_session()
        
        if not user_email:
            return jsonify({"success": False, "message": "Not authenticated"}), 401
        
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "message": "Invalid request data"}), 400
        
        original_message_id = data.get('message_id')
        reply_message = data.get('message', '').strip()
        
        if not original_message_id:
            return jsonify({"success": False, "message": "Message ID is required"}), 400
        
        if not reply_message:
            return jsonify({"success": False, "message": "Reply message is required"}), 400
        
        # Get the original message to get sender info
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM membermessages WHERE id = %s", (original_message_id,))
        original_msg = cursor.fetchone()
        
        if not original_msg:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Original message not found"}), 404
        
        # Get user info for reply
        cursor.execute("SELECT name FROM personalmembership WHERE email = %s", (user_email,))
        user_row = cursor.fetchone()
        sender_name = user_row['name'] if user_row else 'Member'
        
        # Insert reply (as a new message to the original sender)
        # For replies, we send back to the original sender
        recipient_email = original_msg['sender_email']
        
        insert_sql = """
            INSERT INTO membermessages 
            (sender_name, sender_email, recipient_group, subject, message, date_sent) 
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        
        # Create subject for reply
        reply_subject = f"Re: {original_msg['subject']}"
        
        # Store reply with specific recipient
        reply_recipient_group = json.dumps({
            "type": "specific_recipients",
            "recipients": [recipient_email]
        })
        
        insert_values = (sender_name, user_email, reply_recipient_group, reply_subject, reply_message)
        
        cursor.execute(insert_sql, insert_values)
        conn.commit()
        
        reply_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Reply sent successfully",
            "reply_id": reply_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error sending reply: {str(e)}")
        return jsonify({"success": False, "message": "Error sending reply"}), 500


# ==================== Message Sending Endpoints ====================

@communications_bp.route('', methods=['POST'])
def send_message():
    """Send a message to selected recipients."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "message": "Invalid request data"}), 400
        
        recipient_group = data.get('recipient_group')
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        sender_name = data.get('sender_name', 'AGL Admin').strip()
        sender_email = data.get('sender_email', 'admin@agl.or.ke').strip()
        
        if recipient_group and isinstance(recipient_group, dict):
            recipient_type = recipient_group.get('type', '').strip().lower()
            specific_recipients = recipient_group.get('recipients', [])
        else:
            recipient_type = data.get('recipient', '').strip().lower()
            recipient_email = data.get('recipient_email', '').strip()
            specific_recipients = [recipient_email] if recipient_email else []
        
        errors = []
        if not recipient_type:
            errors.append("Recipient type is required")
        elif recipient_type not in ['officials', 'all_members', 'specific_recipients', 'specific_recipient']:
            errors.append("Invalid recipient type")
        
        if recipient_type in ['specific_recipients', 'specific_recipient'] and not specific_recipients:
            errors.append("At least one recipient email is required")
        
        if not subject:
            errors.append("Subject is required")
        if not message:
            errors.append("Message is required")
        
        if errors:
            return jsonify({"success": False, "message": "Validation failed", "errors": errors}), 400
        
        recipients = []
        
        if recipient_type == 'officials':
            recipients = _get_official_emails()
        elif recipient_type == 'all_members':
            recipients = _get_all_member_emails()
        elif recipient_type in ['specific_recipients', 'specific_recipient']:
            recipients = [email.strip() for email in specific_recipients if email.strip() and '@' in email.strip()]
        
        if not recipients:
            return jsonify({"success": False, "message": "No recipients found"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if recipient_type in ['specific_recipients', 'specific_recipient']:
            recipient_group_str = json.dumps({
                "type": "specific_recipients",
                "recipients": recipients
            })
        else:
            recipient_group_map = {'officials': 'Officials', 'all_members': 'All Members'}
            recipient_group_str = recipient_group_map.get(recipient_type, recipient_type)
        
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
            
            logger.info(f"Message {message_id} sent to {len(recipients)} recipients")
            
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
            return jsonify({"success": False, "message": "Database error occurred"}), 500
            
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred"}), 500


@communications_bp.route('', methods=['GET'])
def get_messages():
    """Get all messages (for viewing message history)."""
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
        
        for result in results:
            if result.get('date_sent'):
                result['date_sent'] = str(result['date_sent'])
        
        return jsonify({"success": True, "messages": results}), 200
        
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching messages"}), 500


@communications_bp.route('/<int:message_id>', methods=['GET'])
def get_message(message_id):
    """Get a specific message by ID."""
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
            return jsonify({"success": False, "message": "Message not found"}), 404
        
        if result.get('date_sent'):
            result['date_sent'] = str(result['date_sent'])
        
        return jsonify({"success": True, "message": result}), 200
        
    except Exception as e:
        logger.error(f"Error fetching message: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching message details"}), 500


# ==================== Helper Functions ====================

def _get_official_emails():
    """Get all official email addresses."""
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
    """Get all member email addresses."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT email FROM personalmembership WHERE email IS NOT NULL AND email != ''")
        personal_emails = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("SELECT organization_email FROM organizationmembership WHERE organization_email IS NOT NULL AND organization_email != ''")
        org_emails = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        all_emails = list(set(personal_emails + org_emails))
        return all_emails
        
    except Exception as e:
        logger.error(f"Error getting all member emails: {str(e)}")
        return []
