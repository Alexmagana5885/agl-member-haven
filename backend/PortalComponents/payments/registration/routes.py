"""Member Registration Payments routes - STK Push for membership fee and premium payments."""
import os
import re
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
import requests
import mysql.connector

from .accessToken import get_access_token

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
registration_payments_bp = Blueprint('registration_payments', __name__, url_prefix='/api/payments')

# M-Pesa API Configuration - Using environment variables with fallbacks
MPESA_BUSINESS_SHORT_CODE = os.environ.get("MY_BUSINESS_SHORT_CODE", "8209382")
MPESA_PASSKEY = os.environ.get("MY_PASS_KEY", "your_passkey_here")
MPESA_CALLBACK_URL = os.environ.get("MPESA_CALLBACK_URL", "https://member.log.agl.or.ke/members/forms/Payment/callback.php")
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

# Payment amounts
MEMBERSHIP_FEE_AMOUNT = 2000
MEMBERSHIP_PREMIUM_AMOUNT = 3600


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


def save_mpesa_transaction(checkout_request_id, email, phone, amount, payment_type, status="Pending"):
    """
    Save M-Pesa transaction to database.
    
    Args:
        checkout_request_id: M-Pesa transaction ID
        email: Customer email
        phone: Customer phone number
        amount: Payment amount
        payment_type: "fee" or "premium"
        status: Transaction status (default: Pending)
    
    Returns:
        bool: True if saved successfully, False otherwise
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Determine which table to insert into based on payment type
        if payment_type == "fee":
            table_name = "member_registration_payments"
        else:  # premium
            table_name = "member_premium_payments"
        
        # Insert into mpesa_transactions table
        mpesa_sql = """
            INSERT INTO mpesa_transactions (CheckoutRequestID, email, phone, amount, status, transaction_date)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        mpesa_values = (checkout_request_id, email, phone, amount, status)
        cursor.execute(mpesa_sql, mpesa_values)
        
        # Also insert into the specific payment table
        payment_sql = f"""
            INSERT INTO {table_name} (member_email, phone_number, payment_code, amount, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
        """
        payment_values = (email, phone, checkout_request_id, amount)
        cursor.execute(payment_sql, payment_values)
        
        # Insert into invoices table
        invoice_sql = """
            INSERT INTO invoices (payment_description, amount_billed, amount_paid, user_email, invoice_date)
            VALUES (%s, %s, %s, %s, NOW())
        """
        description = "Membership Registration Payment" if payment_type == "fee" else "Membership Premium Payment"
        invoice_values = (description, amount, 0, email)
        cursor.execute(invoice_sql, invoice_values)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Transaction saved: {checkout_request_id}, Type: {payment_type}")
        return True
        
    except mysql.connector.Error as err:
        logger.error(f"Database error saving transaction: {err}")
        return False
    except Exception as e:
        logger.error(f"Error saving transaction: {str(e)}")\n        return False\n\n\ndef save_registration_transaction(checkout_request_id, userEmail, phone, money, status="Pending"):\n    \"\"\"Save only to mpesa_transactions like PHP registration script.\"\"\"\n    try:\n        conn = get_db_connection()\n        cursor = conn.cursor()\n        sql = \"INSERT INTO mpesa_transactions (CheckoutRequestID, email, phone, amount, status) VALUES (%s, %s, %s, %s, %s)\"\n        cursor.execute(sql, (checkout_request_id, userEmail, phone, money, status))\n        conn.commit()\n        cursor.close()\n        conn.close()\n        logger.info(f"Registration transaction saved: {checkout_request_id}")\n        return True\n    except Exception as e:\n        logger.error(f"Error saving registration transaction: {str(e)}")\n        return False


