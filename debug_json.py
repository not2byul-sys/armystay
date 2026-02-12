import json

try:
    with open("korean_ota_hotels.json", "r", encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"Top-level keys: {list(data.keys())}")
    
    if 'hotels' in data:
        print(f"Top-level 'hotels' count: {len(data['hotels'])}")
        
    if 'map' in data and 'hotels' in data['map']:
        print(f"Map 'hotels' count: {len(data['map']['hotels'])}")
        
    # Check if gw hotels are in top level
    if 'hotels' in data:
        gw_count = sum(1 for h in data['hotels'] if 'gw' in str(h.get('id', '')))
        print(f"GW hotels in top-level: {gw_count}")
        
    # Check if gw hotels are in map level
    if 'map' in data and 'hotels' in data['map']:
        gw_count = sum(1 for h in data['map']['hotels'] if 'gw' in str(h.get('id', '')))
        print(f"GW hotels in map-level: {gw_count}")

except Exception as e:
    print(f"Error: {e}")
