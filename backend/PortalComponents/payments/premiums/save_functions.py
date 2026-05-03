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

