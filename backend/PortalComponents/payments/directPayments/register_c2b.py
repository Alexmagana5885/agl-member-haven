"""Register C2B URLs."""

import requests
import os

from ..accessToken import get_access_token

MPESA_ENVIRONMENT = os.environ.get("MPESA_ENVIRONMENT", "sandbox")

SHORTCODE = os.environ.get("MY_BUSINESS_SHORT_CODE")
CONFIRMATIONURL = os.environ.get("CONFIRMATIONURL")
VALIDATIONURL = os.environ.get("VALIDATIONURL")

if MPESA_ENVIRONMENT == "production":
    URL = "https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl"
else:
    URL = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"

access_token = get_access_token()

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

payload = {
    "ShortCode": SHORTCODE,
    "ResponseType": "Completed",
    "ConfirmationURL": CONFIRMATIONURL,
    "ValidationURL": VALIDATIONURL
}

response = requests.post(
    URL,
    json=payload,
    headers=headers
)

print(response.status_code)
print(response.text)