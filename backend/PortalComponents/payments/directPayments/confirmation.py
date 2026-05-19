"""Generic C2B confirmation route."""

import logging
from flask import Blueprint, jsonify, request

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

        # Actual C2B fields
        transaction_id = data.get("TransID")
        transaction_time = data.get("TransTime")
        amount = data.get("TransAmount")
        phone = data.get("MSISDN")
        account = data.get("BillRefNumber")
        receipt = data.get("TransID")
        balance = data.get("OrgAccountBalance")

        if not transaction_id:
            return jsonify({
                "ResultCode":1,
                "ResultDesc":"Missing TransID"
            }),400

        saved = save_direct_mpesa_payment(
            merchant_request_id=None,
            checkout_request_id=transaction_id,
            result_code=0,
            result_desc="Success",
            amount=amount,
            receipt=receipt,
            balance=balance,
            transaction_date=transaction_time,
            phone=phone,
            account=account
        )

        if not saved:
            return jsonify({
                "ResultCode":1,
                "ResultDesc":"Save failed"
            }),500

        return jsonify({
            "ResultCode":0,
            "ResultDesc":"Accepted"
        })

    except Exception as e:
        logger.error(str(e))

        return jsonify({
            "ResultCode":1,
            "ResultDesc":"Error processing confirmation"
        }),500