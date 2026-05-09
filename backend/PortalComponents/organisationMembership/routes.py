"""Organisation inner members CRUD.

Endpoints are intended for organisation user type.
They operate on `organisationinnermembers` and enforce that:
- only members whose motherOrganisationEmail matches the logged-in session email are returned/modified.

Auth assumption:
- session contains `user_type` and `user_email` (organisation identifier)

DB schema reference: backend/DBstructure.sql
- organisationinnermembers(id, name, email, phone_number, motherOrganisationID, motherOrganisationEmail, ...)
"""

import logging
import os
import mysql.connector

from flask import Blueprint, jsonify, request, session

from login.decorators import user_type_required

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

organisation_members_bp = Blueprint(
    "organisation_members",
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


def _get_org_email_from_session() -> str | None:
    # In this codebase auth/session uses 'user_email' as the logged-in email.
    return session.get("user_email") or session.get("member_email") or session.get("email")


@organisation_members_bp.route("", methods=["GET"])
@user_type_required("organization")
def list_organisation_inner_members():
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, name, email, phone_number AS phone
            FROM organisationinnermembers
            WHERE motherOrganisationEmail = %s
            ORDER BY name
            """,
            (org_email,),
        )
        rows = cursor.fetchall()
        return jsonify({"success": True, "members": rows}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error listing organisation inner members")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@organisation_members_bp.route("", methods=["POST"])
@user_type_required("organization")
def add_organisation_inner_member():
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
            INSERT INTO organisationinnermembers (name, email, phone_number, motherOrganisationEmail)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, phone, org_email),
        )
        conn.commit()

        member_id = cursor.lastrowid
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Member added",
                    "member": {"id": str(member_id), "name": name, "email": email, "phone": phone},
                }
            ),
            201,
        )
    except mysql.connector.Error as e:
        logger.exception("DB error adding organisation inner member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@organisation_members_bp.route("/<member_id>", methods=["PUT"])
@user_type_required("organization")
def update_organisation_inner_member(member_id: str):
    org_email = _get_org_email_from_session()
    if not org_email:
        return jsonify({"success": False, "message": "Organization email not found in session"}), 401

    if not member_id:
        return jsonify({"success": False, "message": "member_id is required"}), 400

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
            UPDATE organisationinnermembers
            SET name=%s, email=%s, phone_number=%s
            WHERE id=%s AND motherOrganisationEmail=%s
            """,
            (name, email, phone, member_id, org_email),
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Member updated",
                    "member": {"id": str(member_id), "name": name, "email": email, "phone": phone},
                }
            ),
            200,
        )
    except mysql.connector.Error as e:
        logger.exception("DB error updating organisation inner member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@organisation_members_bp.route("/<member_id>", methods=["DELETE"])
@user_type_required("organization")
def delete_organisation_inner_member(member_id: str):
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
            WHERE id=%s AND motherOrganisationEmail=%s
            """,
            (member_id, org_email),
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404

        return jsonify({"success": True, "message": "Member deleted"}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error deleting organisation inner member")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

