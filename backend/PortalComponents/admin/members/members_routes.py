"""Admin members (personal + organization) listing/details + PDF exports."""

import os
import logging
from io import BytesIO
from typing import Any, Dict, List, Tuple

import mysql.connector
from flask import Blueprint, jsonify, request, session, send_file
from fpdf import FPDF
from login.decorators import login_required

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

admin_members_bp = Blueprint(
    "admin_members",
    __name__,
    url_prefix="/api/admin/members",
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


# Map member type -> base table + columns
PERSONAL_TABLE = "personalmembership"
ORG_TABLE = "organizationmembership"

PERSONAL_LIST_COLUMNS: List[Tuple[str, str]] = [
    ("id", "id"),
    ("name", "name"),
    ("email", "email"),
    ("phone", "phone"),
    ("registration_date", "registration_date"),
]

ORG_LIST_COLUMNS: List[Tuple[str, str]] = [
    ("id", "id"),
    ("organization_name", "name"),
    ("organization_email", "email"),
    ("contact_phone_number", "phone"),
    ("created_at", "registration_date"),
]


def _coerce_str(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def _row_to_kv(row: Dict[str, Any]) -> List[Tuple[str, str]]:
    items: List[Tuple[str, str]] = []
    for k, v in row.items():
        items.append((k, _coerce_str(v)))
    return items


@admin_members_bp.route("", methods=["GET"])
@login_required
def list_members():
    member_type = (request.args.get("type") or "").strip().lower()
    if member_type not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "type must be personal or organization"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        if member_type == "personal":
            cols = ", ".join([f"{src} AS {alias}" for src, alias in PERSONAL_LIST_COLUMNS])
            cursor.execute(
                f"SELECT {cols} FROM {PERSONAL_TABLE} ORDER BY name ASC",
            )
        else:
            cols = ", ".join([f"{src} AS {alias}" for src, alias in ORG_LIST_COLUMNS])
            cursor.execute(
                f"SELECT {cols} FROM {ORG_TABLE} ORDER BY organization_name ASC",
            )

        rows = cursor.fetchall() or []

        # Normalize keys for UI
        members = []
        for r in rows:
            members.append(
                {
                    "id": _coerce_str(r.get("id")),
                    "name": _coerce_str(r.get("name")),
                    "email": _coerce_str(r.get("email")),
                    "phone": _coerce_str(r.get("phone")),
                    "joined": _coerce_str(r.get("registration_date")),
                    "member_type": member_type,
                }
            )

        return jsonify({"success": True, "members": members}), 200

    except mysql.connector.Error as e:
        logger.exception("DB error listing members")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


@admin_members_bp.route("/<member_type>/<member_id>/details", methods=["GET"])
@login_required
def member_details(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        if mt == "personal":
            cursor.execute(
                f"SELECT * FROM {PERSONAL_TABLE} WHERE id = %s",
                (member_id,),
            )
        else:
            cursor.execute(
                f"SELECT * FROM {ORG_TABLE} WHERE id = %s",
                (member_id,),
            )

        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Member not found"}), 404

        # Ensure JSON serializable
        details = {k: _coerce_str(v) for k, v in row.items()}
        details["member_type"] = mt
        return jsonify({"success": True, "member": details}), 200

    except mysql.connector.Error as e:
        logger.exception("DB error getting member details")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()


def _write_kv_table(pdf: FPDF, title: str, kv: List[Tuple[str, str]]):
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, title, 0, 1)
    pdf.ln(1)

    pdf.set_font("Arial", "", 10)

    # Simple multi-line layout
    for k, v in kv:
        display_key = str(k).replace("_", " ").title()
        display_val = v
        if not display_val:
            display_val = "-"

        # Key
        pdf.set_font("Arial", "B", 9)
        pdf.multi_cell(35, 5, f"{display_key}:")
        # Value
        pdf.set_font("Arial", "", 9)
        pdf.multi_cell(0, 5, display_val)
        pdf.ln(1)


def _generate_members_records_pdf(member_type: str, members: List[Dict[str, Any]]):
    pdf = FPDF("P", "mm", "A4")
    pdf.add_page()

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 8, "Association of Government Librarians (AGL)", 0, 1, "C")
    pdf.set_font("Arial", "", 11)
    pdf.cell(0, 8, f"Members Records - {member_type.title()}", 0, 1, "C")
    pdf.ln(5)

    pdf.set_font("Arial", "B", 10)
    pdf.cell(15, 7, "#", 1)
    pdf.cell(50, 7, "Name", 1)
    pdf.cell(55, 7, "Email", 1)
    pdf.cell(35, 7, "Phone", 1)
    pdf.cell(30, 7, "Joined", 1)
    pdf.ln()

    pdf.set_font("Arial", "", 9)
    for idx, m in enumerate(members, start=1):
        pdf.cell(15, 7, str(idx), 1)
        pdf.cell(50, 7, _coerce_str(m.get("name"))[:22], 1)
        pdf.cell(55, 7, _coerce_str(m.get("email"))[:25], 1)
        pdf.cell(35, 7, _coerce_str(m.get("phone"))[:18], 1)
        pdf.cell(30, 7, _coerce_str(m.get("joined"))[:14], 1)
        pdf.ln()

    pdf_buffer = BytesIO()
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    pdf_buffer.write(pdf_bytes)
    pdf_buffer.seek(0)
    return pdf_buffer


def _generate_member_details_pdf(member_type: str, member: Dict[str, str]):
    pdf = FPDF("P", "mm", "A4")
    pdf.add_page()

    name = member.get("name") or member.get("organization_name") or "Member"
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 8, "Association of Government Librarians (AGL)", 0, 1, "C")
    pdf.set_font("Arial", "", 11)
    pdf.cell(0, 8, "Member Information", 0, 1, "C")
    pdf.ln(4)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 8, f"{member_type.title()} - {name}", 0, 1)
    pdf.ln(2)

    kv = sorted([(k, v) for k, v in member.items() if k != "member_type"], key=lambda x: x[0])
    _write_kv_table(pdf, "Details", kv)

    pdf_buffer = BytesIO()
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    pdf_buffer.write(pdf_bytes)
    pdf_buffer.seek(0)
    return pdf_buffer


