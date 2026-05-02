"""M-Pesa Access Token Generator."""
import os
import base64
import requests
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# M-Pesa API Configuration
MPESA_CONSUMER_KEY = os.environ.get("CONSUMER_KEY", "your_consumer_key_here")
MPESA_CONSUMER_SECRET = os.environ.get("CONSUMER_SECRET", "your_consumer_secret_here")
MPESA_ENVIRONMENT = os.environ.get("ENVIRONMENT", "sandbox")

# API URLs
if MPESA_ENVIRONMENT == "production":
    MPESA_AUTH_URL = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
else:
    MPESA_AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

# Cache for access token
_cached_token = None
_token_expiry = None


def get_access_token():
    """
    Get M-Pesa access token.
    Uses caching to avoid requesting a new token on every call.
    Token is valid for 1 hour (3600 seconds).
    """
    global _cached_token, _token_expiry
    
    # Check if we have a valid cached token
    if _cached_token and _token_expiry and datetime.now() < _token_expiry:
        logger.debug("Using cached access token")
        return _cached_token
    
    logger.info("Requesting new M-Pesa access token")
    
    try:
        # Create credentials string
        credentials = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(MPESA_AUTH_URL, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            _cached_token = data.get("access_token")
            # Set expiry to 55 minutes from now (to be safe)
            _token_expiry = datetime.now() + timedelta(minutes=55)
            logger.info("Successfully obtained M-Pesa access token")
            return _cached_token
        else:
            logger.error(f"Failed to get access token. Status: {response.status_code}, Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception while getting access token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error getting access token: {str(e)}")
        return None


def clear_cached_token():
    """Clear the cached access token (useful for testing)."""
    global _cached_token, _token_expiry
    _cached_token = None
    _token_expiry = None
    logger.info("Cleared cached M-Pesa access token")

