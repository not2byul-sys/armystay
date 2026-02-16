
import json

try:
    with open('public/concert_recommendations.json', 'r') as f:
        data = json.load(f)

    items = data.get('top_recommendations', [])
    print(f"Total items in JSON: {len(items)}")

    city_counts = {}
    goyang_items = []
    gwanghwamun_candidates = []

    for item in items:
        # Mimic simple detection
        city = item.get('city')
        city_key = item.get('city_key')
        
        # Count by explicit city field
        if city:
            city_counts[city] = city_counts.get(city, 0) + 1
        
        # Check Goyang
        if city == 'goyang' or city_key == 'goyang':
            goyang_items.append(item['name_en'])

        # Check for Gwanghwamun hotels (known names)
        name = item.get('name_en', '').lower()
        if 'four seasons' in name or 'shilla stay gwanghwamun' in name or 'somerset' in name:
            gwanghwamun_candidates.append({
                'name': item['name_en'],
                'city': city,
                'city_key': city_key,
                'location': item.get('location')
            })

    print("\n--- City Counts (Raw 'city' field) ---")
    for city, count in city_counts.items():
        print(f"{city}: {count}")

    print(f"\nTotal Goyang found (city or city_key = 'goyang'): {len(goyang_items)}")
    # print(f"Goyang names (first 10): {goyang_items[:10]}")

    print("\n--- Gwanghwamun Candidates Data ---")
    for c in gwanghwamun_candidates:
        print(c)

except Exception as e:
    print(f"Error: {e}")
