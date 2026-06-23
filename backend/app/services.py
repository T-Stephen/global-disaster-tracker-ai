import requests
import concurrent.futures

def fetch_nasa_data():
    try:
        url = "https://eonet.gsfc.nasa.gov/api/v3/events"
        params = {"status": "open", "limit": 20}
        resp = requests.get(url, params=params, timeout=5)
        resp.raise_for_status()
        
        events = []
        for e in resp.json().get('events', []):
            if e.get('geometry'):
                # Flip coordinates to [Lat, Lon]
                coords = e['geometry'][-1]['coordinates']
                events.append({
                    "id": e['id'],
                    "title": e['title'],
                    "category": e['categories'][0]['title'],
                    "lat": coords[1], 
                    "lon": coords[0],
                    "source": "NASA",
                    "magnitude": 0
                })
        return events
    except Exception as e:
        print(f"NASA Error: {e}")
        return []

def fetch_usgs_data():
    try:
        url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        
        events = []
        for f in resp.json().get('features', []):
            coords = f['geometry']['coordinates']
            events.append({
                "id": f['id'],
                "title": f['properties']['place'],
                "category": "Earthquake",
                "lat": coords[1],
                "lon": coords[0],
                "source": "USGS",
                "magnitude": f['properties']['mag']
            })
        return events
    except Exception as e:
        print(f"USGS Error: {e}")
        return []

def get_disaster_data():
    # Fetch both APIs at the same time (Professional Speed)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_nasa = executor.submit(fetch_nasa_data)
        future_usgs = executor.submit(fetch_usgs_data)
        return future_nasa.result() + future_usgs.result()