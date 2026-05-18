"""Generic C2B confirmation route - saves all M-Pesa payments."""

import logging
from flask import Blueprint, jsonify, request
from datetime import datetime

from .save_functions import save_direct_mpesa_payment

logger = logging.getLogger(__name__)

confirmation_bp = Blueprint(
    "confirmation_bp",
    __name__,
    url_prefix="/api/payments/directPayments"
)


@confirmation_bp.route("/confirmation", methods=["POST"])
def confirmation():

    try:
        data = request.get_json()

        logger.info(f"C2B CONFIRMATION: {data}")

        # Extract Safaricom fields
        merchant_request_id = data.get("MerchantRequestID")
        checkout_request_id = data.get("CheckoutRequestID")
        result_code = data.get("ResultCode")
        result_desc = data.get("ResultDesc")

        amount = data.get("Amount")
        receipt = data.get("MpesaReceiptNumber")
        balance = data.get("Balance")
        transaction_date = data.get("TransactionDate")
        phone = data.get("PhoneNumber")

        account = data.get("BillRefNumber") or data.get("AccountReference")

        # Validate minimum required fields
        if checkout_request_id is None or receipt is None:
            return jsonify({
                "ResultCode": 1,
                "ResultDesc": "Missing CheckoutRequestID or MpesaReceiptNumber"
            }), 400

        # Only save successful payments
        if result_code != 0:
            # Return Accepted to avoid re-trying failed transactions
            return jsonify({
                "ResultCode": 0,
                "ResultDesc": "Accepted"
            })

        saved = save_direct_mpesa_payment(
            merchant_request_id=merchant_request_id,
            checkout_request_id=checkout_request_id,
            result_code=result_code,
            result_desc=result_desc,
            amount=amount,
            receipt=receipt,
            balance=balance,
            transaction_date=transaction_date,
            phone=phone,
            account=account
        )

        if not saved:
            # Do not lie to M-Pesa if persistence failed
            return jsonify({
                "ResultCode": 1,
                "ResultDesc": "Failed to save payment"
            }), 500

        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        })

    except Exception as e:
        logger.error(f"C2B confirmation error: {str(e)}")
        return jsonify({
            "ResultCode": 1,
            "ResultDesc": "Error processing confirmation"
        }), 500

