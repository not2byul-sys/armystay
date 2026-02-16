import json
import math

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371  # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLng/2) * math.sin(dLng/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# Busan Asiad Main Stadium Coordinates
VENUE_LAT = 35.1900
VENUE_LNG = 129.0700
VENUE_NAME = "Busan Asiad Main Stadium"

# Load data
with open('public/concert_recommendations.json', 'r') as f:
    data = json.load(f)

# 1. Fix existing Busan hotels
for hotel in data['top_recommendations']:
    if hotel.get('city') == 'busan':
        # Calculate correct distance to Busan Asiad
        dist = calculate_distance(hotel['lat'], hotel['lng'], VENUE_LAT, VENUE_LNG)
        
        # Update distance object (optional, but good for consistency if we want relative to venue)
        # Actually, 'distance' in the root usually refers to from city center or venue. 
        # But 'safe_return' is explicitly from venue.
        
        # Estimate Taxi stuff
        # Base fare 4800, approx 1000 krw per km + time
        taxi_cost = 4800 + (dist * 1200) 
        time_min = 5 + (dist * 2.5) # Approx 2.5 min per km in city traffic
        
        hotel['safe_return'] = {
            "venue_en": VENUE_NAME,
            "route_en": f"Taxi from {VENUE_NAME} → Hotel",
            "transport": "taxi",
            "time_min": int(time_min),
            "last_train": "23:50",
            "taxi_krw": int(taxi_cost)
        }
        
        # Update map_detail venue
        if 'map_detail' in hotel:
            hotel['map_detail']['venue'] = {
                "name_en": VENUE_NAME,
                "lat": VENUE_LAT,
                "lng": VENUE_LNG
            }

# 2. Add New Hotels (Closer ones)
sajik_hotel = {
    "id": "hotel_busan_sajik_01",
    "name_en": "Brown Dot Hotel Sajik Baseball Stadium",
    "price_krw": 75000,
    "rating": 4.5,
    "image_url": "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800",
    "rooms_left": 8,
    "is_available": True,
    "hotel_type": {
        "label_en": "Boutique Hotel",
        "label_kr": "부띠끄 호텔",
        "color": "#FF69B4"
    },
    "cancellation": {
        "type": "free",
        "label_en": "Free Cancellation",
        "label_kr": "무료 취소",
        "is_refundable": True
    },
    "tags": {
        "list_en": ["#WalkingDistance", "#Budget"],
        "list_kr": ["#도보이동", "#가성비"],
        "display_en": "#WalkingDistance #Budget",
        "display_kr": "#도보이동 #가성비"
    },
    "lat": 35.1995, 
    "lng": 129.0650, # Approx Sajik
    "location": {
        "area_en": "Sajik (Near Venue)",
        "area_kr": "사직 (공연장 인근)",
        "address_en": "Sajik-dong, Dongnae-gu, Busan",
        "address_kr": "부산 동래구 사직동"
    },
    "city_key": "busan_sajik",
    "army_density": {
        "value": 95,
        "level_en": "High",
        "level_kr": "높음",
        "label_en": "ARMY 95%",
        "label_kr": "아미 95%"
    },
    "distance": {
        "type": "walk",
        "display_en": "Walk 12min",
        "minutes": 12,
        "distance_km": 1.2
    },
    "transport": {
         "station_en": "Sajik Station",
         "line_en": "Line 3",
         "line_color": "#D2691E",
         "display_en": "Sajik (Line 3)"
    },
    "safe_return": {
        "venue_en": VENUE_NAME,
        "route_en": "Walk from Venue",
        "transport": "walk",
        "time_min": 12,
        "last_train": "N/A",
        "taxi_krw": 0
    },
    "army_local_guide": {
         "bts": [],
         "restaurant": [],
         "cafe": [],
         "hotspot": []
    },
    "map_detail": {
        "hotel": { "name_en": "Brown Dot Hotel Sajik", "lat": 35.1995, "lng": 129.0650 },
        "venue": { "name_en": VENUE_NAME, "lat": VENUE_LAT, "lng": VENUE_LNG },
        "nearby_spots": []
    },
    "platform": { "name": "Yanolja", "booking_url": "" },
    "booking_guide": { "steps_en": [], "tips_en": [], "payment_methods": [], "foreigner_friendly": True },
    "last_update": "2026-02-15",
    "nearby": [],
    "booking_url": "",
    "star_rating": 3,
    "review_count": 120,
    "amenities": ["Free WiFi", "Netflix"],
    "distance_km": 1.2,
    "fan_match_score": 98.0,
    "link": "",
    "city": "busan"
}

# Add to start of list for visibility? Or append?
# Recommendation logic might sort it, but let's append.
data['top_recommendations'].append(sajik_hotel)


# Save
with open('public/concert_recommendations.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    
print("Successfully updated Busan hotel data and added Brown Dot Sajik.")
