"""Admin members (personal + organization) listing/details + PDF exports."""

import os
import logging
from io import BytesIO
from typing import Any, Dict, List, Tuple

import mysql.connector
from flask import Blueprint, jsonify, request, send_file, abort, make_response




from fpdf import FPDF
from login.decorators import login_required

# --- PDF styling helpers (modern bluish theme) ---

# Fields to omit from “Member Details” PDF
OMIT_DETAIL_FIELDS = {
    # Database field names to omit from the “Member Details” PDF
    "password",
    "PaymentNumber",
    "payment_Number",
    "Payment Code",
    "payment_code",
    "Payment_Date",
    "payment_date",
    "Completion Letter",
    "completion_letter",
}




def _get_agl_logo_path() -> str:
    current_dir = os.path.dirname(os.path.abspath(__file__))

    logo_path = os.path.normpath(
        os.path.join(current_dir, "..", "..", "..", "assets", "AGL.png")
    )

    if os.path.isfile(logo_path):
        return logo_path

    raise FileNotFoundError(f"AGL logo not found: {logo_path}")

def _pdf_header(pdf: FPDF, title: str):
    pdf.set_auto_page_break(auto=False)

    page_width = 210  # A4 width
    left_margin = 10
    top = 8
    header_h = 30

    # Colors
    dark_blue = (8, 61, 119)
    primary_blue = (13, 110, 253)
    light_blue = (182, 211, 245)

    # -----------------------------
    # Split Header Background
    # -----------------------------

    # Left section (logo area)
    pdf.set_fill_color(*light_blue)
    pdf.rect(0, top, 65, header_h, "F")

    # Right section (title area)
    pdf.set_fill_color(*primary_blue)
    pdf.rect(65, top, page_width - 65, header_h, "F")

    # Bottom dark blue strip
    pdf.set_fill_color(*dark_blue)
    pdf.rect(0, top + header_h, page_width, 2, "F")

    # -----------------------------
    # Logo
    # -----------------------------
    logo_w = 48
    logo_h = 15

    try:
        logo_path = _get_agl_logo_path()

        pdf.image(
            logo_path,
            18,
            top + 2,
            logo_w,
            logo_h
        )

    except Exception:
        pass

    # -----------------------------
    # Header Text
    # -----------------------------
    pdf.set_text_color(255, 255, 255)

    # Main Title
    pdf.set_font("Arial", "B", 14)
    pdf.set_xy(72, top + 8)
    pdf.cell(
        120,
        7,
        "Association of Government Librarians",
        0,
        1,
        "R"
    )

    # Subtitle
    if title:
        pdf.set_font("Arial", "", 10)
        pdf.set_xy(72, top + 17)
        pdf.cell(
            120,
            6,
            title,
            0,
            1,
            "R"
        )

    # Reset styles
    pdf.set_text_color(0, 0, 0)

    # Space after header
    pdf.set_y(top + header_h + 8)

def _pdf_footer(pdf: FPDF):
    # Place footer near bottom; support multi-page by drawing every page
    pdf.set_y(-14)
    pdf.set_draw_color(13, 110, 253)
    pdf.set_line_width(0.4)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())

    pdf.set_font("Arial", "I", 9)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 6, "Association of Government Librarians", 0, 0, "C")


def _pdf_table_header(pdf: FPDF, col_xs: List[float], labels: List[str]):
    pdf.set_fill_color(13, 110, 253)
    pdf.set_text_color(255, 255, 255)

    pdf.set_draw_color(220, 230, 245)
    pdf.set_line_width(0.4)

    pdf.set_font("Arial", "B", 11)

    y = pdf.get_y()
    height = 10

    for i, label in enumerate(labels):
        x = col_xs[i]
        w = col_xs[i + 1] - col_xs[i]

        pdf.set_xy(x, y)
        pdf.cell(w, height, label, border=1, ln=0, align="C", fill=True)

    pdf.ln(height)

    # Reset text color
    pdf.set_text_color(0, 0, 0)


