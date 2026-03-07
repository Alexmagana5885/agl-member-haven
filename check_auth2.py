import mysql.connector

conn = mysql.connector.connect(host='127.0.0.1', user='root', password='')
cursor = conn.cursor()
cursor.execute('SELECT @@default_authentication_plugin')
print('Default auth plugin:', cursor.fetchone())
cursor.close()
conn.close()

