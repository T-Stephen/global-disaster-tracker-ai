def calculate_risk(events):
    """
    Professional AI Logic: Analyzes a list of disasters and adds a risk score.
    """
    if not events:
        return []
        
    for event in events:
        base_score = 50  # Start in the middle
        
        # 1. Intensity Logic (Looking for magnitude/brightness)
        magnitude = 0
        if 'geometry' in event and len(event['geometry']) > 0:
            magnitude = event['geometry'][0].get('magnitudeValue', 0)
            
        if magnitude and magnitude > 350:
            base_score += 20
            
        # 2. Category Weighting
        category = ""
        if 'categories' in event and len(event['categories']) > 0:
            category = event['categories'][0].get('title', "")
            
        weights = {
            "Wildfires": 15,
            "Severe Storms": 10,
            "Volcanoes": 25,
            "Sea and Lake Ice": -20 # Low immediate risk to humans
        }
        
        base_score += weights.get(category, 0)
        
        # Ensure score stays between 1 and 100
        final_score = max(1, min(100, base_score))
        
        # Assign a Level
        if final_score > 75: 
            level = "EXTREME"
        elif final_score > 40: 
            level = "MODERATE"
        else: 
            level = "LOW"
            
        # Attach the AI analysis to the event data
        event['risk_score'] = final_score
        event['risk_level'] = level
        
    return events