@registration_payments_bp.route('/register-fee', methods=['POST'])
def pay_membership_fee():
    """
    Process membership registration fee payment.
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "phone": "0722000000",
        "amount": "2000" (optional, defaults to 2000)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract and validate input
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        amount = data.get('amount')
        
        # Validation
        errors = []
        if not email:
            errors.append("Email is required")
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
        
        # Use provided amount or default to membership fee
        # Remove any commas/thousand separators and convert to integer
        if amount:
            try:
                # Strip any formatting characters (commas, spaces, etc.)
                clean_amount = str(amount).replace(',', '').replace(' ', '').strip()
                payment_amount = int(clean_amount)
            except (ValueError, TypeError):
                payment_amount = MEMBERSHIP_FEE_AMOUNT
        else:
            payment_amount = MEMBERSHIP_FEE_AMOUNT
        
        # Initiate STK Push
        result = initiate_stk_push(
            phone_number=normalized_phone,
            amount=payment_amount,
            account_reference=MPESA_ACCOUNT_REFERENCE,
            transaction_desc="Membership Registration fee payment"
        )
        
        if result.get("success"):
            # Save transaction to database
            checkout_id = result.get("CheckoutRequestID")
            save_mpesa_transaction(
                checkout_request_id=checkout_id,
                email=email,
                phone=normalized_phone,
                amount=payment_amount,
                payment_type="fee",
                status="Pending"
            )
            
            return jsonify({
                "success": True,
                "message": result.get("message"),
                "CheckoutRequestID": checkout_id
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": result.get("message", "Payment failed")
            }), 400
            
    except Exception as e:
        logger.error(f"Error processing membership fee payment: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@registration_payments_bp.route('/pay-registration', methods=['POST'])\ndef pay_registration():\n    \"\"\"\n    Registration payment endpoint matching PHP STK Push script.\n    POST JSON: {\"User-email\": \"\", \"phone_number\": \"\", \"amount\": \"1\"}\n    \"\"\"\n    response = {'success': False, 'message': '', 'errors': []}\n\n    data = request.get_json()\n    if not data:\n        response['message'] = 'Invalid request data'\n        return jsonify(response), 400\n\n    phone_number = data.get('phone_number') or ''\n    phone_number = phone_number.strip() if phone_number else ''\n    money_paid = data.get('amount', '1')\n    userEmail = data.get('User-email') or ''\n    userEmail = userEmail.strip() if userEmail else ''\n\n    if not phone_number:\n        response['errors'].append('Phone number is required.')\n    if not userEmail:\n        response['errors'].append('Email is required.')\n    if response['errors']:\n        return jsonify(response), 400\n\n    phone = normalize_phone_number(phone_number)\n    if not phone:\n        response['errors'].append('Invalid phone number')\n        return jsonify(response), 400\n\n    stk_result = initiate_stk_push(\n        phone_number=phone,\n        amount=money_paid,\n        account_reference=MPESA_ACCOUNT_REFERENCE,\n        transaction_desc='Membership Registration fee payment'\n    )\n\n    if stk_result.get('success'):\n        CheckoutRequestID = stk_result.get('CheckoutRequestID')\n        ResponseCode = stk_result.get('ResponseCode', '')\n        if CheckoutRequestID:\n            if save_registration_transaction(CheckoutRequestID, userEmail, phone, money_paid, 'Pending'):\n                response['success'] = True\n                response['message'] = \"Kindly enter your Mpesa Pin to complete the payment\"\n            else:\n                response['errors'].append(\"Database error\")\n        else:\n            response['errors'].append(\"Error in transaction processing. Please try again.\")\n    else:\n        response['message'] = stk_result.get('message', 'Payment failed')\n\n    return jsonify(response), 200 if response['success'] else 400\n\n@registration_payments_bp.route('/register-premium', methods=['POST'])\ndef pay_membership_premium():
    """
    Process membership premium payment.
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "phone": "0722000000",
        "amount": "3600" (optional, defaults to 3600)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400
        
        # Extract and validate input
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        amount = data.get('amount')
        
        # Validation
        errors = []
        if not email:
            errors.append("Email is required")
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
        
        # Use provided amount or default to membership premium
        # Remove any commas/thousand separators and convert to integer
        if amount:
            try:
                # Strip any formatting characters (commas, spaces, etc.)
                clean_amount = str(amount).replace(',', '').replace(' ', '').strip()
                payment_amount = int(clean_amount)
            except (ValueError, TypeError):
                payment_amount = MEMBERSHIP_PREMIUM_AMOUNT
        else:
            payment_amount = MEMBERSHIP_PREMIUM_AMOUNT
        
        # Initiate STK Push
        result = initiate_stk_push(
            phone_number=normalized_phone,
            amount=payment_amount,
            account_reference=MPESA_ACCOUNT_REFERENCE,
            transaction_desc="Membership Premium payment"
        )
        
        if result.get("success"):
            # Save transaction to database
            checkout_id = result.get("CheckoutRequestID")
            save_mpesa_transaction(
                checkout_request_id=checkout_id,
                email=email,
                phone=normalized_phone,
                amount=payment_amount,
                payment_type="premium",
                status="Pending"
            )
            
            return jsonify({
                "success": True,
                "message": result.get("message"),
                "CheckoutRequestID": checkout_id
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": result.get("message", "Payment failed")
            }), 400
            
    except Exception as e:
        logger.error(f"Error processing membership premium payment: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again."
        }), 500


@registration_payments_bp.route('/transaction-status/<checkout_request_id>', methods=['GET'])
def get_transaction_status(checkout_request_id):
    """
    Check the status of a transaction.
    
    Args:
        checkout_request_id: The M-Pesa CheckoutRequestID
    
    Returns:
        JSON response with transaction status
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute(
            "SELECT * FROM mpesa_transactions WHERE CheckoutRequestID = %s",
            (checkout_request_id,)
        )
        
        transaction = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if transaction:
            return jsonify({
                "success": True,
                "data": {
                    "CheckoutRequestID": transaction["CheckoutRequestID"],
                    "email": transaction["email"],
                    "phone": transaction["phone"],
                    "amount": float(transaction["amount"]),
                    "status": transaction["status"],
                    "transaction_date": str(transaction["transaction_date"])
                }
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Transaction not found"
            }), 404
            
    except Exception as e:
        logger.error(f"Error fetching transaction status: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching transaction status"
        }), 500

