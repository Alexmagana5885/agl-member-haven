"""Authentication logic and session management."""
import mysql.connector
from werkzeug.security import check_password_hash
import os


def get_db_connection():
    """Return a new MySQL connection using configuration variables."""
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_USER = os.environ.get("DB_USER", "rke_adminM")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "Mex#588599")
    DB_NAME = os.environ.get("DB_NAME", "aglorke_agldatabase")
    
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
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            table = "organizationmembership"
            email_column = "organization_email"
        else:
            table = "personalmembership"
            email_column = "email"
        
        sql = f"SELECT id, {email_column} as email, password FROM {table} WHERE {email_column} = %s"
        cursor.execute(sql, (email,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            # Remove password from returned data
            user_data = {
                'id': user['id'],
                'email': user['email'],
                'type': user_type
            }
            return user_data
        
        return None
    
    except Exception as e:
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
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        if user_type == "organization":
            sql = "SELECT * FROM organizationmembership WHERE id = %s"
        else:
            sql = "SELECT * FROM personalmembership WHERE id = %s"
        
        cursor.execute(sql, (user_id,))
        user = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return user
    
    except Exception as e:
        print(f"Error fetching user info: {str(e)}")
        return None
