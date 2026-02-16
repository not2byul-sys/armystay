
import json

file_path = 'public/concert_recommendations.json'

with open(file_path, 'r') as f:
    data = json.load(f)

items = data.get('top_recommendations', [])
updated_count = 0

for item in items:
    if not item.get('city'):
        city_key = item.get('city_key', '').lower()
        
        if city_key == 'goyang':
            item['city'] = 'goyang'
        elif city_key == 'busan':
            item['city'] = 'busan'
        elif city_key == 'paju':
            item['city'] = 'paju'
        elif city_key in ['gwanghwamun', 'hongdae', 'seongsu', 'myeongdong']:
            item['city'] = 'seoul'
        # Default fallback if needed, but safer to leave blank if unknown
        
        updated_count += 1

print(f"Updated {updated_count} items with 'city' field.")

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
