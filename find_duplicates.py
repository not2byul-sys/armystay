
import json

with open('public/concert_recommendations.json', 'r') as f:
    data = json.load(f)

hotels = data.get('top_recommendations', []) + data.get('hotels', []) + (data if isinstance(data, list) else [])

names = {}
duplicates = []

for i, h in enumerate(hotels):
    name = h.get('name_en') or h.get('name')
    if name:
        if name in names:
            duplicates.append((name, names[name], i))
        else:
            names[name] = i

print(f"Found {len(duplicates)} duplicates.")
for name, idx1, idx2 in duplicates:
    print(f"Duplicate: {name} (Indices: {idx1}, {idx2})")
