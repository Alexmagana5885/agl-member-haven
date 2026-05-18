"""Save functions for direct M-Pesa C2B payments."""

import os
import logging
import mysql.connector

logger = logging.getLogger(__name__)


def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST"),
        port=3306,
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME"),
    )


def save_direct_mpesa_payment(
    merchant_request_id,
    checkout_request_id,
    result_code,
    result_desc,
    amount,
    receipt,
    balance,
    transaction_date,
    phone,
    account
):
    """
    Save ALL M-Pesa C2B payments into unified table.
    """

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            INSERT INTO directmpesapayments
            (
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
                Amount,
                MpesaReceiptNumber,
                Balance,
                TransactionDate,
                PhoneNumber,
                account,
                transactionCommited
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'notcommited')
            ON DUPLICATE KEY UPDATE
                MerchantRequestID = VALUES(MerchantRequestID),
                CheckoutRequestID = VALUES(CheckoutRequestID),
                ResultCode = VALUES(ResultCode),
                ResultDesc = VALUES(ResultDesc),
                Amount = VALUES(Amount),
                Balance = VALUES(Balance),
                TransactionDate = VALUES(TransactionDate),
                PhoneNumber = VALUES(PhoneNumber),
                account = VALUES(account),
                transactionCommited = 'notcommited'
        """


        values = (
            merchant_request_id,
            checkout_request_id,
            result_code,
            result_desc,
            amount,
            receipt,
            balance,
            transaction_date,
            phone,
            account
        )

        cursor.execute(sql, values)
        conn.commit()

        cursor.close()
        conn.close()

        logger.info(f"Saved C2B payment: {receipt}")

        return True

    except Exception as e:
        logger.error(f"Failed saving C2B payment: {str(e)}")
        return False