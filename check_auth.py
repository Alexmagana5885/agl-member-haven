import mysql.connector

conn = mysql.connector.connect(host='127.0.0.1', user='root', password='')
cursor = conn.cursor()
cursor.execute('SELECT user, host, plugin FROM mysql.user WHERE user="root"')
print(cursor.fetchall())
cursor.close()
conn.close()

