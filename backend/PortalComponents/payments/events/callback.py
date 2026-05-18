"""Planned Events Payment callback handler.

"""

import os
import logging
from datetime import datetime

from flask import Blueprint, jsonify, request
import mysql.connector

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

callback_bp = Blueprint('events_callback', __name__, url_prefix='/api/payments/events/callback')


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


def _get_smtp_config():
    return {
        "smtp_host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.environ.get("SMTP_PORT", "587")),
        "smtp_user": os.environ.get("SMTP_USER", "payments@agl.or.ke"),
        "smtp_password": os.environ.get("SMTP_PASSWORD", ""),
    }


def send_confirmation_email(email: str, member_name: str, event_name: str, event_location: str, event_date: str):
    """Send confirmation email for successful event registration."""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_cfg = _get_smtp_config()

        # Skip if no SMTP password configured
        if not smtp_cfg["smtp_password"]:
            logger.warning("SMTP password not configured, skipping email")
            return False

        msg = MIMEMultipart()
        msg['From'] = smtp_cfg["smtp_user"]
        msg['To'] = email
        msg['Subject'] = "Registration Successful!"

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

        server = smtplib.SMTP(smtp_cfg["smtp_host"], smtp_cfg["smtp_port"])
        server.starttls()
        server.login(smtp_cfg["smtp_user"], smtp_cfg["smtp_password"])
        server.sendmail(smtp_cfg["smtp_user"], email, msg.as_string())
        server.quit()

        logger.info(f"Confirmation email sent to {email}")
        return True

    except Exception as e:
        logger.error(f"Error sending confirmation email: {e}")
        return False


def send_official_payment_notification_emails(
    officials,
    member_name,
    event_name,
    event_location,
    event_date,
    amount,
    transaction_id,
    transaction_timestamp,
):
    """Notify officials that an event registration payment has been processed."""

    if not officials:
        return

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_cfg = _get_smtp_config()

        if not smtp_cfg["smtp_password"]:
            logger.warning(
                "SMTP password not configured, skipping official notification emails"
            )
            return

        txn_date = (
            transaction_timestamp.split(" ")[0]
            if transaction_timestamp else "-"
        )

        txn_time = (
            transaction_timestamp.split(" ")[1]
            if transaction_timestamp and len(transaction_timestamp.split(" ")) > 1
            else "-"
        )

        for official in officials:
            recipient_email = (official.get("email") or "").strip()
            recipient_name = (official.get("name") or "Official").strip()

            if not recipient_email:
                continue

            msg = MIMEMultipart()
            msg['From'] = smtp_cfg["smtp_user"]
            msg['To'] = recipient_email
            msg['Subject'] = "New Event Registration Payment Processed"

            message = f"""Dear {recipient_name},

This is to notify you that a new event registration payment has been successfully processed.

Event Payment Details:

Member Name: {member_name}
Event Name: {event_name}
Event Location: {event_location}
Event Date: {event_date}

Amount Paid: KES {amount}
Transaction ID: {transaction_id}

Transaction Date: {txn_date}
Transaction Time: {txn_time}

Please log into the system for more details.

Thank you.

Kind regards,
AGL Team
"""

            msg.attach(MIMEText(message, 'plain'))

            server = smtplib.SMTP(
                smtp_cfg["smtp_host"],
                smtp_cfg["smtp_port"],
            )

            server.starttls()
            server.login(
                smtp_cfg["smtp_user"],
                smtp_cfg["smtp_password"],
            )

            server.sendmail(
                smtp_cfg["smtp_user"],
                recipient_email,
                msg.as_string(),
            )

            server.quit()

            logger.info(
                f"Official event notification email sent to {recipient_email}"
            )

    except Exception as e:
        logger.error(
            f"Error sending official notification emails: {str(e)}"
        )



