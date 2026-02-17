import json

# Manual updates for Busan
image_updates = {
    # Park Hyatt Busan: Luxury/Modern style (Representative)
    "Park Hyatt Busan": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    
    # Shilla Stay Haeundae: Using safe Unsplash URL (Residence/Clean style)
    "Shilla Stay Haeundae": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    
    # Brown Dot Hotel Sajik: Modern building style (Representative)
    "Brown Dot Hotel Sajik Baseball Stadium": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    "Brown Dot Hotel Sajik": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    
    # Lotte Hotel Busan: Luxury high-rise style (Representative)
    "Lotte Hotel Busan": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
}

file_path = 'public/concert_recommendations.json'

with open(file_path, 'r') as f:
    data = json.load(f)

updated_count = 0

def update_hotel_list(hotel_list):
    global updated_count
    for hotel in hotel_list:
        name = hotel.get('name_en')
        # Check partial match for Brown Dot if exact match fails? No, specific keys are better.
        if name in image_updates:
            current_img = hotel.get('image_url', '')
            new_img = image_updates[name]
            
            if current_img != new_img:
                print(f"Updating {name}:")
                print(f"  Old: {current_img}")
                print(f"  New: {new_img}")
                hotel['image_url'] = new_img
                updated_count += 1

# Update Top Recommendations
print("--- Checking Top Recommendations ---")
update_hotel_list(data.get('top_recommendations', []))

# Update Full List
print("\n--- Checking Full List ---")
for top_hotel in data.get('top_recommendations', []):
    if 'nearby' in top_hotel:
        update_hotel_list(top_hotel['nearby'])

if 'hotels' in data:
    update_hotel_list(data['hotels'])

with open(file_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\nTotal Busan hotel images updated: {updated_count}")
