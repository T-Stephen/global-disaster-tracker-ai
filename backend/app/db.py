from pymongo import MongoClient, UpdateOne
import os
from dotenv import load_dotenv

# Load the secret connection string from the .env file
load_dotenv()

# Connect to MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Create the Data Lake and Collection
db = client["disaster_ai_lake"]
collection = db["historical_events"]

def sync_to_db(analyzed_events):
    """Saves new events to the database automatically."""
    if not analyzed_events:
        return
    
    operations = []
    for event in analyzed_events:
        # If disaster exists, update it. If new, insert it.
        op = UpdateOne(
            {"id": event["id"]}, 
            {"$set": event}, 
            upsert=True
        )
        operations.append(op)
    
    if operations:
        collection.bulk_write(operations)
        print(f"🚀 Synced {len(operations)} events to MongoDB Atlas Data Lake.")