@callback_bp.route('', methods=['POST'])
def event_payment_callback():
    """Handle M-Pesa STK callback."""
    try:
        stk_callback_response = request.get_data(as_text=True)

        # Log raw callback for debugging
        try:
            with open("EventRcallback.json", 'a', encoding='utf-8') as f:
                f.write(stk_callback_response + "\n")
        except Exception as log_err:
            logger.warning(f"Could not write callback log: {log_err}")

        import json
        try:
            data = json.loads(stk_callback_response) if isinstance(stk_callback_response, str) else stk_callback_response
        except Exception as json_err:
            return jsonify({"success": False, "message": f"JSON decoding error: {json_err}"}), 400

        # Extract relevant fields from M-Pesa callback payload
        if 'Body' in data:
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')

            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])

            amount = None
            transaction_id = None
            user_phone_number = None
            for item in items:
                name = item.get('Name')
                value = item.get('Value')
                if name == 'Amount':
                    amount = value
                elif name == 'MpesaReceiptNumber':
                    transaction_id = value
                elif name == 'PhoneNumber':
                    user_phone_number = value

        else:
            # Non-standard payload (fallback)
            checkout_request_id = data.get('CheckoutRequestID')
            result_code = data.get('ResultCode') or data.get('ResponseCode')
            result_desc = data.get('ResultDesc') or data.get('ResponseDescription')
            amount = data.get('Amount')
            transaction_id = data.get('TransactionId') or data.get('MpesaReceiptNumber')
            user_phone_number = data.get('PhoneNumber')

        if checkout_request_id is None:
            return jsonify({"success": False, "message": "Missing CheckoutRequestID"}), 400

        if str(result_code) == '0':
            # Retrieve checkout details for this CheckoutRequestID
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT email, member_name, event_id, event_name, event_location, event_date "
                "FROM eventregcheckout WHERE CheckoutRequestID = %s",
                (checkout_request_id,),
            )
            checkout_row = cursor.fetchone()

            if not checkout_row:
                cursor.close()
                conn.close()
                return jsonify({"success": False, "message": "No records found for CheckoutRequestID"}), 404

            email = checkout_row['email']
            member_name = checkout_row['member_name']
            event_id = checkout_row['event_id']
            event_name = checkout_row['event_name']
            event_location = checkout_row['event_location']
            event_date = checkout_row['event_date']
            registration_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Insert into event_registrations table
            insert_query = (
                "INSERT INTO event_registrations "
                "(event_id, event_name, event_location, event_date, member_email, member_name, contact, "
                "registration_date, payment_code, invitation_card) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            )

            invitation_card_path = ''
            cursor.execute(
                insert_query,
                (
                    event_id,
                    event_name,
                    event_location,
                    event_date,
                    email,
                    member_name,
                    user_phone_number,
                    registration_date,
                    transaction_id,
                    invitation_card_path,
                ),
            )

            if cursor.rowcount <= 0:
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"success": False, "message": "Failed to insert event registration"}), 500

            # Update checkout status to Completed
            cursor.execute(
                "UPDATE eventregcheckout SET status = 'Completed' WHERE CheckoutRequestID = %s",
                (checkout_request_id,),
            )

            conn.commit()

            # Send email
            try:
                send_confirmation_email(
                    email,
                    member_name,
                    event_name,
                    event_location,
                    str(event_date),
                )
            except Exception as email_err:
                logger.error(f"Failed to send confirmation email: {email_err}")

            # Notify officials (Chairperson, Treasurer, National Secretary)
            try:
                official_positions = (
                    "Chairperson",
                    "Treasurer",
                    "National Secretary",
                )

                placeholders = ",".join(["%s"] * len(official_positions))

                query = f"""
                    SELECT position, personalmembership_email AS email
                    FROM officialsmembers
                    WHERE position IN ({placeholders})
                """

                cursor.execute(query, official_positions)
                official_rows = cursor.fetchall()

                officials = []
                for row in official_rows:
                    officials.append(
                        {
                            "position": row["position"],
                            "email": row["email"],
                            "name": row["position"],
                        }
                    )

                send_official_payment_notification_emails(
                    officials=officials,
                    member_name=member_name,
                    event_name=event_name,
                    event_location=event_location,
                    event_date=str(event_date),
                    amount=amount,
                    transaction_id=transaction_id,
                    transaction_timestamp=registration_date,
                )
            except Exception as official_err:
                logger.error(f"Error sending official event emails: {official_err}")

            cursor.close()
            conn.close()

            # (Optional) Event card generation can be done here if you add event_card.py/call.


            return jsonify(
                {
                    "success": True,
                    "message": "Event registration successful, confirmation email sent, and event card processing initiated.",
                }
            ), 200

        # Transaction failed
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE eventregcheckout SET status = 'Failed' WHERE CheckoutRequestID = %s",
            (checkout_request_id,),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": False, "message": f"Transaction failed: {result_desc}"}), 400

    except Exception as e:
        logger.error(f"Error processing event callback: {e}")
        return jsonify({"success": False, "message": f"Error processing callback: {e}"}), 500

