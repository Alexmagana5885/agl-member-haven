"""Planned Events Registration routes - STK Push for event registration payments."""

import os
import re
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
import requests
import mysql.connector

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) )


from ..accessToken import get_access_token

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

events_bp = Blueprint('events', __name__, url_prefix='/api/payments/events')

# M-Pesa API Configuration
MPESA_BUSINESS_SHORT_CODE = os.environ.get("MY_BUSINESS_SHORT_CODE", "6175135")
MPESA_PASSKEY = os.environ.get("MY_PASS_KEY", "your_passkey_here")
MPESA_CALLBACK_URL = os.environ.get(
    "REGISTRATION_CALLBACK_URL",
    "https://member.log.agl.or.ke/members/forms/Payment/Mpesa-Daraja-Api-main/callbackEventR.php",
)
MPESA_ENVIRONMENT = os.environ.get("MPESA_ENVIRONMENT", "sandbox")

MPESA_PARTY_B = os.environ.get("MPESA_PARTY_B", "8209382")
MPESA_ACCOUNT_REFERENCE = os.environ["MPESA_ACCOUNT_REFERENCE_EVENT"]
if MPESA_ENVIRONMENT == "production":
    MPESA_STK_PUSH_URL = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
else:
    MPESA_STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"


def get_db_connection():
    """Create and return a MySQL database connection."""
    db_host = os.environ.get("DB_HOST")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")
    db_name = os.environ.get("DB_NAME")

    try:
        return mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name,
        )
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise


def normalize_phone_number(phone_number: str):
    """Normalize phone number to M-Pesa format (254XXXXXXXXX)."""
    if not phone_number:
        return None

    phone_number = re.sub(r"\s+", "", phone_number)

    if phone_number.startswith("+"):
        phone_number = phone_number[1:]

    # local 0XXXXXXXXX -> 254XXXXXXXXX
    if phone_number.startswith("0") and len(phone_number) == 10:
        phone_number = "254" + phone_number[1:]

    # already 254...
    if re.match(r"^254[7-9]\d{8}$", phone_number):
        return phone_number

    return phone_number


