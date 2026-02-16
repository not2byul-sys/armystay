
import json

file_path = 'public/concert_recommendations.json'

with open(file_path, 'r') as f:
    data = json.load(f)

if 'top_recommendations' in data:
    original_list = data['top_recommendations']
    seen_names = set()
    unique_list = []
    
    for item in original_list:
        name = item.get('name_en') or item.get('name')
        if name and name not in seen_names:
            seen_names.add(name)
            unique_list.append(item)
    
    print(f"Original count: {len(original_list)}")
    print(f"Unique count: {len(unique_list)}")
    print(f"Removed: {len(original_list) - len(unique_list)}")
    
    data['top_recommendations'] = unique_list

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("Successfully deduplicated and saved.")
else:
    print("top_recommendations key not found.")
