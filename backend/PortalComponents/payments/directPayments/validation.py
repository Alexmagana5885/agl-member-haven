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

    data = request.get_json()

    logger.info(f"C2B VALIDATION: {data}")

    return jsonify({
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    })