def _pdf_table_row(pdf: FPDF, col_xs: List[float], values: List[str], fill=False):
    pdf.set_font("Arial", "", 10)

    if fill:
        pdf.set_fill_color(245, 249, 255)
    else:
        pdf.set_fill_color(255, 255, 255)

    pdf.set_draw_color(225, 230, 240)
    pdf.set_line_width(0.3)

    y_start = pdf.get_y()

    heights = []

    for i, v in enumerate(values):
        w = col_xs[i + 1] - col_xs[i]

        max_chars = max(int(w * 2), 12)
        lines = max(1, (len(v) // max_chars) + 1)

        heights.append(lines)

    row_height = max(10, min(18, 8 + (max(heights) - 1) * 4))

    for i, v in enumerate(values):
        x = col_xs[i]
        w = col_xs[i + 1] - col_xs[i]

        pdf.set_xy(x, y_start)

        pdf.multi_cell(
            w,
            row_height / max(heights),
            v,
            border=1,
            align="L",
            fill=fill
        )

        pdf.set_xy(x + w, y_start)

    pdf.set_y(y_start + row_height)


def _coerce_pdf_text(value: Any, max_len: int | None = None) -> str:
    if value is None:
        return ""
    s = str(value)
    if max_len is not None:
        s = s[:max_len]
    return s


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
    pdf.set_margins(10, 10, 10)
    pdf.add_page()

    _pdf_header(pdf, f"Members Records - {member_type.title()}")

    # Table: # | Name | Email | Phone
    col_xs = [10, 25, 90, 155, 200]
    labels = ["#", "Name", "Email", "Phone"]

    _pdf_table_header(pdf, col_xs, labels)

    for idx, m in enumerate(members, start=1):
        if pdf.get_y() > 270:  # near bottom
            pdf.add_page()
            _pdf_header(pdf, f"Members Records - {member_type.title()}")
            _pdf_table_header(pdf, col_xs, labels)

        values = [
            _coerce_pdf_text(str(idx)),
            _coerce_pdf_text(_coerce_str(m.get("name")), max_len=60),
            _coerce_pdf_text(_coerce_str(m.get("email")), max_len=55),
            _coerce_pdf_text(_coerce_str(m.get("phone")), max_len=30),
        ]
        _pdf_table_row(pdf, col_xs, values, fill=(idx % 2 == 0))

    _pdf_footer(pdf)

    pdf_buffer = BytesIO()
    pdf_bytes = pdf.output(dest="S").encode("latin-1")
    pdf_buffer.write(pdf_bytes)
    pdf_buffer.seek(0)
    return pdf_buffer



def _generate_member_details_pdf(member_type: str, member: Dict[str, str]):
    pdf = FPDF("P", "mm", "A4")
    pdf.set_margins(10, 10, 10)
    pdf.add_page()

    name = member.get("name") or member.get("organization_name") or "Member"

    _pdf_header(pdf, "Member Information")

    pdf.set_font("Arial", "B", 12)
    pdf.set_y(pdf.get_y() + 6)
    pdf.cell(0, 8, f"{member_type.title()} - {name}", 0, 1)
    pdf.ln(2)

    # Omit sensitive/unwanted fields
    kv_items: List[Tuple[str, str]] = []
    for k, v in member.items():
        if k == "member_type":
            continue
        if k in OMIT_DETAIL_FIELDS:
            continue
        kv_items.append((k, v))

    kv_items.sort(key=lambda x: x[0])

    # Render as a 2-column table-like block for consistency
    # Use our reusable row layout for nicer typography
    pdf.set_font("Arial", "B", 10)
    pdf.cell(0, 7, "Details", 0, 1)
    pdf.ln(1)

    # Key/value rows (borders + alignment)
    # 50%/50% columns with left alignment
    col_xs = [10, 105, 200]
    # approximate width: value column will wrap
    # header
    _pdf_table_header(pdf, [10, 105, 200], ["Field", "Value"])

    def _draw_kv_rows(pairs: List[Tuple[str, str]]):
        for k, v in pairs:
            field = str(k).replace("_", " ").title() + ":"
            value = v if v is not None and str(v).strip() else "-"
            _pdf_table_row(pdf, [10, 105, 200], [field, str(value)])

    _draw_kv_rows(kv_items)

    # If the table pushes content below footer area, footer still draws but table may overlap.
    # Keep styling consistent by drawing footer at the end.
    _pdf_footer(pdf)


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


def _resolve_uploaded_file(upload_subdir: str, path_value: str) -> str:
    # path_value may already be a stored relative path like: uploads/passports/xxx.jpg
    cleaned = (path_value or "").replace("\\", "/")
    if not cleaned:
        raise FileNotFoundError("Empty path")

    # Keep only the filename portion (defense-in-depth)
    filename = cleaned.split("/")[-1]

    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    # uploads_dir is .../backend/uploads
    file_path = os.path.join(uploads_dir, upload_subdir, filename)

    if not os.path.isfile(file_path):
        raise FileNotFoundError(file_path)

    return file_path


def _guess_mime(filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    return {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "webp": "image/webp",
        "pdf": "application/pdf",
    }.get(ext, "application/octet-stream")


@admin_members_bp.route("/<member_type>/<member_id>/completion-letter", methods=["POST"])
@login_required
def completion_letter_file(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400

    data = request.get_json(silent=True) or {}
    path_value = data.get("path") or ""
    if not path_value:
        return jsonify({"success": False, "message": "Missing completion letter path"}), 400

    try:
        file_path = _resolve_uploaded_file("completion_letters", path_value)
        filename = os.path.basename(file_path)
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype="application/pdf",
        )
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"}), 404


@admin_members_bp.route("/<member_type>/<member_id>/passport-image", methods=["GET"])
@login_required
def passport_image(member_type: str, member_id: str):
    mt = (member_type or "").strip().lower()
    if mt not in ["personal", "organization"]:
        return jsonify({"success": False, "message": "Invalid member_type"}), 400

    path_value = request.args.get("path") or ""
    if not path_value:
        return jsonify({"success": False, "message": "Missing passport image path"}), 400

    try:
        file_path = _resolve_uploaded_file("passports", path_value)
        filename = os.path.basename(file_path)
        mimetype = _guess_mime(filename)
        return send_file(file_path, mimetype=mimetype)
    except FileNotFoundError:
        return jsonify({"success": False, "message": "File not found"}), 404



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

