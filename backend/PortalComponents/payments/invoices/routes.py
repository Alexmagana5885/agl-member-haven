from flask import Blueprint, jsonify, session, g
import mysql.connector
def get_db_connection():
    from app import get_db_connection
    return get_db_connection()
from login.decorators import login_required

invoices_bp = Blueprint('invoices', __name__, url_prefix='/api/invoices')

@login_required
def get_my_invoices():
    user_email = session.get('user_email')
    if not user_email:
        return jsonify({"status": "error", "message": "User not authenticated"}), 401
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT id, payment_description as description, 
               amount_billed, amount_paid, user_email, invoice_date,
               CASE WHEN amount_billed = amount_paid THEN 'Paid' ELSE 'Pending' END as status
        FROM invoices 
        WHERE user_email = %s 
        ORDER BY invoice_date DESC
        """
        cursor.execute(query, (user_email,))
        invoices = cursor.fetchall()
        
        # Format dates
        for invoice in invoices:
            invoice['date'] = invoice['invoice_date'].strftime('%d %b %Y')
            invoice['amount'] = f"KES {invoice['amount_paid']:,}"
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "status": "success", 
            "invoices": invoices
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

invoices_bp.route('/my-invoices', methods=['GET'])(get_my_invoices)

