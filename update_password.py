import mysql.connector

# Connect to the database
conn = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="locagldatabase"
)

cursor = conn.cursor()

# Update the password for admin1
new_hash = '$2b$12$1gWHn0.xQTRIxRsfZOGCBeAalFbqYOQVqkFgCQL7UotrijkvGrEhi'
cursor.execute("UPDATE personalmembership SET password = %s WHERE id = 'admin1'", (new_hash,))

conn.commit()
print(f"Updated {cursor.rowcount} row(s)")

# Verify the update
cursor.execute("SELECT id, email, password FROM personalmembership WHERE id = 'admin1'")
result = cursor.fetchone()
print(f"Updated record: {result}")

cursor.close()
conn.close()

