"""C2B validation route."""

import logging
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)

validation_bp = Blueprint(
    "validation_bp",
    __name__,
    url_prefix="/api/payments/directPayments"
)


@validation_bp.route("/validation", methods=["POST"])
def validation():
    data = request.get_json(silent=True) or {}

    logger.info(f"C2B VALIDATION: {data}")

    # Basic schema validation for required fields
    missing = []
    for k in ("CheckoutRequestID", "MpesaReceiptNumber"):
        if data.get(k) in (None, ""):
            missing.append(k)

    if missing:
        return jsonify({
            "ResultCode": 1,
            "ResultDesc": f"Missing required fields: {', '.join(missing)}"
        }), 400

    return jsonify({
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    })