def generate_password():
    """Generate M-Pesa API password (BusinessShortCode + Passkey + Timestamp)."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    import base64

    password_string = f"{MPESA_BUSINESS_SHORT_CODE}{MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_string.encode("utf-8")).decode("utf-8")
    return password, timestamp


def initiate_stk_push(phone_number: str, amount: int, account_reference: str, transaction_desc: str):
    access_token = get_access_token()
    if not access_token:
        return {
            "success": False,
            "message": "Failed to connect to payment service. Please try again.",
            "error": "Access token unavailable",
        }

    password, timestamp = generate_password()

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
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
        "TransactionDesc": transaction_desc,
    }

    try:
        response = requests.post(MPESA_STK_PUSH_URL, json=payload, headers=headers, timeout=30)
        response_data = response.json()

        if response.status_code == 200 and response_data.get("ResponseCode") == "0":
            return {
                "success": True,
                "message": "Kindly enter your M-Pesa Pin to complete the payment",
                "CheckoutRequestID": response_data.get("CheckoutRequestID"),
                "ResponseCode": response_data.get("ResponseCode"),
            }

        return {
            "success": False,
            "message": response_data.get("ResponseDescription", "Payment request failed"),
            "error": response_data.get("ResponseCode"),
        }

    except requests.exceptions.RequestException as e:
        logger.error(f"STK Push request exception: {str(e)}")
        return {
            "success": False,
            "message": "Unable to connect to payment service. Please check your internet connection.",
            "error": str(e),
        }
    except Exception as e:
        logger.error(f"STK Push error: {str(e)}")
        return {
            "success": False,
            "message": "An unexpected error occurred. Please try again.",
            "error": str(e),
        }


def send_confirmation_email(email: str, member_name: str, event_name: str, event_location: str, event_date: str):
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_host = os.environ.get("SMTP_HOST", "agl.or.ke")
        smtp_port = os.environ.get("SMTP_PORT", "587")
        smtp_user = "aglevents@agl.or.ke"
        smtp_password = os.environ.get('SMTP_PASSWORD')

        if not smtp_password:
            logger.warning("SMTP password not configured, skipping email")
            return False

        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = email
        msg["Subject"] = "Registration Successful!"

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

        msg.attach(MIMEText(message, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, email, msg.as_string())
        server.quit()

        return True

    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False


@events_bp.route('/register', methods=['POST'])
def register_event():
    """Register member for an event (free or STK push)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid request data"}), 400

        # Accept payload keys from PlannedEventsSection.tsx
        event_id = str(data.get("event_id", "")).strip()
        event_name = str(data.get("event_name", "")).strip()
        event_location = str(data.get("event_location", "")).strip()
        event_date = str(data.get("event_date", "")).strip()
        email = str(data.get("User_email", "") or data.get("email", "")).strip()
        member_name = str(data.get("memberName", "") or data.get("member_name", "")).strip()
        phone_number = str(data.get("phone_number", "") or data.get("phone", "")).strip()
        amount_raw = data.get("amount", "0")

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
        if not phone_number:
            errors.append("Phone number is required")

        if errors:
            return jsonify({"success": False, "message": "Validation failed", "errors": errors}), 400

        normalized_phone = normalize_phone_number(phone_number)
        if not normalized_phone:
            return jsonify({"success": False, "message": "Invalid phone number format"}), 400

        try:
            payment_amount = float(str(amount_raw).replace(',', '').replace(' ', '').strip() or '0')
        except (ValueError, TypeError):
            payment_amount = 0

        conn = get_db_connection()
        cursor = conn.cursor()

        # Already registered?
        cursor.execute(
            "SELECT id FROM event_registrations WHERE event_id = %s AND member_email = %s",
            (event_id, email),
        )
        check_result = cursor.fetchone()
        if check_result:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "You have already registered for this event."}), 400

        # Free registration
        if payment_amount == 0:
            insert_sql = (
                "INSERT INTO event_registrations "
                "(event_id, event_name, event_location, event_date, member_email, member_name, contact, "
                "registration_date, payment_code) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), '00')"
            )
            cursor.execute(
                insert_sql,
                (event_id, event_name, event_location, event_date, email, member_name, normalized_phone),
            )
            conn.commit()

            send_confirmation_email(email, member_name, event_name, event_location, event_date)

            cursor.close()
            conn.close()
            return jsonify({"success": True, "message": "Registration successful. No payment required."}), 200

        # Paid registration -> STK push
        result = initiate_stk_push(
            phone_number=normalized_phone,
            amount=int(payment_amount),
            account_reference=MPESA_ACCOUNT_REFERENCE,
            transaction_desc=f"Membership Registration fee payment for event: {event_name}",
        )

        if not result.get("success"):
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": result.get("message", "Payment failed")}), 400

        checkout_id = result.get("CheckoutRequestID")
        if not checkout_id:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Payment service did not return CheckoutRequestID"}), 400

        status = "Pending"
        event_sql = (
            "INSERT INTO eventregcheckout "
            "(CheckoutRequestID, event_id, event_name, event_location, event_date, email, member_name, phone, amount, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        cursor.execute(
            event_sql,
            (checkout_id, event_id, event_name, event_location, event_date, email, member_name, normalized_phone, payment_amount, status),
        )
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": result.get("message"), "CheckoutRequestID": checkout_id}), 200

    except Exception as e:
        logger.error(f"Error processing event registration: {str(e)}")
        return jsonify({"success": False, "message": "An unexpected error occurred. Please try again."}), 500


@events_bp.route('/check-registration/<event_id>/<email>', methods=['GET'])
def check_registration(event_id, email):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, member_name, registration_date FROM event_registrations WHERE event_id = %s AND member_email = %s",
            (event_id, email),
        )
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            return jsonify({"success": True, "registered": True, "data": {"id": result[0], "member_name": result[1], "registration_date": str(result[2])}}), 200

        return jsonify({"success": True, "registered": False}), 200

    except Exception as e:
        logger.error(f"Error checking registration: {str(e)}")
        return jsonify({"success": False, "message": "Error checking registration status"}), 500


@events_bp.route('/my-events/<email>', methods=['GET'])
def get_my_events(email):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT er.id, er.event_id, er.event_name, er.event_location, er.event_date, 
                   er.registration_date, er.payment_code
            FROM event_registrations er
            WHERE er.member_email = %s
            ORDER BY er.event_date DESC
            """,
            (email,),
        )
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        for row in results:
            if row.get('event_date'):
                row['event_date'] = str(row['event_date'])
            if row.get('registration_date'):
                row['registration_date'] = str(row['registration_date'])

        return jsonify({"success": True, "events": results}), 200

    except Exception as e:
        logger.error(f"Error fetching user events: {str(e)}")
        return jsonify({"success": False, "message": "Error fetching events"}), 500

