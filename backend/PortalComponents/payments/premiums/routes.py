"""Member Premium Payments routes - STK Push for membership premium payments."""
import os

import re
import logging
import base64
from datetime import datetime
from flask import Blueprint, jsonify, request
import requests
import mysql.connector

from ..accessToken import get_access_token

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
premiums_bp = Blueprint('premiums', __name__, url_prefix='/api/payments/premium')

# M-Pesa API Configuration - Using environment variables with fallbacks
MPESA_BUSINESS_SHORT_CODE = os.environ.get("MY_BUSINESS_SHORT_CODE", "6175135")
MPESA_PASSKEY = os.environ.get("MY_PASS_KEY", "your_passkey_here")
MPESA_CALLBACK_URL = os.environ.get(
    "PREMIUMS_CALLBACK_URL",
    "https://member.log.agl.or.ke/members/forms/Payment/Premiumcallback.php"
)
MPESA_ENVIRONMENT = os.environ.get("ENVIRONMENT", "sandbox")

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

# Premium payment amounts

PERSONAL_PREMIUM_AMOUNT = 3600
ORGANIZATION_PREMIUM_AMOUNT = 15000


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
    Handles:
    - +254XXXXXXXXX
    - 254XXXXXXXXX
    - 07XXXXXXXX
    - 7XXXXXXXX
    """

    if not phone_number:
        return None

    # Remove spaces
    phone_number = re.sub(r'\s+', '', phone_number)

    # Remove +
    if phone_number.startswith('+'):
        phone_number = phone_number[1:]

    # Convert 07XXXXXXXX -> 2547XXXXXXXX
    if phone_number.startswith('0') and len(phone_number) == 10:
        phone_number = '254' + phone_number[1:]

    # Convert 7XXXXXXXX -> 2547XXXXXXXX
    if re.match(r'^[789]\d{8}$', phone_number):
        phone_number = '254' + phone_number

    return phone_number


def generate_password():
    """Generate M-Pesa password."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password_string = (
        f"{MPESA_BUSINESS_SHORT_CODE}"
        f"{MPESA_PASSKEY}"
        f"{timestamp}"
    )

    password = base64.b64encode(
        password_string.encode('utf-8')
    ).decode('utf-8')

    return password, timestamp


