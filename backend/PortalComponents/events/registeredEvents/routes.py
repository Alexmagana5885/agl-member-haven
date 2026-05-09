"""Registered Events routes - Get user-specific events from event_registrations table."""
import os
import sys
import logging
from flask import Blueprint, jsonify, request, send_file
import mysql.connector
from fpdf import FPDF
import qrcode
import tempfile
from io import BytesIO

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create Blueprint - PUBLIC endpoint for members
registered_events_bp = Blueprint('registered_events', __name__)

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
        return conn
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")
        raise

def query_one(conn, query, params):
    """Execute query and return single row as dict, consumes all results."""
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params)
    row = cursor.fetchone()
    cursor.fetchall()  # Consume any remaining
    cursor.close()
    return row

@registered_events_bp.route('/registered', methods=['GET'])
def get_user_registered_events():
    """
    Get registered events for specific user email.
    
    Query Param: email (required)
    
    Returns:
        JSON response with list of user's registered events
    """
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({
                "success": False,
                "message": "Email parameter is required"
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, event_id, event_name, event_location, event_date, 
                   member_name, contact, registration_date, payment_code, invitation_card
            FROM event_registrations 
            WHERE member_email = %s 
            ORDER BY registration_date DESC
        """, (email,))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert datetime/date objects to strings
        for result in results:
            if result.get('event_date'):
                result['event_date'] = str(result['event_date'])
            if result.get('registration_date'):
                result['registration_date'] = str(result['registration_date'])
        
        return jsonify({
            "success": True,
            "events": results
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching registered events: {str(e)}")
        return jsonify({
            "success": False,
            "message": "Error fetching registered events"
        }), 500


@registered_events_bp.route('/registered/download-card', methods=['GET'])
def download_event_card():
    """
    Generate and download event card PDF for a registered event.
    
    Query Params: email (required), event_id (required)
    
    Returns:
        PDF file download
    """
    # Get parameters
    email = request.args.get('email')
    event_id = request.args.get('event_id')
    
    if not email or not event_id:
        return jsonify({
            "success": False,
            "message": "Missing email or event_id parameter"
        }), 400
    
    # Query real data from database
    conn = get_db_connection()
    query = """
        SELECT event_name, event_location, event_date, member_name, payment_code 
        FROM event_registrations 
        WHERE member_email = %s AND event_id = %s
    """
    row = query_one(conn, query, (email, int(event_id)))
    
    if not row:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Event registration not found"
        }), 404
    
    # Fetch member details from personal or organization membership
    member_query = """
        SELECT name, email, phone, profession, current_company, position, work_address, 'personal' as member_type
        FROM personalmembership 
        WHERE email = %s
        UNION
        SELECT organization_name as name, organization_email as email, contact_phone_number as phone, 
               what_you_do as profession, organization_type as current_company, contact_person as position, 
               CONCAT_WS(', ', organization_address, location_town, location_county, location_country) as work_address, 
               'organization' as member_type
        FROM organizationmembership 
        WHERE organization_email = %s
    """
    member_row = query_one(conn, member_query, (email, email))
    conn.close()
    
    if not member_row:
        return jsonify({
            "success": False,
            "message": "Member details not found"
        }), 404
    
    event_data = {
        'event_name': row.get('event_name', 'Unnamed Event'),
        'event_date': str(row.get('event_date', '')),
        'event_location': row.get('event_location', 'Location TBD'),
        'member_name': row.get('member_name', 'Member')
    }
    member_status = 'Member'
    
    # Create QR content with full member data
    qr_content = f"""
Name: {member_row.get('name', '')}
Email: {member_row.get('email', '')}
Phone: {member_row.get('phone', '')}
Profession: {member_row.get('profession', '')}
Company: {member_row.get('current_company', '')}
Position: {member_row.get('position', '')}
Work Address: {member_row.get('work_address', '')}
Member Type: {member_row.get('member_type', '')}
Event: {event_data['event_name']}
Event Date: {event_data['event_date']}
Event Location: {event_data['event_location']}
Payment Code: {row.get('payment_code', '')}
    """.strip()
    
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=4, border=4)
    qr.add_data(qr_content)
    qr.make(fit=True)
    qr_img = qr.make_image(fill='black', back_color='white')
    
    # Save QR code to temporary file
    temp_qr_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    temp_qr_path = temp_qr_file.name
    temp_qr_file.close()
    qr_img.save(temp_qr_path, format='PNG')
    
    # Create PDF with exact styling from PHP code
    pdf = FPDF('P', 'mm', [100, 150])
    pdf.add_page()
    
    # Background color
    pdf.set_fill_color(195, 198, 214)
    pdf.rect(0, 0, 100, 150, 'F')
    
    # Logo
    logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'AGLlogo.png'))
    logger.info(f"Event card request: email={email}, event_id={event_id}")
    logger.info(f"DB row found: {bool(row)}")
    if row:
        logger.info(f"Event data: {dict(row)}")
    print(f"DEBUG: Logo path: {logo_path}")
    print(f"DEBUG: Logo exists: {os.path.exists(logo_path)}")
    page_width = pdf.w
    header_image_width = 35
    header_image_x = (page_width - header_image_width) / 2
    try:
        pdf.image(logo_path, header_image_x, 10, header_image_width)
        print("DEBUG: Logo loaded successfully")
    except Exception as e:
        print(f"DEBUG: Error loading logo: {e}")
        # Fallback: draw text instead
        pdf.set_font('Arial', 'B', 16)
        pdf.set_xy(header_image_x, 10)
        pdf.cell(header_image_width, 10, 'AGL', 0, 1, 'C')
    
    # Header text
    pdf.set_font('Arial', 'B', 12)
    pdf.set_xy(0, 25)
    pdf.cell(0, 3, 'Association of Government Librarians', 0, 1, 'R')
    pdf.ln(5)
    
    # Blue line below header
    pdf.set_draw_color(0, 0, 255)
    pdf.set_line_width(0.5)
    pdf.line(5, 40, 95, 40)
    
    # Space after header
    pdf.ln(10)
    
    # Event name
    pdf.set_font('Arial', 'B', 8)
    pdf.cell(0, 1, event_data['event_name'], 0, 2, 'C')
    pdf.ln(1)
    
    # Member name
    pdf.set_font('Arial', '', 10)
    pdf.cell(0, 8, event_data['member_name'], 0, 1, 'C')
    
    # Space before QR code
    pdf.ln(5)
    
    # QR code
    if os.path.exists(temp_qr_path):
        qr_code_width = 35
        x_position = (page_width - qr_code_width) / 2
        pdf.image(temp_qr_path, x_position, 55, qr_code_width)
        pdf.ln(10)
    
    # Blue line below QR code
    pdf.ln(20)
    pdf.set_draw_color(0, 0, 255)
    pdf.set_line_width(0.5)
    pdf.line(5, pdf.get_y() + 5, 95, pdf.get_y() + 5)
    
    # Location and date
    cell_height = 5
    pdf.set_font('Arial', '', 9)
    pdf.set_xy(5, pdf.get_y() + 10)
    pdf.cell(90, cell_height, event_data['event_location'] or '', 0, 1, 'L')
    pdf.set_xy(page_width - 95, pdf.get_y() - 5)
    pdf.cell(90, cell_height, str(event_data['event_date']), 0, 1, 'R')
    
    # Sky blue background for status
    pdf.set_fill_color(135, 206, 250)
    pdf.rect(0, pdf.get_y() + 10, 100, 20, 'F')
    
    # Member status
    pdf.set_xy(0, pdf.get_y() + 10)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, member_status, 0, 1, 'C')
    
    # Website link
    pdf.set_font('Arial', 'I', 7)
    pdf.cell(0, 5, 'https://www.agl.or.ke/', 0, 1, 'C')
    
    # Clean up temp file
    try:
        os.remove(temp_qr_path)
    except OSError:
        pass
    
    # Output PDF
    pdf_buffer = BytesIO()
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    pdf_buffer.write(pdf_bytes)
    pdf_buffer.seek(0)
    
    # Sanitize filename
    sanitized_event_name = ''.join(c for c in event_data['event_name'] if c.isalnum() or c in (' ', '-', '_')).rstrip().replace(' ', '_')
    filename = f"{sanitized_event_name}_{event_id}.pdf"
    
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )

