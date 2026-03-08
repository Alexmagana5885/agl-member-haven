"""Planned Events Payment callback handler - processes M-Pesa STK Push callback for event registration payments."""
import os
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
callback_bp = Blueprint('events_callback', __name__, url_prefix='/api/payments/events/callback')


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


@callback_bp.route('', methods=['POST'])
def event_payment_callback():
    """
    Handle M-Pesa callback for event registration payments.
    
    This endpoint receives the STK Push callback from M-Pesa and processes it.
    """
    try:
        # Get the callback data from M-Pesa
        stk_callback_response = request.get_data(as_text=True)
        
        # Log the callback for debugging
        logger.info(f"Event callback received: {stk_callback_response}")
        
        # Save to log file
        try:
            log_file = "EventRcallback.json"
            with open(log_file, 'a') as f:
                f.write(stk_callback_response + '\n')
        except Exception as log_err:
            logger.warning(f"Could not write to log file: {log_err}")
        
        # Parse JSON data
        try:
            data = stk_callback_response
            if isinstance(data, str):
                import json
                data = json.loads(data)
        except Exception as json_err:
            logger.error(f"JSON parsing error: {json_err}")
            return jsonify({
                "success": False,
                "message": "Invalid JSON data"
            }), 400
        
        # Extract callback data
        # Handle different M-Pesa response formats
        if 'Body' in data:
            # Standard M-Pesa callback format
            body = data.get('Body', {})
            stk_callback = body.get('stkCallback', {})
            
            merchant_request_id = stk_callback.get('MerchantRequestID')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            
            # Get callback metadata
            callback_metadata = stk_callback.get('CallbackMetadata', {})
            items = callback_metadata.get('Item', [])
            
            # Extract values from metadata items
            amount = None
            transaction_id = None
            phone_number = None
            
            for item in items:
                if item.get('Name') == 'Amount':
                    amount = item.get('Value')
                elif item.get('Name') == 'MpesaReceiptNumber':
                    transaction_id = item.get('Value')
                elif item.get('Name') == 'PhoneNumber':
                    phone_number = item.get('Value')
        else:
            # Alternative format
            merchant_request_id = data.get('MerchantRequestID')
            checkout_request_id = data.get('CheckoutRequestID')
            result_code = data.get('ResponseCode')
            result_desc = data.get('ResponseDescription') or data.get('ResultDesc')
            amount = data.get('Amount')
            transaction_id = data.get('TransactionId') or data.get('MpesaReceiptNumber')
            phone_number = data.get('PhoneNumber')
        
        logger.info(f"Processing callback: CheckoutRequestID={checkout_request_id}, ResultCode={result_code}")
        
        # Check if transaction was successful
        if result_code == 0:
            # Transaction was successful
            if not checkout_request_id:
                logger.error("No CheckoutRequestID in callback")
                return jsonify({"success": False, "message": "Missing CheckoutRequestID"}), 400
            
            # Get the event registration details associated with this CheckoutRequestID
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute(
                """SELECT email, member_name, event_id, event_name, event_location, event_date 
                   FROM eventregcheckout WHERE CheckoutRequestID = %s""",
                (checkout_request_id,)
            )
            checkout_result = cursor.fetchone()
            
            if not checkout_result:
                logger.error(f"No checkout record found for CheckoutRequestID: {checkout_request_id}")
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "No checkout record found"
                }), 404
            
            # Extract necessary information
            email = checkout_result['email']
            member_name = checkout_result['member_name']
            event_id = checkout_result['event_id']
            event_name = checkout_result['event_name']
            event_location = checkout_result['event_location']
            event_date = checkout_result['event_date']
            registration_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Check if already registered (in case of duplicate callback)
            check_sql = "SELECT id FROM event_registrations WHERE event_id = %s AND member_email = %s"
            cursor.execute(check_sql, (event_id, email))
            existing = cursor.fetchone()
            
            if existing:
                logger.info(f"User already registered for event {event_id}")
                # Update the checkout status
                update_sql = "UPDATE eventregcheckout SET status = 'Completed' WHERE CheckoutRequestID = %s"
                cursor.execute(update_sql, (checkout_request_id,))
                conn.commit()
                
                cursor.close()
                conn.close()
                return jsonify({
                    "success": True,
                    "message": "User already registered for this event"
                }), 200
            
            # Insert into event_registrations table
            insert_query = """INSERT INTO event_registrations 
                (event_id, event_name, event_location, event_date, member_email, member_name, contact, registration_date, payment_code, invitation_card)  
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            invitation_card_path = ''  # Initialize invitation card path
            
            cursor.execute(insert_query, (
                event_id, event_name, event_location, event_date, 
                email, member_name, phone_number, registration_date, 
                transaction_id, invitation_card_path
            ))
            
            if cursor.rowcount > 0:
                # Update the checkout status to Completed
                update_sql = "UPDATE eventregcheckout SET status = 'Completed' WHERE CheckoutRequestID = %s"
                cursor.execute(update_sql, (checkout_request_id,))
                conn.commit()
                
                # Send confirmation email
                try:
                    # Convert event_date to string if it's a date object
                    event_date_str = event_date.strftime('%Y-%m-%d') if isinstance(event_date, datetime) else str(event_date)
                    send_confirmation_email(email, member_name, event_name, event_location, event_date_str)
                except Exception as email_err:
                    logger.error(f"Error sending confirmation email: {email_err}")
                
                # Optionally trigger event card generation
                # This can be done by making a request to event_card.php
                try:
                    # You can add event card generation logic here if needed
                    pass
                except Exception as card_err:
                    logger.error(f"Error generating event card: {card_err}")
                
                logger.info(f"Event registration successful for {email}, Event: {event_name}")
                
                cursor.close()
                conn.close()
                
                return jsonify({
                    "success": True,
                    "message": "Event registration successful, confirmation email sent."
                }), 200
            else:
                logger.error("Failed to insert event registration")
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "Failed to insert event registration"
                }), 500
        else:
            # Transaction failed
            logger.info(f"Transaction failed: {result_desc}")
            
            # Update transaction status if we have the checkout ID
            if checkout_request_id:
                try:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    update_sql = "UPDATE eventregcheckout SET status = 'Failed' WHERE CheckoutRequestID = %s"
                    cursor.execute(update_sql, (checkout_request_id,))
                    conn.commit()
                    cursor.close()
                    conn.close()
                except Exception as update_err:
                    logger.error(f"Error updating transaction status: {update_err}")
            
            return jsonify({
                "success": False,
                "message": f"Transaction failed: {result_desc}"
            }), 400
            
    except Exception as e:
        logger.error(f"Error processing event callback: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error processing callback: {str(e)}"
        }), 500

