"""Authentication logic and session management."""
import logging
import mysql.connector
from werkzeug.security import check_password_hash
import os

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_db_connection():
    """Return a new MySQL connection using configuration variables from .env."""
    DB_HOST = os.environ.get("DB_HOST")
    DB_USER = os.environ.get("DB_USER")
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_NAME = os.environ.get("DB_NAME")
    
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )


def authenticate_user(email, password, user_type="individual"):
    """
    Authenticate a user and return user data if credentials are valid.
    
    Args:
        email (str): User email
        password (str): User password (plain text)
        user_type (str): Either "individual" or "organization"
    
    Returns:
        dict: User data if authentication successful, None otherwise
    """
    try:
        logger.debug(f"authenticate_user() called for: {email} ({user_type})")
        
        conn = get_db_connection()
        logger.debug(f"Database connection established")
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            table = "organizationmembership"
            email_column = "organization_email"
        else:
            table = "personalmembership"
            email_column = "email"
        
        logger.debug(f"Querying {table} table for email: {email}")
        sql = f"SELECT id, {email_column} as email, password FROM {table} WHERE {email_column} = %s"
        cursor.execute(sql, (email,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not user:
            logger.warning(f"No user found in {table} with {email_column}: {email}")
            return None
        
        logger.debug(f"User found in database with ID: {user['id']}")
        logger.debug(f"Verifying password hash")
        
        if check_password_hash(user['password'], password):
            logger.info(f"Password verification successful for {email}")
            # Remove password from returned data
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'type': user_type
            }
            return user_data
        else:
            logger.warning(f"Password verification failed for {email} - incorrect password")
            return None
        
    except Exception as e:
        logger.error(f"Error during authentication for {email}: {str(e)}")
        print(f"Authentication error: {str(e)}")
        return None


def get_user_info(user_id, user_type="individual"):
    """
    Fetch full user information from database.
    
    Args:
        user_id (str): User ID
        user_type (str): Either "individual" or "organization"
    
    Returns:
        dict: User data
    """
    try:
        logger.debug(f"get_user_info() called for user_id: {user_id} ({user_type})")
        
        conn = get_db_connection()
        logger.debug(f"Database connection established for user info retrieval")
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            sql = "SELECT * FROM organizationmembership WHERE id = %s"
        else:
            sql = "SELECT * FROM personalmembership WHERE id = %s"
        
        logger.debug(f"Executing query to fetch {user_type} user data")
        cursor.execute(sql, (user_id,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user:
            logger.debug(f"User information retrieved successfully for user_id: {user_id}")
        else:
            logger.warning(f"No user information found for user_id: {user_id}")
        
        return user
    
    except Exception as e:
        logger.error(f"Error fetching user info for user_id {user_id}: {str(e)}")
        print(f"Error fetching user info: {str(e)}")
        return None
