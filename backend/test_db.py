import mysql.connector
import socket

print("Attempting connection...")

# Test basic TCP connectivity first
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex(('127.0.0.1', 3306))
    sock.close()
    print(f"TCP connection test: {'SUCCESS' if result == 0 else 'FAILED'}")
except Exception as e:
    print(f"TCP connection test error: {e}")

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="",
        database="locagldatabase",
        port=3306,
        connection_timeout=5
    )

    if conn.is_connected():
        print("Connected successfully!")
        conn.close()

except Exception as e:
    print("Error:", type(e).__name__, e)

