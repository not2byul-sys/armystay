import json

# Manual updates for Seoul (Gwanghwamun) - Using SAFE Unsplash URLs to avoid hotlink blocks
image_updates = {
    # Four Seasons: Luxury modern hotel style (Representative)
    "Four Seasons Hotel Seoul": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    
    # Somerset Palace: Residence style (Representative)
    "Somerset Palace Seoul": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    
    # Shilla Stay Gwanghwamun: Modern brick/grey style (Representative)
    "Shilla Stay Gwanghwamun": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    
    # Nine Tree: Replaced broken Agoda URL with Safe Unsplash URL
    "Nine Tree Premier Hotel": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    "Nine Tree Premier Hotel Insadong": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    "Nine Tree by Parnas Seoul Insadong": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"
}

file_path = 'public/concert_recommendations.json'

with open(file_path, 'r') as f:
    data = json.load(f)

updated_count = 0

def update_hotel_list(hotel_list):
    global updated_count
    for hotel in hotel_list:
        name = hotel.get('name_en')
        if name in image_updates:
            # Check if it's currently a placeholder or low quality or BROKEN
            current_img = hotel.get('image_url', '')
            new_img = image_updates[name]
            
            if current_img != new_img:
                print(f"Updating {name}:")
                print(f"  Old: {current_img}")
                print(f"  New: {new_img}")
                hotel['image_url'] = new_img
                updated_count += 1
            
            # Also update "top_recommendations" specifically if matched
            
# Update Top Recommendations
print("--- Checking Top Recommendations ---")
update_hotel_list(data.get('top_recommendations', []))

# Update Full List (nearby of top recs and main hotels list)
print("\n--- Checking Full List ---")

# 1. Nearby hotels inside top_recommendations
for top_hotel in data.get('top_recommendations', []):
    if 'nearby' in top_hotel:
        update_hotel_list(top_hotel['nearby'])

# 2. Main hotels list
if 'hotels' in data:
    update_hotel_list(data['hotels'])

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nTotal Seoul hotel images updated: {updated_count}")
