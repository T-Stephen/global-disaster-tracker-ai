from flask import Blueprint, jsonify
from .services import get_disaster_data
from .ai_engine import calculate_risk
from .db import sync_to_db  # <-- This imports your new database file

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/disasters', methods=['GET'])
def get_disasters():
    # 1. Fetch Live Data
    raw_data = get_disaster_data()
    
    # 2. Process with AI Risk Engine
    analyzed_data = calculate_risk(raw_data)
    
    # 3. Save to MongoDB Data Lake
    try:
        sync_to_db(analyzed_data)
    except Exception as e:
        print(f"Database sync failed: {e}")
    
    # 4. Return to React Frontend
    return jsonify({
        "status": "success",
        "count": len(analyzed_data),
        "data": analyzed_data
    })