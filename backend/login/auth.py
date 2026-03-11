"""Authentication logic and session management."""

import logging
import mysql.connector
import os
import bcrypt
from werkzeug.security import check_password_hash

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_db_connection():
    """Create and return a MySQL database connection."""

    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")

    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=3306,
            user=db_user,
            password=db_password,
            database=db_name
        )

        logger.debug("Database connection successful")
        return conn

    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise


def verify_password(stored_hash, password):
    """
    Verify password supporting:
    - PHP bcrypt ($2y$)
    - Python bcrypt ($2b$)
    - Werkzeug hashes
    """

    if not stored_hash:
        return False

    try:
        # Detect PHP bcrypt
        if stored_hash.startswith("$2y$") or stored_hash.startswith("$2b$"):

            # Convert PHP bcrypt prefix
            if stored_hash.startswith("$2y$"):
                stored_hash = stored_hash.replace("$2y$", "$2b$", 1)

            return bcrypt.checkpw(
                password.encode("utf-8"),
                stored_hash.encode("utf-8")
            )

        # Otherwise use werkzeug
        return check_password_hash(stored_hash, password)

    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False


def authenticate_user(email, password, user_type="individual"):
    """
    Authenticate a user.

    Args:
        email (str)
        password (str)
        user_type (str) individual | organization

    Returns:
        dict | None
    """

    email = email.lower().strip()

    logger.debug(f"Authentication attempt: {email} ({user_type})")

    try:

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Select correct table
        if user_type == "organization":
            table = "organizationmembership"
            email_column = "organization_email"
        else:
            table = "personalmembership"
            email_column = "email"

        sql = f"""
        SELECT id, {email_column} AS email, password
        FROM {table}
        WHERE {email_column} = %s
        """

        cursor.execute(sql, (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if not user:
            logger.warning(f"No user found: {email}")
            return None

        stored_hash = user["password"]

        logger.debug(f"Stored hash format: {stored_hash[:30]}...")
        logger.debug(f"Password received: {password}")

        password_valid = verify_password(stored_hash, password)

        logger.debug(f"Password verification result: {password_valid}")

        if password_valid:

            logger.info(f"Authentication successful for {email}")

            return {
                "id": user["id"],
                "email": user["email"],
                "type": user_type
            }

        logger.warning(f"Invalid password for {email}")
        return None

    except Exception as e:
        logger.error(f"Authentication error for {email}: {str(e)}")
        return None


def get_user_info(user_id, user_type="individual"):
    """
    Get full user information from database.
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

        if user:
            logger.debug(f"User info retrieved for {user_id}")
        else:
            logger.warning(f"No user found with id {user_id}")

        return user

    except Exception as e:
        logger.error(f"Error fetching user info for {user_id}: {str(e)}")
        return None