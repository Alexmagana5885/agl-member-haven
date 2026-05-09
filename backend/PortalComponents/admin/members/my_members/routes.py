"""My Members (organization inner members CRUD)

This module exposes organization-members-only CRUD endpoints.

Expected auth:
- session must contain 'user_id' and 'user_type' == 'organization'
- we use session['user_email'] as the organization identifier

Database assumptions:
- `organisationinnermembers` table exists with columns:
  id, name, email, phone, organization_email (or organisation_email)

If your actual column/table names differ, adjust the SQL accordingly.
"""

import logging
import os
import mysql.connector

from flask import Blueprint, jsonify, request, session

from login.decorators import user_type_required

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

my_members_bp = Blueprint(
    "my_members",
    __name__,
    url_prefix="/api/admin/my-members",
)


def get_db_connection():
    db_host = os.environ.get("DB_HOST", "127.0.0.1")
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "locagldatabase")

    return mysql.connector.connect(
        host=db_host,
        port=3306,
        user=db_user,
        password=db_password,
        database=db_name,
    )


def _get_org_email_from_session():
    # In this codebase, auth/session uses 'user_email' as the logged-in email.
    return session.get("user_email") or session.get("member_email") or session.get("email")


@my_members_bp.route("", methods=["GET"])
@user_type_required("organization")
def list_my_members():
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        # Try likely column names.
        cursor.execute(
            """
            SELECT id, name, email, phone
            FROM organisationinnermembers
            WHERE organization_email = %s OR organisation_email = %s
            ORDER BY name
            """,
            (org_email, org_email),
        )
        rows = cursor.fetchall()
        return jsonify({"success": True, "members": rows}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error listing my members")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@my_members_bp.route("", methods=["POST"])
@user_type_required("organization")
def add_my_member():
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()

    if not name or not email or not phone:
        return jsonify({"success": False, "message": "name, email, phone are required"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO organisationinnermembers (name, email, phone, organization_email)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, phone, org_email),
        )
        conn.commit()

        member_id = cursor.lastrowid
        return jsonify({"success": True, "message": "Member added", "member": {"id": member_id, "name": name, "email": email, "phone": phone}}), 201
    except mysql.connector.Error as e:
        logger.exception("DB error adding my member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@my_members_bp.route("/<member_id>", methods=["PUT"])
@user_type_required("organization")
def update_my_member(member_id: str):
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()

    if not member_id:
        return jsonify({"success": False, "message": "member_id is required"}), 400

    if not name or not email or not phone:
        return jsonify({"success": False, "message": "name, email, phone are required"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE organisationinnermembers
            SET name=%s, email=%s, phone=%s
            WHERE id=%s AND (organization_email=%s OR organisation_email=%s)
            """,
            (name, email, phone, member_id, org_email, org_email),
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404

        return jsonify({"success": True, "message": "Member updated", "member": {"id": member_id, "name": name, "email": email, "phone": phone}}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error updating my member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@my_members_bp.route("/<member_id>", methods=["DELETE"])
@user_type_required("organization")
def delete_my_member(member_id: str):
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    if not member_id:
        return jsonify({"success": False, "message": "member_id is required"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM organisationinnermembers
            WHERE id=%s AND (organization_email=%s OR organisation_email=%s)
            """,
            (member_id, org_email, org_email),
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404

        return jsonify({"success": True, "message": "Member deleted"}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error deleting my member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

