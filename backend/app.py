import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session

import mysql.connector

app = Flask(__name__)

# CORS configuration
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://192.168.16.100:8080"])

# Database configuration variables (read from .env)
DB_HOST = os.environ.get("DB_HOST")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
Session(app)

# directory where uploaded files will be stored
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")

# Register blueprints
from login.routes import login_bp
from register.routes import register_bp
from PortalComponents.admin.payments.memberPayments import member_payments_bp
from PortalComponents.admin.payments.membersPremiumsPayments import member_premiums_payments_bp
from PortalComponents.payments.registration import registration_payments_bp
from PortalComponents.payments.registration import callback_bp as registration_callback_bp
from PortalComponents.payments.premiums import premiums_bp
from PortalComponents.payments.premiums import callback_bp as premium_callback_bp
from PortalComponents.payments.events import events_bp
from PortalComponents.payments.events import callback_bp as events_callback_bp

# NEW: Events, Blogs, and Communications blueprints
from PortalComponents.events.pastEvents import past_events_bp
from PortalComponents.events.comingEvents import planned_events_bp
from PortalComponents.blogs import blogs_bp
from PortalComponents.communications import communications_bp

app.register_blueprint(login_bp)
app.register_blueprint(register_bp)
app.register_blueprint(member_payments_bp)
app.register_blueprint(member_premiums_payments_bp)
app.register_blueprint(registration_payments_bp)
app.register_blueprint(registration_callback_bp)
app.register_blueprint(premiums_bp)
app.register_blueprint(premium_callback_bp)
app.register_blueprint(events_bp)
app.register_blueprint(events_callback_bp)

# NEW: Register events, blogs, and communications blueprints
app.register_blueprint(past_events_bp)
app.register_blueprint(planned_events_bp)
app.register_blueprint(blogs_bp)
app.register_blueprint(communications_bp)


def get_db_connection():
    """Return a new MySQL connection using configuration variables."""
    # Use environment variables or sensible defaults
    db_host = os.environ.get("DB_HOST") or "127.0.0.1"
    db_user = os.environ.get("DB_USER") or "root"
    db_password = os.environ.get("DB_PASSWORD") or ""
    db_name = os.environ.get("DB_NAME") or "locagldatabase"
    
    return mysql.connector.connect(
        host=db_host,
        port=3306,
        user=db_user,
        password=db_password,
        database=db_name,
    )


@app.route("/")
def home():
    return jsonify({"message": "Flask backend running 🚀"})

@app.route("/api/debug/db-status", methods=["GET"])
def db_status():
    """Debug endpoint to test database connectivity."""
    try:
        print(f"Attempting to connect to DB: {DB_HOST}, User: {DB_USER}, DB: {DB_NAME}")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        conn.close()
        return jsonify({
            "status": "success",
            "message": "Database connection successful",
            "config": {
                "host": DB_HOST,
                "user": DB_USER,
                "database": DB_NAME,
            }
        }), 200
    except Exception as e:
        error_msg = str(e)
        print(f"Database connection error: {error_msg}")
        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": error_msg,
            "config": {
                "host": DB_HOST,
                "user": DB_USER,
                "database": DB_NAME,
            }
        }), 500

@app.route("/students/<int:id>", methods=["GET"])
def get_student(id):
    return jsonify({"student_id": id})


# Protected routes
from login.decorators import login_required, user_type_required
from login.auth import get_user_info


@app.route("/api/portal", methods=["GET"])
@login_required
def portal():
    """
    Protected portal endpoint - requires login.
    Returns user's dashboard data.
    """
    user_id = session.get('user_id')
    user_type = session.get('user_type')
    
    if not user_id:
        return jsonify({"status": "error", "message": "User not found in session"}), 401
    
    user_info = get_user_info(user_id, user_type)
    
    return jsonify({
        "status": "success",
        "message": "Welcome to your portal",
        "user": {
            "id": user_id,
            "email": session.get('user_email'),
            "type": user_type,
            "name": user_info.get('name') if user_type == 'individual' else user_info.get('organization_name')
        }
    }), 200


# ... all your imports and setup above ...

@app.route("/error")
def error():
    1 / 0  # intentional error to trigger Flask web debugger

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)