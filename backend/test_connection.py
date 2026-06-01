import pg8000

try:
    conn = pg8000.connect(
        host="localhost",
        port=5000,
        user="postgres",
        password="postgres",
        database="event_booking"
    )

    cursor = conn.cursor()

    cursor.execute("SELECT current_database();")
    print("Database:", cursor.fetchone()[0])

    cursor.execute("SELECT version();")
    print("Version:", cursor.fetchone()[0])

    conn.close()

    print("\n[SUCCESS] Connection successful!")

except Exception as e:
    print("\n[ERROR]")
    print(type(e).__name__)
    print(e)