import os
import uuid
from flask import Flask, jsonify, request
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename

import mysql.connector

app = Flask(__name__)

# Database configuration variables (override with environment variables in production)
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "rke_adminM")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "Mex#588599")
DB_NAME = os.environ.get("DB_NAME", "aglorke_agldatabase")

# directory where uploaded files will be stored
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")


def get_db_connection():
    """Return a new MySQL connection using configuration variables."""
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
    filename = secure_filename(file.filename)
    target_dir = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)
    filepath = os.path.join(target_dir, filename)
    file.save(filepath)
    return filepath


@app.route("/")
def home():
    return jsonify({"message": "Flask backend running 🚀"})

@app.route("/students/<int:id>", methods=["GET"])
def get_student(id):
    return jsonify({"student_id": id})


@app.route("/api/auth/register/organisation", methods=["POST"])
def register_organisation():
    # parse form data
    form = request.form
    files = request.files

    org_id = uuid.uuid4().hex[:15]

    logo_path = save_file(files.get("logoFile"), "organisation_logos")
    cert_path = save_file(files.get("certificateFile"), "organisation_certs")

    # hash password before storing
    password_hash = generate_password_hash(form.get("password", ""))

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
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
            form.get("organizationName"),
            form.get("organizationEmail"),
            form.get("contactPerson"),
            logo_path,
            form.get("contactPhone"),
            form.get("registrationDate") or None,
            form.get("organizationAddress"),
            form.get("country"),
            form.get("county"),
            form.get("town"),
            cert_path,
            form.get("organizationType"),
            form.get("startDate") or None,
            form.get("whatYouDo"),
            password_hash,
        )
        cursor.execute(sql, values)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"status": "success", "id": org_id})


@app.route("/api/auth/register/individual", methods=["POST"])
def register_individual():
    form = request.form
    files = request.files

    person_id = uuid.uuid4().hex[:11]

    passport_path = save_file(files.get("passportFile"), "passports")
    completion_path = save_file(files.get("completionLetterFile"), "completion_letters")

    password_hash = generate_password_hash(form.get("password", ""))

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = (
            "INSERT INTO personalmembership ("
            "id, name, email, phone, gender, home_address, passport_image, "
            "highest_degree, institution, graduation_year, completion_letter, "
            "profession, experience, current_company, position, work_address, password) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        )
        values = (
            person_id,
            form.get("name"),
            form.get("email"),
            form.get("phone"),
            form.get("gender"),
            form.get("homeAddress"),
            passport_path,
            form.get("highestDegree"),
            form.get("institution"),
            form.get("graduationYear"),
            completion_path,
            form.get("profession"),
            form.get("experience"),
            form.get("currentCompany"),
            form.get("position"),
            form.get("workAddress"),
            password_hash,
        )
        cursor.execute(sql, values)
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return jsonify({"status": "success", "id": person_id})

if __name__ == "__main__":
    app.run(debug=True)