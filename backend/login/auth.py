"""Authentication logic and session management."""

import logging
import mysql.connector
import os
import bcrypt
from werkzeug.security import check_password_hash
from datetime import date

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


def calculate_payments_status(email):
    """Calculate premium payments status for current year (reusable)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        current_year = date.today().year
        current_year_start = f"{current_year}-01-01"
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) as total_paid 
            FROM member_premium_payments 
            WHERE member_email = %s AND DATE(timestamp) >= %s
        """, (email, current_year_start))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        total_paid = float(result['total_paid'] or 0)
        fully_paid = total_paid >= 3600.0
        next_year = current_year + 1
        next_payment_date = f"{next_year}-01-01"
        
        return {
            "total_paid_this_year": round(total_paid, 2),
            "required_amount": 3600.0,
            "fully_paid": fully_paid,
            "status": "Fully Paid for Current Year" if fully_paid else f"Outstanding: KES {round(3600 - total_paid, 2)}",
            "next_payment_date": next_payment_date
        }
    except Exception as e:
        logger.error(f"Payments calc error for {email}: {e}")
        return {"error": "Unable to calculate payments status", "total_paid_this_year": 0, "fully_paid": False, "status": "Error", "next_payment_date": "N/A"}



def get_profile_data(user_id, user_type, email):
    """Get complete profile data: membership + payments + education."""
    try:
        member_info = get_user_info(user_id, user_type)
        if not member_info:
            logger.warning(f"No member info for {user_id}")
            return {
                "user_type": user_type,
                "name": "N/A",
                "email": email,
                "registration_date": "N/A",
                "education": None,
                "payments": {"error": "Member not found"}
            }
            
        payments = calculate_payments_status(email)
        
        profile = {
            "member_info": {k: v.isoformat() if hasattr(v, 'isoformat') else v for k, v in member_info.items()},
            "user_type": user_type,
            "name": member_info.get('name') or member_info.get('organization_name', 'N/A'),
            "email": email,
            "registration_date": str(member_info.get('registration_date') or member_info.get('date_of_registration', 'N/A')),
            "education": {
                "highest_degree": member_info.get('highest_degree'),
                "institution": member_info.get('institution'),
                "graduation_year": int(member_info.get('graduation_year') or 0)
            } if user_type == "individual" else None,
            "payments": payments
        }
        return profile
        
    except Exception as e:
        logger.error(f"Profile data error: {e}")
        return {
            "user_type": user_type,
            "name": "Error loading profile",
            "email": email,
            "registration_date": "N/A",
            "education": None,
            "payments": {"error": str(e)}
        }


def find_user_by_email(email):
    """Find user by email in either personalmembership or organizationmembership."""
    email = email.lower().strip()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check personalmembership
        cursor.execute("SELECT id, email, 'individual' as type FROM personalmembership WHERE email = %s", (email,))
        user = cursor.fetchone()
        if user:
            cursor.close()
            conn.close()
            return user
            
        # Check organizationmembership
        cursor.execute("SELECT id, organization_email as email, 'organization' as type FROM organizationmembership WHERE organization_email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
        
    except Exception as e:
        logger.error(f"Error finding user by email {email}: {str(e)}")
        return None


def hash_password(password):
    """Generate bcrypt hash for new password."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Convert to PHP-compatible $2y$ format
    return hashed.decode('utf-8').replace('$2b$', '$2y$')


def update_user_password(user_id, user_type, hashed_password):
    """Update user password in database."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        table = "personalmembership" if user_type == "individual" else "organizationmembership"
        column = "password"
        
        cursor.execute(f"UPDATE {table} SET {column} = %s WHERE id = %s", (hashed_password, user_id))
        affected = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        logger.info(f"Password update for user {user_id} ({user_type}): affected rows={affected}")
        return affected > 0
        
    except Exception as e:
        logger.error(f"Error updating password for {user_id}: {str(e)}")
        return False



