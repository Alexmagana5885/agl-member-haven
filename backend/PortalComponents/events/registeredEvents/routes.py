"""Registered Events routes - Get user-specific events from event_registrations table."""
import os
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
    try:
        email = request.args.get('email')
        event_id = request.args.get('event_id')
        
        if not email or not event_id:
            return jsonify({
                "success": False,
                "message": "Email and event_id parameters are required"
            }), 400
        
        conn = get_db_connection()
        
        # Get event registration data
        event_query = """
            SELECT er.event_name, er.event_date, er.event_location, er.member_name, er.member_email,
                   er.invitation_card, er.contact, er.payment_code, er.registration_date
            FROM event_registrations er
            WHERE er.member_email = %s AND er.event_id = %s
        """
        event_data = query_one(conn, event_query, (email, event_id))
        if not event_data:
            conn.close()
            return jsonify({
                "success": False,
                "message": "Event registration not found"
            }), 404
        
        # Check personal membership
        personal_query = """
            SELECT name, phone, home_address, highest_degree, institution, graduation_year, 
                   profession, experience, current_company, position, work_address 
            FROM personalmembership 
            WHERE email = %s
        """
        personal_data = query_one(conn, personal_query, (email,))
        
        # Check organization membership
        org_query = """
            SELECT organization_name, contact_person, contact_phone_number, organization_address, 
                   location_country, location_county, location_town, organization_type, what_you_do 
            FROM organizationmembership 
            WHERE organization_email = %s
        """
        org_data = query_one(conn, org_query, (email,))
        
        # Member status
        status_query = "SELECT position FROM officialsmembers WHERE personalmembership_email = %s"
        status_data = query_one(conn, status_query, (email,))
        member_status = status_data['position'] if status_data else 'Member'
        
        conn.close()
        
        if not personal_data and not org_data:
            return jsonify({
                "success": False,
                "message": "User data not found"
            }), 404
        
        # Generate QR code with proper content
        if personal_data:
            content = f"Name: {personal_data['name']}\n" \
                     f"Phone: {personal_data['phone']}\n" \
                     f"Address: {personal_data['home_address']}\n" \
                     f"Degree: {personal_data['highest_degree']}\n" \
                     f"Institution: {personal_data['institution']}\n" \
                     f"Graduation Year: {personal_data['graduation_year']}\n" \
                     f"Profession: {personal_data['profession']}\n" \
                     f"Experience: {personal_data['experience']}\n" \
                     f"Current Company: {personal_data['current_company']}\n" \
                     f"Position: {personal_data['position']}\n" \
                     f"Work Address: {personal_data['work_address']}"
        elif org_data:
            content = f"Organization Name: {org_data['organization_name']}\n" \
                     f"Contact Person: {org_data['contact_person']}\n" \
                     f"Phone: {org_data['contact_phone_number']}\n" \
                     f"Address: {org_data['organization_address']}\n" \
                     f"Country: {org_data['location_country']}\n" \
                     f"County: {org_data['location_county']}\n" \
                     f"Town: {org_data['location_town']}\n" \
                     f"Organization Type: {org_data['organization_type']}\n" \
                     f"What You Do: {org_data['what_you_do']}"
        
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=4, border=4)
        qr.add_data(content)
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
        page_width = pdf.w
        if os.path.exists(logo_path):
            header_image_width = 35
            header_image_x = (page_width - header_image_width) / 2
            pdf.image(logo_path, header_image_x, 5, header_image_width)
        
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
        filename = f"{sanitized_event_name}_{email}.pdf"
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.exception("Error generating event card")
        return jsonify({
            "success": False,
            "message": "Error generating event card"
        }), 500

