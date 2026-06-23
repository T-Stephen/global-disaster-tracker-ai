from app.db import sync_to_db

# Creating a fake disaster event
mock_data = [
    {
        "id": "FYP_TEST_001",
        "title": "AI Simulation - Test Wildfire",
        "category": "Wildfires",
        "lat": 34.0522,
        "lon": -118.2437,
        "source": "TEST_SYSTEM",
        "magnitude": 0,
        "risk_score": 99,
        "risk_label": "Critical"
    }
]

print("Testing MongoDB Connection...")

try:
    # Attempting to save to the database
    sync_to_db(mock_data)
    print("✅ Database connection is PERFECT!")
except Exception as e:
    print(f"❌ Database error: {e}")