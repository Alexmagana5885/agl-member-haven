import os
from dotenv import load_dotenv
load_dotenv()
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session

import mysql.connector

app = Flask(__name__)

# CORS configuration
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:3000"])

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
app.register_blueprint(login_bp)
app.register_blueprint(register_bp)


def get_db_connection():
    """Return a new MySQL connection using configuration variables."""
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )


@app.route("/")
def home():
    return jsonify({"message": "Flask backend running 🚀"})

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


if __name__ == "__main__":
    app.run(debug=True)