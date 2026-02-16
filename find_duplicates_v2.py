
import json

with open('public/concert_recommendations.json', 'r') as f:
    data = json.load(f)

def check_dupes(list_name, items):
    if not items:
        print(f"[{list_name}] is empty or missing.")
        return
    
    names = {}
    duplicates = []
    
    for i, h in enumerate(items):
        name = h.get('name_en') or h.get('name')
        if name:
            if name in names:
                duplicates.append((name, names[name], i))
            else:
                names[name] = i
    
    print(f"[{list_name}] Found {len(duplicates)} duplicates.")
    for name, idx1, idx2 in duplicates:
        print(f"  - {name} (Indices: {idx1}, {idx2})")

check_dupes('top_recommendations', data.get('top_recommendations', []))
check_dupes('hotels', data.get('hotels', []))
