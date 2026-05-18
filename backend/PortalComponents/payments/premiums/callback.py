"""Member Premium Payments callback handler - processes M-Pesa STK Push callback for premium payments."""
import os
import logging
from datetime import datetime
from flask import Blueprint, jsonify, request
import mysql.connector

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint
callback_bp = Blueprint('premium_callback', __name__, url_prefix='/api/payments/premium/callback')


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


def get_base_payment_amount(email):
    """
    Get the base payment amount based on membership type.
    
    Args:
        email: Member's email address
    
    Returns:
        int: Base payment amount (3600 for personal, 15000 for organization)
    """
    PERSONAL_PREMIUM_AMOUNT = 3600
    ORGANIZATION_PREMIUM_AMOUNT = 15000
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check personal membership
        cursor.execute("SELECT email FROM personalmembership WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return PERSONAL_PREMIUM_AMOUNT
        
        # Check organization membership
        cursor.execute("SELECT organization_email FROM organizationmembership WHERE organization_email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return ORGANIZATION_PREMIUM_AMOUNT
        
        cursor.close()
        conn.close()
        
        # Default to personal membership amount if not found
        return PERSONAL_PREMIUM_AMOUNT
        
    except Exception as e:
        logger.error(f"Error getting base payment amount: {str(e)}")
        return PERSONAL_PREMIUM_AMOUNT


def calculate_amount_billed(email):
    """
    Calculate the amount billed based on base payment and previous payments in the last 1 year.
    
    Args:
        email: Member's email address
    
    Returns:
        int: Amount that was billed (outstanding at time of payment)
    """
    try:
        base_payment = get_base_payment_amount(email)
        
        # Calculate total payments made in the last 1 year
        conn = get_db_connection()
        cursor = conn.cursor()
        
        one_year_ago = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        cursor.execute("""
            SELECT SUM(amount) AS total_paid 
            FROM member_premium_payments 
            WHERE member_email = %s AND timestamp > %s
        """, (email, one_year_ago))
        
        result = cursor.fetchone()
        total_paid = float(result[0]) if result and result[0] else 0
        
        cursor.close()
        conn.close()
        
        # Calculate amount billed based on base_payment
        amount_billed = base_payment - total_paid
        
        # Ensure non-negative
        return max(0, int(amount_billed))
        
    except Exception as e:
        logger.error(f"Error calculating amount billed: {str(e)}")
        return get_base_payment_amount(email)


@callback_bp.route('', methods=['POST'])
def premium_payment_callback():
    """
    Handle M-Pesa callback for premium payments.
    
    This endpoint receives the STK Push callback from M-Pesa and processes it.
    """
    try:
        # Get the callback data from M-Pesa
        stk_callback_response = request.get_data(as_text=True)
        
        # Log the callback for debugging
        logger.info(f"Premium callback received: {stk_callback_response}")
        
        # Save to log file
        try:
            log_file = "PremiumMpesastkresponse.json"
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
            result_code = data.get('ResultCode')
            result_desc = data.get('ResultDesc')
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
            
            # Get the email associated with this CheckoutRequestID
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute(
                "SELECT email FROM mpesa_transactions WHERE CheckoutRequestID = %s",
                (checkout_request_id,)
            )
            result = cursor.fetchone()
            
            if result and result.get('email'):
                email = result['email']
                
                # Calculate amount billed
                amount_billed = calculate_amount_billed(email)
                
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Insert into member_payments table
                insert_payment_sql = """
                    INSERT INTO member_payments (member_email, phone_number, payment_code, amount, timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_payment_sql, (email, phone_number, transaction_id, amount, timestamp))
                
                # Insert into member_premium_payments table
                insert_premium_sql = """
                    INSERT INTO member_premium_payments (member_email, phone_number, payment_code, amount, timestamp)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(insert_premium_sql, (email, phone_number, transaction_id, amount, timestamp))
                
                if cursor.rowcount > 0:
                    # Insert into invoices table
                    payment_description = "Membership Premium Payment"
                    insert_invoice_sql = """
                        INSERT INTO invoices (payment_description, amount_billed, amount_paid, user_email, invoice_date)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(insert_invoice_sql, (payment_description, amount_billed, amount, email, timestamp))
                    
                    # Update mpesa_transactions status
                    update_sql = """
                        UPDATE mpesa_transactions 
                        SET status = 'Completed' 
                        WHERE CheckoutRequestID = %s
                    """
                    cursor.execute(update_sql, (checkout_request_id,))
                    
                    conn.commit()
                    
# Send confirmation email
                    try:
                        send_confirmation_email(email, phone_number, transaction_id, amount, "premium")
                    except Exception as email_err:
                        logger.error(f"Error sending confirmation email: {email_err}")

                    # Notify officials (Chairperson, Treasurer, National Secretary)
                    try:
                        official_positions = ("Chairperson", "Treasurer", "National Secretary")

                        placeholders = ",".join(["%s"] * len(official_positions))

                        query = f"""
                            SELECT position, personalmembership_email AS email
                            FROM officialsmembers
                            WHERE position IN ({placeholders})
                        """

                        cursor.execute(query, official_positions)
                        official_rows = cursor.fetchall()

                        logger.info(f"Officials found: {official_rows}")

                        officials = []
                        for r in official_rows:
                            officials.append({
                                "position": r["position"],
                                "email": r["email"],
                                "name": r["position"],
                            })

                        # Get paying member name
                        paying_member_name = email
                        try:
                            cursor.execute(
                                "SELECT name FROM personalmembership WHERE email = %s",
                                (email,),
                            )
                            pm_row = cursor.fetchone()

                            if pm_row and pm_row[0]:
                                paying_member_name = pm_row[0]
                            else:
                                cursor.execute(
                                    "SELECT contact_person FROM organizationmembership WHERE organization_email = %s",
                                    (email,),
                                )
                                org_row = cursor.fetchone()

                                if org_row and org_row[0]:
                                    paying_member_name = org_row[0]

                        except Exception as e:
                            logger.warning(f"Could not resolve member name: {e}")

                        # Send emails only if officials exist
                        if officials:
                            send_official_payment_notification_emails(
                                officials=officials,
                                member_name=paying_member_name,
                                payment_reason="Membership Premium Payment",
                                amount=amount,
                                transaction_timestamp=timestamp,
                            )
                        else:
                            logger.warning("No officials found for notification")

                    except Exception as official_email_err:
                        logger.error(f"Error sending official payment notification emails: {official_email_err}")

                    logger.info(f"Premium payment processed successfully for {email}")

                    
                    cursor.close()

                    conn.close()
                    
                    return jsonify({
                        "success": True,
                        "message": "Payment processed successfully"
                    }), 200
                else:
                    logger.error("Failed to insert payment details")
                    cursor.close()
                    conn.close()
                    return jsonify({
                        "success": False,
                        "message": "Failed to insert payment details"
                    }), 500
            else:
                logger.error(f"No email found for CheckoutRequestID: {checkout_request_id}")
                cursor.close()
                conn.close()
                return jsonify({
                    "success": False,
                    "message": "No email found for CheckoutRequestID"
                }), 404
        else:
            # Transaction failed
            logger.info(f"Transaction failed: {result_desc}")
            
            # Update transaction status if we have the checkout ID
            if checkout_request_id:
                try:
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    update_sql = """
                        UPDATE mpesa_transactions 
                        SET status = 'Failed' 
                        WHERE CheckoutRequestID = %s
                    """
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
        logger.error(f"Error processing premium callback: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Error processing callback: {str(e)}"
        }), 500





def _get_smtp_config():
    return {
        "smtp_host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.environ.get("SMTP_PORT", "587")),
        "smtp_user": os.environ.get("SMTP_USER", "payments@agl.or.ke"),
        "smtp_password": os.environ.get("SMTP_PASSWORD", ""),
    }


def send_official_payment_notification_emails(officials, member_name, payment_reason, amount, transaction_timestamp):
    """Notify officials that a payment has been processed."""
    if not officials:
        return

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_cfg = _get_smtp_config()
        if not smtp_cfg["smtp_password"]:
            logger.warning("SMTP password not configured, skipping official notification emails")
            return

        amount_str = f"{amount}"
        txn_date = transaction_timestamp.split(" ")[0] if transaction_timestamp else "-"
        txn_time = transaction_timestamp.split(" ")[1] if len(transaction_timestamp.split(" ")) > 1 else "-"

        for o in officials:
            recipient_email = (o.get("email") or "").strip()
            recipient_name = (o.get("name") or "Official").strip() or "Official"
            if not recipient_email:
                continue

            msg = MIMEMultipart()
            msg['From'] = smtp_cfg["smtp_user"]
            msg['To'] = recipient_email
            msg['Subject'] = "New Payment Processed"

            message = f"""Dear {recipient_name},

This is to notify you that a new payment has been successfully processed in the system.

Payment Details:

Member Name: {member_name}
Reason for Payment: {payment_reason}
Amount Paid: KES {amount_str}
Transaction Date: {txn_date}
Transaction Time: {txn_time}

Please log into the system for more details if necessary.

Thank you.

Kind regards,
"""

            msg.attach(MIMEText(message, 'plain'))

            server = smtplib.SMTP(smtp_cfg["smtp_host"], smtp_cfg["smtp_port"])
            server.starttls()
            server.login(smtp_cfg["smtp_user"], smtp_cfg["smtp_password"])
            server.sendmail(smtp_cfg["smtp_user"], recipient_email, msg.as_string())
            server.quit()

            logger.info(f"Official notification email sent to {recipient_email}")

    except Exception as e:
        logger.error(f"Error sending official payment notification emails: {str(e)}")


def send_confirmation_email(email, phone_number, transaction_id, amount, payment_type):


    """
    Send confirmation email for successful payment.
    
    Args:
        email: Member's email address
        phone_number: Phone number used for payment
        transaction_id: M-Pesa transaction ID
        amount: Payment amount
        payment_type: "registration" or "premium"
    """
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        # Email configuration
        smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        smtp_user = os.environ.get("SMTP_USER", "payments@agl.or.ke")
        smtp_password = os.environ.get("SMTP_PASSWORD", "")
        
        # Skip if no SMTP password configured
        if not smtp_password:
            logger.warning("SMTP password not configured, skipping email")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = email
        
        if payment_type == "premium":
            msg['Subject'] = "Membership Premium Payment"
            message = f"""Dear Member,

Thank you for your Premium payment of Ksh {amount}.

Transaction ID: {transaction_id}

Kindly download your invoice from the portal.

Best regards,
AGL Team
"""
        else:
            msg['Subject'] = "Membership Registration Payment"
            message = f"""Dear Member,

Thank you for your Registration payment of Ksh {amount}.

Transaction ID: {transaction_id}

Kindly download your invoice from the portal.

Best regards,
AGL Team
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

