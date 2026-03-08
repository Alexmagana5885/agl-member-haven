"""Planned Events Registration routes - STK Push for event registration payments."""
import os
import re
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
import requests
import mysql.connector

# Import access token from registration module
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from PortalComponents.payments.registration.accessToken import get_access_token

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
events_bp = Blueprint('events', __name__, url_prefix='/api/payments/events')

# M-Pesa API Configuration - Using environment variables with fallbacks
MPESA_BUSINESS_SHORT_CODE = os.environ.get("MPESA_BUSINESS_SHORT_CODE", "8209382")
MPESA_PASSKEY = os.environ.get("MPESA_PASSKEY", "your_passkey_here")
MPESA_CALLBACK_URL = os.environ.get("MPESA_EVENTS_CALLBACK_URL", "https://member.log.agl.or.ke/members/forms/Payment/Mpesa-Daraja-Api-main/callbackEventR.php")
MPESA_ENVIRONMENT = os.environ.get("MPESA_ENVIRONMENT", "sandbox")

# Party B (Business Paybill)
MPESA_PARTY_B = os.environ.get("MPESA_PARTY_B", "8209382")
# Account Reference
MPESA_ACCOUNT_REFERENCE = os.environ.get("MPESA_ACCOUNT_REFERENCE", "6175135")

# STK Push API URLs
if MPESA_ENVIRONMENT == "production":
    MPESA_STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    MPESA_STK_QUERY_URL = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
else:
    MPESA_STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    MPESA_STK_QUERY_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"


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


def normalize_phone_number(phone_number):
    """
    Normalize phone number to M-Pesa format (254XXXXXXXXX).
    Handles various input formats:
    - +254XXXXXXXXX
    - 254XXXXXXXXX
    - 0XXXXXXXXX (Kenyan mobile)
    - XXXXXXXXX (9 digits)
    """
    if not phone_number:
        return None
    
    # Remove all whitespace
    phone_number = re.sub(r'\s+', '', phone_number)
    
    # Remove + prefix if present
    if phone_number.startswith('+'):
        phone_number = phone_number[1:]
    
    # Handle numbers starting with 0
    if phone_number.startswith('0') and len(phone_number) == 10:
        phone_number = '254' + phone_number[1:]
    
    # If it starts with 7, 8, or 9 and is 9 digits, add 254
    if re.match(r'^[789]\d{8}$', phone_number):
        phone_number = '254' + phone_number
    
    return phone_number