@admin_members_bp.route("/<member_type>/<member_id>/details", methods=["PUT"])
@login_required
def update_member_details(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400
    if not member_id:
        return jsonify({"success": False, "message": "member_id is required"}), 400

    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict) or len(data) == 0:
        return jsonify({"success": False, "message": "No update payload provided"}), 400

    # Allowed columns per table (do not allow id to be updated)
    if mt == "personal":
        allowed_columns = {"name", "email", "phone", "home_address", "passport_image", "highest_degree", "institution", "graduation_year", "completion_letter", "profession", "experience", "current_company", "position", "work_address", "payment_Number", "payment_code", "payment_date", "password", "registration_date", "gender"}
        table = PERSONAL_TABLE
    else:
        allowed_columns = {"organization_name", "organization_email", "contact_person", "logo_image", "contact_phone_number", "date_of_registration", "organization_address", "location_country", "location_county", "location_town", "registration_certificate", "organization_type", "start_date", "what_you_do", "payment_Number", "payment_code", "payment_date", "password", "created_at", "registration_date", "organization_address"}
        table = ORG_TABLE

    set_clauses = []
    values = []
    for k, v in data.items():
        if k in ["member_type", "id"]:
            continue
        if k not in allowed_columns:
            continue
        set_clauses.append(f"{k}=%s")
        values.append(v)

    if not set_clauses:
        return jsonify({"success": False, "message": "No allowed fields provided"}), 400

    # Build query: UPDATE table SET a=%s,... WHERE id=%s
    values.append(member_id)
    sql = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE id=%s"

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(values))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404

        # Return fresh details
        cursor.close()
    except mysql.connector.Error as e:
        logger.exception("DB error updating member details")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

    # Re-fetch using existing endpoint logic
    return member_details(mt, member_id)

@admin_members_bp.route("/<member_type>/<member_id>/details", methods=["DELETE"])
@login_required
def delete_member_details(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400
    if not member_id:
        return jsonify({"success": False, "message": "member_id is required"}), 400

    table = PERSONAL_TABLE if mt == "personal" else ORG_TABLE

    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM {table} WHERE id=%s", (member_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Member not found"}), 404
        return jsonify({"success": True, "message": "Member deleted"}), 200
    except mysql.connector.Error as e:
        logger.exception("DB error deleting member details")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()

@admin_members_bp.route("/print", methods=["POST"])
@login_required
def print_members_records():
    data = request.get_json(silent=True) or {}
    member_type = (data.get("type") or "").strip().lower()
    if member_type not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "type must be personal or organization"}), 400

    # Re-fetch members server-side so PDF matches DB
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)

        if member_type == "personal":
            cols = ", ".join([f"{src} AS {alias}" for src, alias in PERSONAL_LIST_COLUMNS])
            cursor.execute(f"SELECT {cols} FROM {PERSONAL_TABLE} ORDER BY name ASC")
        else:
            cols = ", ".join([f"{src} AS {alias}" for src, alias in ORG_LIST_COLUMNS])
            cursor.execute(f"SELECT {cols} FROM {ORG_TABLE} ORDER BY organization_name ASC")

        rows = cursor.fetchall() or []

        members: List[Dict[str, Any]] = []
        for r in rows:
            members.append(
                {
                    "id": _coerce_str(r.get("id")),
                    "name": _coerce_str(r.get("name")),
                    "email": _coerce_str(r.get("email")),
                    "phone": _coerce_str(r.get("phone")),
                    "joined": _coerce_str(r.get("registration_date")),
                }
            )

    finally:
        conn.close()

    pdf_buffer = _generate_members_records_pdf(member_type, members)
    filename = f"AGL_Members_{member_type}.pdf"

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf",
    )


@admin_members_bp.route("/<member_type>/<member_id>/print-details", methods=["POST"])
@login_required
def print_member_details(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400

    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        if mt == "personal":
            cursor.execute(f"SELECT * FROM {PERSONAL_TABLE} WHERE id = %s", (member_id,))
        else:
            cursor.execute(f"SELECT * FROM {ORG_TABLE} WHERE id = %s", (member_id,))

        row = cursor.fetchone()
        if not row:
            return jsonify({"success": False, "message": "Member not found"}), 404

        member = {k: _coerce_str(v) for k, v in row.items()}
    finally:
        conn.close()

    pdf_buffer = _generate_member_details_pdf(mt, member)
    safe_name = (member.get("name") or member.get("organization_name") or "member").replace(" ", "_")
    filename = f"AGL_{mt}_Member_{safe_name}_{member_id}.pdf"

    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf",
    )

