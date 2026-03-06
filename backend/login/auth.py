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
    # Use environment variables or sensible defaults
    db_host = os.environ.get("DB_HOST") or "127.0.0.1"
    db_user = os.environ.get("DB_USER") or "root"
    db_password = os.environ.get("DB_PASSWORD") or ""
    db_name = os.environ.get("DB_NAME") or "locagldatabase"
    
    print(f"[DB] Connecting to: host={db_host}, user={db_user}, db={db_name}")
    
    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name,
        )
        print(f"[DB] Connection SUCCESSFUL")
        return conn
    except mysql.connector.Error as err:
        print(f"[DB] Connection FAILED: {err}")
        raise


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
    print(f"[AUTH] Starting authentication for: {email}, type: {user_type}")
    try:
        logger.debug(f"authenticate_user() called for: {email} ({user_type})")
        
        try:
            print(f"[AUTH] Attempting database connection...")
            conn = get_db_connection()
            print(f"[AUTH] Database connection SUCCESSFUL")
            logger.debug(f"Database connection established")
        except Exception as db_err:
            print(f"[AUTH] Database connection FAILED: {str(db_err)}")
            logger.error(f"Database connection failed: {str(db_err)}")
            raise Exception(f"Database connection failed: {str(db_err)}")
        
        print(f"[AUTH] Querying database...")
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            table = "organizationmembership"
            email_column = "organization_email"
        else:
            table = "personalmembership"
            email_column = "email"
        
        print(f"[AUTH] Table: {table}, Column: {email_column}")
        logger.debug(f"Querying {table} table for email: {email}")
        sql = f"SELECT id, {email_column} as email, password FROM {table} WHERE {email_column} = %s"
        cursor.execute(sql, (email,))
        user = cursor.fetchone()
        
        print(f"[AUTH] Query result: {user}")
        cursor.close()
        conn.close()
        
        if not user:
            print(f"[AUTH] No user found in {table} with {email_column}: {email}")
            logger.warning(f"No user found in {table} with {email_column}: {email}")
            return None
        
        print(f"[AUTH] User found with ID: {user['id']}")
        logger.debug(f"User found in database with ID: {user['id']}")
        logger.debug(f"Verifying password hash")
        
        print(f"[AUTH] Verifying password hash...")
        if check_password_hash(user['password'], password):
            print(f"[AUTH] Password verification SUCCESSFUL for {email}")
            logger.info(f"Password verification successful for {email}")
            # Remove password from returned data
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'type': user_type
            }
            print(f"[AUTH] Returning user data: {user_data}")
            return user_data
        else:
            print(f"[AUTH] Password verification FAILED for {email}")
            logger.warning(f"Password verification failed for {email} - incorrect password")
            return None
        
    except Exception as e:
        print(f"[AUTH] ERROR during authentication: {str(e)}")
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
