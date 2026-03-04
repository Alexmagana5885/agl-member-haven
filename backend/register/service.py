"""Registration service logic for handling organization and individual registrations."""
import os
import uuid
import mysql.connector
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename



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


def save_file(file, subfolder=""):
    """Save an uploaded file under UPLOAD_DIR/subfolder and return its path."""
    if not file:
        return None
    
    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
    filename = secure_filename(file.filename)
    target_dir = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    filepath = os.path.join(target_dir, filename)
    file.save(filepath)
    return filepath


def register_organisation(form_data, files):
    """
    Register a new organization.
    
    Args:
        form_data: Request form data containing organization details
        files: Request files containing logo and certificate
    
    Returns:
        tuple: (success: bool, org_id: str, message: str)
    """
    try:
        org_id = uuid.uuid4().hex[:15]
        
        logo_path = save_file(files.get("logoFile"), "organisation_logos")
        cert_path = save_file(files.get("certificateFile"), "organisation_certs")
        
        password_hash = generate_password_hash(form_data.get("password", ""))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = (
            "INSERT INTO organizationmembership ("
            "id, organization_name, organization_email, contact_person, "
            "logo_image, contact_phone_number, date_of_registration, organization_address, "
            "location_country, location_county, location_town, registration_certificate, "
            "organization_type, start_date, what_you_do, password) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        )
        values = (
            org_id,
            form_data.get("organizationName"),
            form_data.get("organizationEmail"),
            form_data.get("contactPerson"),
            logo_path,
            form_data.get("contactPhone"),
            form_data.get("registrationDate") or None,
            form_data.get("organizationAddress"),
            form_data.get("country"),
            form_data.get("county"),
            form_data.get("town"),
            cert_path,
            form_data.get("organizationType"),
            form_data.get("startDate") or None,
            form_data.get("whatYouDo"),
            password_hash,
        )
        cursor.execute(sql, values)
        conn.commit()
        cursor.close()
        conn.close()
        
        return True, org_id, "Organization registered successfully"
    
    except Exception as e:
        return False, None, f"Registration error: {str(e)}"


def register_individual(form_data, files):
    """
    Register a new individual member.
    
    Args:
        form_data: Request form data containing personal details
        files: Request files containing passport and completion letter
    
    Returns:
        tuple: (success: bool, person_id: str, message: str)
    """
    try:
        person_id = uuid.uuid4().hex[:11]
        
        passport_path = save_file(files.get("passportFile"), "passports")
        completion_path = save_file(files.get("completionLetterFile"), "completion_letters")
        
        password_hash = generate_password_hash(form_data.get("password", ""))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = (
            "INSERT INTO personalmembership ("
            "id, name, email, phone, gender, home_address, passport_image, "
            "highest_degree, institution, graduation_year, completion_letter, "
            "profession, experience, current_company, position, work_address, password) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        )
        values = (
            person_id,
            form_data.get("name"),
            form_data.get("email"),
            form_data.get("phone"),
            form_data.get("gender"),
            form_data.get("homeAddress"),
            passport_path,
            form_data.get("highestDegree"),
            form_data.get("institution"),
            form_data.get("graduationYear"),
            completion_path,
            form_data.get("profession"),
            form_data.get("experience"),
            form_data.get("currentCompany"),
            form_data.get("position"),
            form_data.get("workAddress"),
            password_hash,
        )
        cursor.execute(sql, values)
        conn.commit()
        cursor.close()
        conn.close()
        
        return True, person_id, "Individual registered successfully"
    
    except Exception as e:
        return False, None, f"Registration error: {str(e)}"
