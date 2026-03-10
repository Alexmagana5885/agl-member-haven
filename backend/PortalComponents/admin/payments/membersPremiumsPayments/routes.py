"""Member Premiums Payments routes - retrieves payment records from member_premium_payments table with registration fees and member details."""
import os
import logging
from flask import Blueprint, jsonify
import mysql.connector
from datetime import datetime

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
member_premiums_payments_bp = Blueprint('member_premiums_payments', __name__, url_prefix='/api/admin/payments')


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


@member_premiums_payments_bp.route('/member-premiums-payments', methods=['GET'])
def get_member_premiums_payments():
    """
    Get all member premium payments with registration fees and member details.
    
    Returns a unified dataset that includes:
    - Name: from personalmembership.name OR organizationmembership.organization_name
    - Email: from personalmembership.email OR organizationmembership.organization_email
    - Phone: from personalmembership.phone OR organizationmembership.contact_phone_number
    - Premium Payment: from member_premium_payments (payment_code, amount, timestamp)
    - Registration Fee: SUM of all payments from member_registration_payments table
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query to get all premium payments and join with membership tables
        # Also get SUM of registration fees from member_registration_payments table
        query = """
        SELECT 
            mpp.id as premium_payment_id,
            mpp.member_email as premium_email,
            mpp.phone_number as premium_phone,
            mpp.payment_code as premium_payment_code,
            mpp.amount as premium_amount,
            mpp.timestamp as premium_timestamp,
            -- Registration payment fields - now using SUM
            mrp.registration_count,
            mrp.total_registration_amount,
            mrp.latest_registration_payment_code,
            mrp.latest_registration_timestamp,
            -- Personal membership fields
            pm.name as personal_name,
            pm.email as personal_email,
            pm.phone as personal_phone,
            -- Organization membership fields
            om.organization_name,
            om.organization_email,
            om.contact_person,
            om.contact_phone_number
        FROM member_premium_payments mpp
        LEFT JOIN personalmembership pm ON pm.email = mpp.member_email
        LEFT JOIN organizationmembership om ON om.organization_email = mpp.member_email
        LEFT JOIN (
            SELECT 
                member_email,
                COUNT(*) as registration_count,
                SUM(amount) as total_registration_amount,
                MAX(timestamp) as latest_registration_timestamp,
                MAX(payment_code) as latest_registration_payment_code
            FROM member_registration_payments
            GROUP BY member_email
        ) mrp ON mrp.member_email = mpp.member_email
        ORDER BY mpp.timestamp DESC
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
                # No matching membership found - use email from premium payments
                name = payment['premium_email']
                email = payment['premium_email']
                phone = payment['premium_phone'] or ''
                membership_type = 'unknown'
            
            # Check if registration payments exist
            has_registration = payment['registration_count'] and payment['registration_count'] > 0
            
            unified_data.append({
                'id': payment['premium_payment_id'],
                'name': name,
                'contacts': {
                    'email': email,
                    'phone': phone if phone else ''
                },
                'premiumFee': {
                    'paymentCode': payment['premium_payment_code'] or '',
                    'amount': float(payment['premium_amount']) if payment['premium_amount'] else 0,
                    'paymentDate': format_payment_date(payment['premium_timestamp'])
                },
                'registrationFee': {
                    'paymentCode': payment['latest_registration_payment_code'] or '',
                    'amount': float(payment['total_registration_amount']) if payment['total_registration_amount'] else 0,
                    'paymentDate': format_payment_date(payment['latest_registration_timestamp'])
                } if has_registration else None,
                'membershipType': membership_type
            })
        
        logger.info(f"Retrieved {len(unified_data)} premium payment records")
        
        return jsonify({
            'status': 'success',
            'data': unified_data,
            'count': len(unified_data)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching member premium payments: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Failed to fetch payment records: {str(e)}"
        }), 500


@member_premiums_payments_bp.route('/member-premiums-payments/<int:payment_id>', methods=['GET'])
def get_member_premium_payment_by_id(payment_id):
    """
    Get a specific premium payment record by ID with summed registration fees.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            mpp.id as premium_payment_id,
            mpp.member_email as premium_email,
            mpp.phone_number as premium_phone,
            mpp.payment_code as premium_payment_code,
            mpp.amount as premium_amount,
            mpp.timestamp as premium_timestamp,
            -- Registration payment fields - now using SUM
            mrp.registration_count,
            mrp.total_registration_amount,
            mrp.latest_registration_payment_code,
            mrp.latest_registration_timestamp,
            pm.name as personal_name,
            pm.email as personal_email,
            pm.phone as personal_phone,
            om.organization_name,
            om.organization_email,
            om.contact_person,
            om.contact_phone_number
        FROM member_premium_payments mpp
        LEFT JOIN personalmembership pm ON pm.email = mpp.member_email
        LEFT JOIN organizationmembership om ON om.organization_email = mpp.member_email
        LEFT JOIN (
            SELECT 
                member_email,
                COUNT(*) as registration_count,
                SUM(amount) as total_registration_amount,
                MAX(timestamp) as latest_registration_timestamp,
                MAX(payment_code) as latest_registration_payment_code
            FROM member_registration_payments
            GROUP BY member_email
        ) mrp ON mrp.member_email = mpp.member_email
        WHERE mpp.id = %s
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
            name = payment['premium_email']
            email = payment['premium_email']
            phone = payment['premium_phone'] or ''
            membership_type = 'unknown'
        
        # Check if registration payments exist
        has_registration = payment['registration_count'] and payment['registration_count'] > 0
        
        unified_data = {
            'id': payment['premium_payment_id'],
            'name': name,
            'contacts': {
                'email': email,
                'phone': phone if phone else ''
            },
            'premiumFee': {
                'paymentCode': payment['premium_payment_code'] or '',
                'amount': float(payment['premium_amount']) if payment['premium_amount'] else 0,
                'paymentDate': format_payment_date(payment['premium_timestamp'])
            },
            'registrationFee': {
                'paymentCode': payment['latest_registration_payment_code'] or '',
                'amount': float(payment['total_registration_amount']) if payment['total_registration_amount'] else 0,
                'paymentDate': format_payment_date(payment['latest_registration_timestamp'])
            } if has_registration else None,
            'membershipType': membership_type
        }
        
        return jsonify({
            'status': 'success',
            'data': unified_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching premium payment {payment_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Failed to fetch payment: {str(e)}"
        }), 500