def get_base_payment_amount(email):
    """
    Get premium amount based on membership type.
    """

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Personal membership
        cursor.execute(
            "SELECT email FROM personalmembership WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            cursor.close()
            conn.close()

            return PERSONAL_PREMIUM_AMOUNT

        # Organization membership
        cursor.execute(
            """
            SELECT organization_email
            FROM organizationmembership
            WHERE organization_email = %s
            """,
            (email,)
        )

        if cursor.fetchone():
            cursor.close()
            conn.close()

            return ORGANIZATION_PREMIUM_AMOUNT

        cursor.close()
        conn.close()

        return PERSONAL_PREMIUM_AMOUNT

    except Exception as e:
        logger.error(f"Error getting base payment amount: {str(e)}")
        return PERSONAL_PREMIUM_AMOUNT


def get_outstanding_amount(email):
    """
    Calculate outstanding premium balance.
    """

    try:
        base_payment = get_base_payment_amount(email)

        conn = get_db_connection()
        cursor = conn.cursor()

        one_year_ago = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            SELECT SUM(amount) AS total_paid
            FROM member_premium_payments
            WHERE member_email = %s
            AND timestamp > %s
        """, (email, one_year_ago))

        result = cursor.fetchone()

        total_paid = float(result[0]) if result and result[0] else 0

        cursor.close()
        conn.close()

        outstanding = base_payment - total_paid

        return max(0, int(outstanding))

    except Exception as e:
        logger.error(f"Error calculating outstanding amount: {str(e)}")
        return get_base_payment_amount(email)


def save_mpesa_transaction(
    checkout_request_id,
    email,
    phone,
    amount,
    payment_type,
    status="Pending"
):
    """Save M-Pesa transaction to database.
    """

    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO mpesa_transactions
            (
                CheckoutRequestID,
                email,
                phone,
                amount,
                status,
                transaction_date
            )
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (
            checkout_request_id,
            email,
            phone,
            amount,
            status,
        ))

        conn.commit()

        logger.info(f"Transaction saved successfully (mpesa_transactions): {checkout_request_id}")
        return True

    except Exception as e:
        logger.error(f"DB save error: {str(e)}")

        if conn:
            conn.rollback()

        return False

    finally:
        try:
            if cursor:
                cursor.close()

            if conn:
                conn.close()

        except Exception as close_error:
            logger.error(f"DB close error: {str(close_error)}")



def initiate_stk_push(
    phone_number,
    amount,
    account_reference,
    transaction_desc
):
    """
    Initiate STK Push request.
    """

    access_token = get_access_token()

    if not access_token:
        logger.error("Failed to get M-Pesa access token")

        return {
            "success": False,
            "message": "Failed to connect to payment service.",
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

    logger.info(
        f"Initiating STK Push:"
        f" Phone={phone_number},"
        f" Amount={amount}"
    )

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

                return {
                    "success": True,
                    "message": (
                        "Kindly enter your M-Pesa Pin "
                        "to complete payment"
                    ),
                    "CheckoutRequestID": response_data.get(
                        "CheckoutRequestID"
                    ),
                    "ResponseCode": response_data.get("ResponseCode")
                }

            return {
                "success": False,
                "message": response_data.get(
                    "ResponseDescription",
                    "Payment request failed"
                ),
                "error": response_data.get("ResponseCode")
            }

        return {
            "success": False,
            "message": "Payment service error.",
            "error": f"HTTP {response.status_code}"
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"STK Push request exception: {str(e)}")

        return {
            "success": False,
            "message": "Unable to connect to payment service.",
            "error": str(e)
        }

    except Exception as e:
        logger.error(f"STK Push error: {str(e)}")

        return {
            "success": False,
            "message": "Unexpected error occurred.",
            "error": str(e)
        }


@premiums_bp.route('/pay', methods=['POST'])
def pay_premium():
    """
    Process membership premium payment.
    """

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid request data"
            }), 400

        # Extract data
        email = data.get('User_email', '').strip()
        phone = data.get('phone_number', '').strip()
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

        # Normalize phone
        normalized_phone = normalize_phone_number(phone)

        if not normalized_phone:
            return jsonify({
                "success": False,
                "message": "Invalid phone number format"
            }), 400

        # Payment amount
        payment_amount = amount

        if payment_amount is None:
            payment_amount = get_outstanding_amount(email)

        try:
            payment_amount = int(payment_amount)

        except:
            return jsonify({
                "success": False,
                "message": "Amount must be numeric"
            }), 400

        # Minimum amount
        if payment_amount < 1:
            payment_amount = 3600

        # STK Push
        result = initiate_stk_push(
            phone_number=normalized_phone,
            amount=payment_amount,
            account_reference=MPESA_ACCOUNT_REFERENCE,
            transaction_desc="Membership Premium payment"
        )

        if result.get("success"):

            checkout_id = result.get("CheckoutRequestID")

            # Save transaction
            save_success = save_mpesa_transaction(
                checkout_id,
                email,
                normalized_phone,
                payment_amount,
                "premium"
            )

            if not save_success:
                logger.warning(
                    f"Failed to save transaction: {checkout_id}"
                )

            return jsonify({
                "success": True,
                "message": result.get("message"),
                "CheckoutRequestID": checkout_id,
                "amount": payment_amount
            }), 200

        return jsonify({
            "success": False,
            "message": result.get(
                "message",
                "Payment failed"
            )
        }), 400

    except Exception as e:
        logger.error(f"Error processing premium payment: {str(e)}")

        return jsonify({
            "success": False,
            "message": (
                "An unexpected error occurred. "
                "Please try again."
            )
        }), 500


@premiums_bp.route('/outstanding', methods=['GET'])
def get_outstanding():
    """
    Get outstanding premium amount.
    """

    try:
        email = request.args.get('email', '').strip()

        if not email:
            return jsonify({
                "success": False,
                "message": "Email is required"
            }), 400

        outstanding = get_outstanding_amount(email)
        base_amount = get_base_payment_amount(email)

        return jsonify({
            "success": True,
            "data": {
                "email": email,
                "base_amount": base_amount,
                "outstanding": outstanding,
                "membership_type": (
                    "personal"
                    if base_amount == PERSONAL_PREMIUM_AMOUNT
                    else "organization"
                )
            }
        }), 200

    except Exception as e:
        logger.error(
            f"Error getting outstanding amount: {str(e)}"
        )

        return jsonify({
            "success": False,
            "message": "Error fetching outstanding amount"
        }), 500


@premiums_bp.route(
    '/transaction-status/<checkout_request_id>',
    methods=['GET']
)
def get_transaction_status(checkout_request_id):
    """
    Check transaction status.
    """

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM mpesa_transactions
            WHERE CheckoutRequestID = %s
        """, (checkout_request_id,))

        transaction = cursor.fetchone()

        cursor.close()
        conn.close()

        if transaction:

            return jsonify({
                "success": True,
                "data": {
                    "CheckoutRequestID":
                        transaction["CheckoutRequestID"],

                    "email":
                        transaction["email"],

                    "phone":
                        transaction["phone"],

                    "amount":
                        float(transaction["amount"]),

                    "status":
                        transaction["status"],

                    "transaction_date":
                        str(transaction["transaction_date"])
                }
            }), 200

        return jsonify({
            "success": False,
            "message": "Transaction not found"
        }), 404

    except Exception as e:
        logger.error(
            f"Error fetching transaction status: {str(e)}"
        )

        return jsonify({
            "success": False,
            "message": "Error fetching transaction status"
        }), 500