def generate_password():
    """Generate M-Pesa API password (BusinessShortCode + Passkey + Timestamp)."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password_string = f"{MPESA_BUSINESS_SHORT_CODE}{MPESA_PASSKEY}{timestamp}"
    import base64
    password = base64.b64encode(password_string.encode('utf-8')).decode('utf-8')
    return password, timestamp


def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    """
    Initiate STK Push payment request.
    
    Args:
        phone_number: Customer phone number (normalized to 254XXXXXXXXX)
        amount: Payment amount in KES
        account_reference: Account reference for the transaction
        transaction_desc: Description of the transaction
    
    Returns:
        dict: Response containing success status, CheckoutRequestID, and message
    """
    # Get access token
    access_token = get_access_token()
    
    if not access_token:
        logger.error("Failed to get M-Pesa access token")
        return {
            "success": False,
            "message": "Failed to connect to payment service. Please try again.",
            "error": "Access token unavailable"
        }
    
    # Generate password and timestamp
    password, timestamp = generate_password()
    
    # Prepare STK Push request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    
    payload = {
        "BusinessShortCode": MPESA_BUSINESS_SHORT_CODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerBuyGoodsOnline",
        "Amount": str(amount),
        "PartyA": phone_number,
        "PartyB": MPESA_PARTY_B,
        "PhoneNumber": phone_number,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }
    
    logger.info(f"Initiating STK Push: Phone={phone_number}, Amount={amount}, AccountRef={account_reference}")
    
    try:
        response = requests.post(
            MPESA_STK_PUSH_URL,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        response_data = response.json()
        logger.info(f"STK Push Response: {response_data}")
        
        if response.status_code == 200:
            if response_data.get("ResponseCode") == "0":
                # Success
                return {
                    "success": True,
                    "message": "Kindly enter your M-Pesa Pin to complete the payment",
                    "CheckoutRequestID": response_data.get("CheckoutRequestID"),
                    "ResponseCode": response_data.get("ResponseCode")
                }
            else:
                # Request failed
                return {
                    "success": False,
                    "message": response_data.get("ResponseDescription", "Payment request failed"),
                    "error": response_data.get("ResponseCode")
                }
        else:
            return {
                "success": False,
                "message": "Payment service error. Please try again.",
                "error": f"HTTP {response.status_code}"
            }
            
    except requests.exceptions.RequestException as e:
        logger.error(f"STK Push request exception: {str(e)}")
        return {
            "success": False,
            "message": "Unable to connect to payment service. Please check your internet connection.",
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"STK Push error: {str(e)}")
        return {
            "success": False,
            "message": "An unexpected error occurred. Please try again.",
            "error": str(e)
        }


def send_confirmation_email(email, member_name, event_name, event_location, event_date):
    """
    Send confirmation email for successful event registration.
    
    Args:
        email: Member's email address
        member_name: Member's name
        event_name: Event name
        event_location: Event location
        event_date: Event date
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Email configuration
        smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_user = os.environ.get("SMTP_USER", "events@agl.or.ke")
        smtp_password = os.environ.get("SMTP_PASSWORD", "")
        
        # Skip if no SMTP password configured
        if not smtp_password:
            logger.warning("SMTP password not configured, skipping email")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = email
        msg['Subject'] = "Event Registration Successful!"
        
        message = f"""Dear {member_name},

Thank you for registering for {event_name}! 
We're excited to have you join us on {event_date}.

Event Details:

Location: {event_location}
Date: {event_date}

Please check your email for more details and any future updates.

We look forward to seeing you there!

Warm regards,
The AGL Team
"""
        
        msg.attach(MIMEText(message, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, email, msg.as_string())
        server.quit()
        
        logger.info(f"Confirmation email sent to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False


@events_bp.route('/register', methods=['POST'])
def register_event():
    """
    Process event registration.
    
    Expected JSON payload:
    {
        "event_id": "31",
        "event_name": "Event Name",
        "event_location": "Event Location",
        "event_date": "2025-03-23",
        "email": "user@example.com",
        "member_name": "John Doe",
        "phone": "0722000000",
        "amount": "0" or "500"
    }
    
    If amount is 0 or empty, registration is free and no STK push is initiated.
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract and validate input
        event_id = data.get('event_id', '').strip()
        event_name = data.get('event_name', '').strip()
        event_location = data.get('event_location', '').strip()
        event_date = data.get('event_date', '').strip()
        email = data.get('email', '').strip()
        member_name = data.get('member_name', '').strip()
        phone = data.get('phone', '').strip()
        amount = data.get('amount')
        
        # Validation
        errors = []
        if not event_id:
            errors.append("Event ID is required")
        if not event_name:
            errors.append("Event name is required")
        if not event_location:
            errors.append("Event location is required")
        if not event_date:
            errors.append("Event date is required")
        if not email:
            errors.append("Email is required")
        if not member_name:
            errors.append("Member name is required")
        if not phone:
            errors.append("Phone number is required")
        
        if errors:
            return jsonify({
                "success": False,
                "message": "Validation failed",
                "errors": errors
            }), 400
        
        # Normalize phone number
        normalized_phone = normalize_phone_number(phone)
        if not normalized_phone:
            return jsonify({
                "success": False,
                "message": "Invalid phone number format"
            }), 400
        
        # Parse amount
        try:
            if amount:
                payment_amount = float(str(amount).replace(',', '').replace(' ', '').strip())
            else:
                payment_amount = 0
        except (ValueError, TypeError):
            payment_amount = 0
        
        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the user is already registered for the event
        check_sql = "SELECT id FROM event_registrations WHERE event_id = %s AND member_email = %s"
        cursor.execute(check_sql, (event_id, email))
        check_result = cursor.fetchone()
        
        if check_result:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": "You have already registered for this event."
            }), 400
        
        # If amount is 0, insert into event_registrations and skip STK push
        if payment_amount == 0:
            insert_sql = """INSERT INTO event_registrations 
                (event_id, event_name, event_location, event_date, member_email, member_name, contact, registration_date, payment_code) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), '00')"""
            insert_values = (event_id, event_name, event_location, event_date, email, member_name, normalized_phone)
            
            try:
                cursor.execute(insert_sql, insert_values)
                conn.commit()
                
                # Send confirmation email
                try:
                    send_confirmation_email(email, member_name, event_name, event_location, event_date)
                except Exception as email_err:
                    logger.error(f"Error sending confirmation email: {email_err}")
                
                cursor.close()
                conn.close()
                
                return jsonify({
                    "success": True,
                    "message": "Registration successful. No payment required."
                }), 200
                
            except mysql.connector.Error as err:
                logger.error(f"Database error: {err}")
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "Database error occurred during registration"
                }), 500
        
        # Proceed with STK push for non-0 amount
        result = initiate_stk_push(
            phone_number=normalized_phone,
            amount=int(payment_amount),
            account_reference=MPESA_ACCOUNT_REFERENCE,
            transaction_desc=f"Event registration: {event_name}"
        )
        
        if result.get("success"):
            # Save to eventregcheckout table
            checkout_id = result.get("CheckoutRequestID")
            status = "Pending"
            
            event_sql = """INSERT INTO eventregcheckout 
                (CheckoutRequestID, event_id, event_name, event_location, event_date, email, member_name, phone, amount, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            event_values = (checkout_id, event_id, event_name, event_location, event_date, email, member_name, normalized_phone, payment_amount, status)
            
            try:
                cursor.execute(event_sql, event_values)
                conn.commit()
                
                cursor.close()
                conn.close()
                
                return jsonify({
                    "success": True,
                    "message": result.get("message"),
                    "CheckoutRequestID": checkout_id
                }), 200
                
            except mysql.connector.Error as err:
                logger.error(f"Database error saving checkout: {err}")
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "Failed to process registration"
                }), 500
        else:
            cursor.close()
            conn.close()
            return jsonify({
                "success": False,
                "message": result.get("message", "Payment failed")
            }), 400
            
    except Exception as e:
        logger.error(f"Error processing event registration: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@events_bp.route('/check-registration/<event_id>/<email>', methods=['GET'])
def check_registration(event_id, email):
    """
    Check if a user is already registered for an event.
    
    Args:
        event_id: The event ID
        email: The user's email
    
    Returns:
        JSON response with registration status
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, member_name, registration_date FROM event_registrations WHERE event_id = %s AND member_email = %s",
            (event_id, email)
        )
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            return jsonify({
                "success": True,
                "registered": True,
                "data": {
                    "id": result[0],
                    "member_name": result[1],
                    "registration_date": str(result[2])
                }
            }), 200
        else:
            return jsonify({
                "success": True,
                "registered": False
            }), 200
            
    except Exception as e:
        logger.error(f"Error checking registration: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error checking registration status"
        }), 500


@events_bp.route('/my-events/<email>', methods=['GET'])
def get_my_events(email):
    """
    Get all events a user has registered for.
    
    Args:
        email: The user's email
    
    Returns:
        JSON response with list of registered events
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT er.id, er.event_id, er.event_name, er.event_location, er.event_date, 
                   er.registration_date, er.payment_code
            FROM event_registrations er
            WHERE er.member_email = %s
            ORDER BY er.event_date DESC
        """, (email,))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime objects to strings
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
        logger.error(f"Error fetching user events: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching events"
        }), 500

