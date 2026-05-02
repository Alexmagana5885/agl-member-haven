import os
import logging
import requests
from requests.auth import HTTPBasicAuth

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_access_token():
    """Generate M-Pesa access token"""
    
    consumer_key = os.environ.get("CONSUMER_KEY")
    consumer_secret = os.environ.get("CONSUMER_SECRET")
    access_token_url = os.environ.get("ACCESS_TOKEN_URL")

    if not consumer_key or not consumer_secret or not access_token_url:
        logger.error("Missing M-Pesa environment variables")
        return None

    try:
        response = requests.get(
            access_token_url,
            auth=HTTPBasicAuth(consumer_key, consumer_secret),
            headers={"Content-Type": "application/json"}
        )

        if response.status_code != 200:
            logger.error(f"M-Pesa token error: {response.status_code} - {response.text}")
            return None

        data = response.json()
        return data.get("access_token")

    except Exception as e:
        logger.error(f"Access token request failed: {str(e)}")
        return None
    
# if __name__ == "__main__":
#     token = get_access_token()
#     print("Access Token:", token)