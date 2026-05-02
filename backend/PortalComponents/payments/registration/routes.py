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
registration_payments_bp = Blueprint(
    'registration_payments',
    __name__,
    url_prefix='/api/payments'
)

# M-Pesa API Configuration
MPESA_BUSINESS_SHORT_CODE = os.environ.get("MY_BUSINESS_SHORT_CODE", "8209382")
MPESA_PASSKEY = os.environ.get("MY_PASS_KEY", "your_passkey_here")
MPESA_CALLBACK_URL = os.environ.get(
    "MPESA_CALLBACK_URL",
    "https://member.log.agl.or.ke/members/forms/Payment/callback.php"
)
MPESA_ENVIRONMENT = os.environ.get("ENVIRONMENT", "sandbox")

MPESA_PARTY_B = os.environ.get("MPESA_PARTY_B", "8209382")
MPESA_ACCOUNT_REFERENCE = os.environ.get("MPESA_ACCOUNT_REFERENCE", "6175135")

# STK URLs
if MPESA_ENVIRONMENT == "production":
    MPESA_STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    MPESA_STK_QUERY_URL = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
else:
    MPESA_STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    MPESA_STK_QUERY_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"

MEMBERSHIP_FEE_AMOUNT = 2000
MEMBERSHIP_PREMIUM_AMOUNT = 3600


# ---------------- DB CONNECTION ----------------
def get_db_connection():
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")

    try:
        return mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name
        )
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise


# ---------------- PHONE NORMALIZATION ----------------
def normalize_phone_number(phone_number):
    if not phone_number:
        return None

    phone_number = re.sub(r'\s+', '', phone_number)

    if phone_number.startswith('+'):
        phone_number = phone_number[1:]

    if phone_number.startswith('0') and len(phone_number) == 10:
        phone_number = '254' + phone_number[1:]

    if re.match(r'^[789]\d{8}$', phone_number):
        phone_number = '254' + phone_number

    return phone_number


# ---------------- MPESA PASSWORD ----------------
def generate_password():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password_string = f"{MPESA_BUSINESS_SHORT_CODE}{MPESA_PASSKEY}{timestamp}"

    import base64
    password = base64.b64encode(password_string.encode()).decode()

    return password, timestamp


# ---------------- STK PUSH ----------------
def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
    access_token = get_access_token()
    if not access_token:
        logger.error("Failed to get M-Pesa access token")
        return {
            "success": False,
            "message": "Failed to connect to payment service. Please try again.",
            "error": "Access token unavailable"
        }

    password, timestamp = generate_password()

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
            "message": data.get("ResponseDescription", "Payment failed")
        }

    except Exception as e:
        logger.error(f"STK Push error: {str(e)}")
        return {
            "success": False,
            "message": "Payment request failed",
            "error": str(e)
        }


# ---------------- SAVE TRANSACTION ----------------
def save_mpesa_transaction(checkout_request_id, email, phone, amount, payment_type, status="Pending"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        table = (
            "member_registration_payments"
            if payment_type == "fee"
            else "member_premium_payments"
        )

        cursor.execute("""
            INSERT INTO mpesa_transactions 
            (CheckoutRequestID, email, phone, amount, status, transaction_date)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (checkout_request_id, email, phone, amount, status))

        cursor.execute(f"""
            INSERT INTO {table}
            (member_email, phone_number, payment_code, amount, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
        """, (email, phone, checkout_request_id, amount))

        cursor.execute("""
            INSERT INTO invoices
            (payment_description, amount_billed, amount_paid, user_email, invoice_date)
            VALUES (%s, %s, %s, %s, NOW())
        """, (
            "Membership Registration Payment" if payment_type == "fee"
            else "Membership Premium Payment",
            amount,
            0,
            email
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True

    except Exception as e:
        logger.error(f"DB save error: {str(e)}")
        return False


# ---------------- REGISTRATION SAVE ONLY ----------------
def save_registration_transaction(checkout_request_id, userEmail, phone, money, status="Pending"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO mpesa_transactions 
        (CheckoutRequestID, email, phone, amount, status)
        VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(sql, (checkout_request_id, userEmail, phone, money, status))

        conn.commit()
        cursor.close()
        conn.close()

        logger.info(f"Registration transaction saved: {checkout_request_id}")
        return True

    except Exception as e:
        logger.error(f"Error saving registration transaction: {str(e)}")
        return False


# ---------------- ROUTES ----------------
@registration_payments_bp.route('/register-fee', methods=['POST'])
def pay_membership_fee():
    data = request.get_json()

    email = data.get('email', '').strip()
    phone = normalize_phone_number(data.get('phone', ''))

    amount = data.get('amount', MEMBERSHIP_FEE_AMOUNT)

    result = initiate_stk_push(
        phone,
        amount,
        MPESA_ACCOUNT_REFERENCE,
        "Membership Fee Payment"
    )

    if result["success"]:
        save_mpesa_transaction(
            result["CheckoutRequestID"],
            email,
            phone,
            amount,
            "fee"
        )
        return jsonify(result), 200

    return jsonify(result), 400


@registration_payments_bp.route('/pay-registration', methods=['POST'])
def pay_registration():
    data = request.get_json()

    phone = normalize_phone_number(data.get('phone_number', ''))
    email = data.get('User-email', '').strip()
    amount = data.get('amount', 1)

    stk = initiate_stk_push(
        phone,
        amount,
        MPESA_ACCOUNT_REFERENCE,
        "Registration Fee Payment"
    )

    if stk["success"]:
        save_registration_transaction(
            stk["CheckoutRequestID"],
            email,
            phone,
            amount
        )
        return jsonify({
            "success": True,
            "message": "Enter M-Pesa PIN to complete payment"
        }), 200

    return jsonify({
        "success": False,
        "message": stk.get("message")
    }), 400


@registration_payments_bp.route('/register-premium', methods=['POST'])
def pay_membership_premium():
    data = request.get_json()

    email = data.get('email', '').strip()
    phone = normalize_phone_number(data.get('phone', ''))
    amount = data.get('amount', MEMBERSHIP_PREMIUM_AMOUNT)

    result = initiate_stk_push(
        phone,
        amount,
        MPESA_ACCOUNT_REFERENCE,
        "Premium Payment"
    )

    if result["success"]:
        save_mpesa_transaction(
            result["CheckoutRequestID"],
            email,
            phone,
            amount,
            "premium"
        )
        return jsonify(result), 200

    return jsonify(result), 400


@registration_payments_bp.route('/transaction-status/<checkout_request_id>', methods=['GET'])
def get_transaction_status(checkout_request_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM mpesa_transactions WHERE CheckoutRequestID = %s",
            (checkout_request_id,)
        )

        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            return jsonify({"success": True, "data": result}), 200

        return jsonify({"success": False, "message": "Not found"}), 404

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500