"""Member Payments routes - retrieves payment records from member_payments table."""
import os
import logging
from flask import Blueprint, jsonify
import mysql.connector
from datetime import datetime

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
member_payments_bp = Blueprint('member_payments', __name__, url_prefix='/api/admin/payments')


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


def format_payment_date(timestamp):
    """Format timestamp to show date and time excluding seconds (just hours and minutes)."""
    if timestamp is None:
        return ""
    
    if isinstance(timestamp, datetime):
        return timestamp.strftime("%d %b %Y, %H:%M")
    
    try:
        dt = datetime.strptime(str(timestamp), "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%d %b %Y, %H:%M")
    except:
        return str(timestamp)


@member_payments_bp.route('/member-payments', methods=['GET'])
def get_member_payments():
    """
    Get all member payment records with member details.
    
    Returns a unified dataset that includes:
    - Name: from personalmembership.name OR organizationmembership.organization_name
    - Email: from personalmembership.email OR organizationmembership.organization_email
    - Phone: from personalmembership.phone OR organizationmembership.contact_phone_number
    - Payment Number: from member_payments.phone_number
    - Payment Date: from member_payments.timestamp (formatted without seconds)
    - Amount: from member_payments.amount
    - Payment Code: from member_payments.payment_code
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query to get all payments and join with both membership tables
        # LEFT JOIN is used to handle cases where membership info might not exist
        query = """
        SELECT 
            mp.id as payment_id,
            mp.member_email,
            mp.phone_number as payment_number,
            mp.payment_code,
            mp.amount,
            mp.timestamp,
            -- Personal membership fields
            pm.name as personal_name,
            pm.email as personal_email,
            pm.phone as personal_phone,
            -- Organization membership fields
            om.organization_name,
            om.organization_email,
            om.contact_phone_number
        FROM member_payments mp
        LEFT JOIN personalmembership pm ON pm.email = mp.member_email
        LEFT JOIN organizationmembership om ON om.organization_email = mp.member_email
        ORDER BY mp.timestamp DESC
        """
        
        cursor.execute(query)
        payments = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Transform the results into unified format
        unified_data = []
        for payment in payments:
            # Determine membership type and get appropriate fields
            if payment['personal_name']:
                # Personal membership
                name = payment['personal_name']
                email = payment['personal_email']
                phone = payment['personal_phone']
                membership_type = 'personal'
            elif payment['organization_name']:
                # Organization membership
                name = payment['organization_name']
                email = payment['organization_email']
                phone = payment['contact_phone_number']
                membership_type = 'organization'
            else:
                # No matching membership found
                name = payment['member_email']  # Use email as fallback
                email = payment['member_email']
                phone = payment['payment_number'] or ''
                membership_type = 'unknown'
            
            unified_data.append({
                'id': payment['payment_id'],
                'name': name,
                'contacts': {
                    'email': email,
                    'phone': phone if phone else ''
                },
                'paymentNumber': payment['payment_number'] or '',
                'paymentDate': format_payment_date(payment['timestamp']),
                'amount': float(payment['amount']) if payment['amount'] else 0,
                'paymentCode': payment['payment_code'] or '',
                'membershipType': membership_type
            })
        
        logger.info(f"Retrieved {len(unified_data)} payment records")
        
        return jsonify({
            'status': 'success',
            'data': unified_data,
            'count': len(unified_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching member payments: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Failed to fetch payment records: {str(e)}"
        }), 500


@member_payments_bp.route('/member-payments/<int:payment_id>', methods=['GET'])
def get_member_payment_by_id(payment_id):
    """
    Get a specific payment record by ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            mp.id as payment_id,
            mp.member_email,
            mp.phone_number as payment_number,
            mp.payment_code,
            mp.amount,
            mp.timestamp,
            pm.name as personal_name,
            pm.email as personal_email,
            pm.phone as personal_phone,
            om.organization_name,
            om.organization_email,
            om.contact_phone_number
        FROM member_payments mp
        LEFT JOIN personalmembership pm ON pm.email = mp.member_email
        LEFT JOIN organizationmembership om ON om.organization_email = mp.member_email
        WHERE mp.id = %s
        """
        
        cursor.execute(query, (payment_id,))
        payment = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not payment:
            return jsonify({
                'status': 'error',
                'message': 'Payment not found'
            }), 404
        
        # Transform to unified format
        if payment['personal_name']:
            name = payment['personal_name']
            email = payment['personal_email']
            phone = payment['personal_phone']
            membership_type = 'personal'
        elif payment['organization_name']:
            name = payment['organization_name']
            email = payment['organization_email']
            phone = payment['contact_phone_number']
            membership_type = 'organization'
        else:
            name = payment['member_email']
            email = payment['member_email']
            phone = payment['payment_number'] or ''
            membership_type = 'unknown'
        
        unified_data = {
            'id': payment['payment_id'],
            'name': name,
            'contacts': {
                'email': email,
                'phone': phone if phone else ''
            },
            'paymentNumber': payment['payment_number'] or '',
            'paymentDate': format_payment_date(payment['timestamp']),
            'amount': float(payment['amount']) if payment['amount'] else 0,
            'paymentCode': payment['payment_code'] or '',
            'membershipType': membership_type
        }
        
        return jsonify({
            'status': 'success',
            'data': unified_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching payment {payment_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Failed to fetch payment: {str(e)}"
        }), 500

