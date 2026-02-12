import json
import os
import math

class ConcertHotelRecommender:
    def __init__(self):
        self.hotels = []
        self.analysis = {}
        # Goyang Stadium Coordinates
        self.venue_coords = (37.6556, 126.7714)

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """
        Calculate the great circle distance between two points 
        on the earth (specified in decimal degrees)
        """
        # Convert decimal degrees to radians 
        lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

        # Haversine formula 
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a)) 
        r = 6371 # Radius of earth in kilometers. Use 3956 for miles
        return c * r

    def load_data(self):
        """아고다 데이터와 레딧 분석 결과 로드 (강화된 타입 체크 및 GitHub 자동 다운로드)"""
        print("🔄 Loading data (Logic Version 2.2 - Auto Github Sync)...")

        # GitHub URL
        GITHUB_URL = "https://raw.githubusercontent.com/not2byul-sys/BTS_Hotel/claude/document-project-architecture-nGfgr/korean_ota_hotels.json"
        
        # 다운로드 시도
        try:
            import urllib.request
            print(f"⬇️ Downloading fresh data from GitHub: {GITHUB_URL}")
            with urllib.request.urlopen(GITHUB_URL) as response:
                if response.status == 200:
                    data = response.read()
                    with open("korean_ota_hotels.json", "wb") as f:
                        f.write(data)
                    print("✅ Successfully downloaded fresh data from GitHub")
                else:
                    print(f"⚠️ Failed to download from GitHub (Status: {response.status}), using local file")
        except Exception as e:
            print(f"⚠️ GitHub download failed: {e}. Using local file.")

        # 아고다 호텔 데이터 로드
        try:
            with open("korean_ota_hotels.json", "r", encoding='utf-8') as f:
                raw_data = json.load(f)
                
            self.hotels = []
            
            # 강제 dict 필터링 - 모든 경우의 수 처리
            if isinstance(raw_data, list):
                # 리스트 형식: [hotel1, hotel2, ...]
                self.hotels = [h for h in raw_data if isinstance(h, dict)]
            elif isinstance(raw_data, dict):
                # 전략 1: top-level 'hotels' 가져오기
                if 'hotels' in raw_data and isinstance(raw_data['hotels'], list):
                    self.hotels.extend([h for h in raw_data['hotels'] if isinstance(h, dict)])
                    
                # 전략 2: 'map' -> 'hotels' 가져오기 (광화문/명동 호텔이 여기 있을 수 있음)
                if 'map' in raw_data and isinstance(raw_data['map'], dict):
                    if 'hotels' in raw_data['map'] and isinstance(raw_data['map']['hotels'], list):
                        map_hotels = [h for h in raw_data['map']['hotels'] if isinstance(h, dict)]
                        self.hotels.extend(map_hotels)
                        print(f"  + Added {len(map_hotels)} hotels from map/hotels section")

                # 전략 3: 단일 객체일 경우 (hotels 키가 없고 본인이 호텔일 때) - 다만 현재 구조상 희박함
                if not self.hotels and 'name_en' in raw_data:
                     self.hotels = [raw_data]
                     print("✓ Loaded 1 hotel from single object format")

                print(f"✓ Total loaded {len(self.hotels)} hotels")
                
                # Debug: Print loaded IDs containing 'gw'
                gw_ids = [h.get('id') for h in self.hotels if 'gw' in str(h.get('id', ''))]
                print(f"DEBUG: Loaded GW (Gwanghwamun/Myeongdong) IDs: {len(gw_ids)} found")
            else:
                self.hotels = []
                print(f"⚠️ Warning: Unexpected data type: {type(raw_data)}")
                
        except FileNotFoundError:
            print("❌ Error: korean_ota_hotels.json not found")
            self.hotels = []
        except json.JSONDecodeError as e:
            print(f"❌ Error: Invalid JSON format - {e}")
            self.hotels = []
            
        # 레딧 분석 결과 로드
        try:
            with open("reddit_fan_analysis.json", "r", encoding='utf-8') as f:
                self.analysis = json.load(f)
                print("✓ Reddit analysis loaded successfully")
        except FileNotFoundError:
            print("❌ Error: reddit_fan_analysis.json not found")
            print("   Please run: python3 reddit_fan_analyzer.py")
            self.analysis = {}
        except json.JSONDecodeError as e:
            print(f"❌ Error: Invalid JSON in analysis file - {e}")
            self.analysis = {}

    def calculate_fan_match_score(self, hotel):
        """Fan Match Score 계산 (강화된 타입 체크)"""
        # 타입 검증 - dict가 아니면 즉시 반환
        if not isinstance(hotel, dict):
            print(f"⚠️ Skipping non-dict item: {type(hotel)}")
            return 0.0
        
        # 클로드의 알고리즘: 가중치 기반 Fan Match Score 산출
        base_score = 65.0
        weights = self.analysis.get("need_priorities", {})
        
        # 기본 가중치 (분석 데이터가 없을 경우 대비)
        if not weights:
            weights = {
                "location_transit": 0.88,
                "budget_sensitivity": 0.95
            }
        
        # 0. 거리 계산 (필수)
        lat = hotel.get('lat')
        lng = hotel.get('lng')
        
        # distance_km이 이미 있으면 사용, 없으면 좌표로 계산
        dist = hotel.get('distance_km')
        
        if dist is None or dist == "":
            if lat and lng:
                try:
                    dist = self.calculate_distance(self.venue_coords[0], self.venue_coords[1], float(lat), float(lng))
                    hotel['distance_km'] = round(dist, 1) # 저장해둠
                except (ValueError, TypeError):
                    dist = 20.0 # 좌표 오류시 기본값 (멀리 설정)
            else:
                dist = 20.0 # 좌표 없으면 멀리 설정
        else:
            try:
                dist = float(dist)
            except (ValueError, TypeError):
                dist = 20.0

        # 1. 위치 가중치 (88%)
        # 고양시 경기장 근처 우대
        if dist < 1.0:
            base_score += (35 * weights.get("location_transit", 0.88))
        elif dist < 3.0:
            base_score += (15 * weights.get("location_transit", 0.88))
        elif dist < 5.0:
            base_score += (5 * weights.get("location_transit", 0.88))
            
        # 1.5. 관광지/지역 보너스 (서울 주요 지역)
        # 거리가 멀더라도(고양시가 아니더라도) 명동, 광화문 등은 셔틀/지하철 접근성이 좋고 관광지라 인기
        hotel_name = hotel.get('name_en', '').lower() + " " + hotel.get('name', '').lower()
        address = str(hotel.get('location', {})).lower()
        
        tourist_hubs = ['myeongdong', 'gwanghwamun', 'hongdae', 'seoul station', 'jongno']
        is_tourist_hub = any(hub in hotel_name or hub in address for hub in tourist_hubs)
        
        if is_tourist_hub:
            base_score += 60 # 관광지 보너스 (대폭 상향하여 상위 노출 유도 - 경기장 근처 모텔보다 우선순위)
            # print(f"  ✨ Tourist Hub Bonus: {hotel.get('name_en')}")

        # 2. 가격 안정성 (95%) - 바가지 징후가 없는 경우 가점
        is_gouging = hotel.get('is_price_gouging', False)
        if not is_gouging:
            base_score += (20 * weights.get("budget_sensitivity", 0.95))
            
        # 3. 최종 점수 산출 (100점 초과 허용 - 강력 추천 호텔 구분을 위해)
        return round(base_score, 1)

    def generate_recommendations(self):
        """추천 데이터 생성"""
        print("\n" + "="*60)
        print("🎵 ARMY Stay Hub - Concert Hotel Recommender")
        print("   BTS ARIRANG World Tour 2026")
        print("="*60 + "\n")
        
        self.load_data()
        
        if not self.hotels:
            print("\n❌ No valid hotel data found. Cannot generate recommendations.")
            print("   Please check korean_ota_hotels.json file.\n")
            return
        
        print(f"\n📊 Processing {len(self.hotels)} hotels...\n")
        
        # 각 호텔에 Fan Match Score 계산
        valid_hotels = []
        for idx, hotel in enumerate(self.hotels):
            if isinstance(hotel, dict):
                score = self.calculate_fan_match_score(hotel)
                hotel['fan_match_score'] = score
                
                # 🖼️ 이미지 강제 교체 (프론트엔드 캐시 문제 해결을 위해 데이터 소스에서 변경)
                # 1. Midcity & New Seoul
                if hotel.get('id') == 'hotel_gw_10012' or 'Midcity' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1080'
                    # print(f"  🖼️ Image Updated: {hotel.get('name_en')}")
                    
                if hotel.get('id') == 'hotel_gw_10013' or 'New Seoul' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1080'
                    # print(f"  🖼️ Image Updated: {hotel.get('name_en')}")

                # 2. Luxury & Top Rated
                if hotel.get('id') == 'hotel_gw_10001' or 'Four Seasons' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1080'
                
                if hotel.get('id') == 'hotel_gw_10000' or 'Shilla Stay' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1080' # Shilla Stay verified mood

                if hotel.get('id') == 'hotel_gw_10002' or 'Somerset' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&q=80&w=1080'

                if hotel.get('id') == 'hotel_gw_10003' or 'Nine Tree' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1080'

                if hotel.get('id') == 'hotel_gw_10006' or 'AMID' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1080'

                if hotel.get('id') == 'hotel_gw_10007' or 'Dormy' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1080'

                # 3. Hanok & Traditional
                if 'Hanok' in hotel.get('name_en', '') or hotel.get('id') == 'hotel_gw_10011':
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1080'
                
                if hotel.get('id') == 'hotel_gw_10014' or 'Orakai' in hotel.get('name_en', ''):
                    hotel['image_url'] = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=1080'

                # 🔗 예약 링크 생성 로직 추가
                # Detail.tsx에서 hotel.link가 없으면 기본 아고다 검색으로 빠지는데, 
                # 여기서 정확한 검색 링크를 만들어준다.
                platform_data = hotel.get('platform', {})
                if isinstance(platform_data, dict):
                    platform_name = platform_data.get('name', 'Agoda')
                else:
                    platform_name = 'Agoda'

                search_query = hotel.get('name_en') or hotel.get('name')
                
                if platform_name == 'Booking.com':
                    hotel['link'] = f"https://www.booking.com/searchresults.html?ss={search_query.replace(' ', '+')}"
                else:
                    hotel['link'] = f"https://www.agoda.com/search?text={search_query.replace(' ', '+')}"

                valid_hotels.append(hotel)
                
                # 상위 5개만 로그 출력
                if idx < 5:
                    name = hotel.get('hotel_name') or hotel.get('name') or f"Hotel {idx+1}"
                    print(f"  ✓ {name}: {score}/100")
        
        print(f"\n✅ Scored {len(valid_hotels)} valid hotels\n")
        
        # 가중치 순으로 정렬
        sorted_hotels = sorted(valid_hotels, key=lambda x: x.get('fan_match_score', 0), reverse=True)

        # 쿼터제 및 수량 제한 완전 해제 (사용자 요청: 모든 숙소 복구 - Seoul 49, Goyang 27, Busan 10)
        # 단순히 점수순으로 정렬하여 전체 반환
        final_list = sorted(valid_hotels, key=lambda x: x.get('fan_match_score', 0), reverse=True)
        
        # Debugging counts
        s_cnt = 0
        g_cnt = 0
        b_cnt = 0
        
        for h in final_list:
            # Safe extraction of search string
            search_str = ""
            
            # Location
            loc = h.get('location', {})
            if isinstance(loc, dict):
                search_str += loc.get('address_en', '') + " "
            elif isinstance(loc, str):
                search_str += loc + " "
                
            # Tags
            tags = h.get('tags', {})
            if isinstance(tags, dict):
                search_str += tags.get('display_en', '') + " "
            elif isinstance(tags, str):
                search_str += tags + " "
                
            # City key
            search_str += str(h.get('city_key', ''))
            
            search_str = search_str.lower()
            
            if 'seoul' in search_str: s_cnt += 1
            if 'goyang' in search_str or 'ilsan' in search_str: g_cnt += 1
            if 'busan' in search_str: b_cnt += 1
        
        print(f"DEBUG: Final Count Check -> Seoul: {s_cnt}, Goyang: {g_cnt}, Busan: {b_cnt}, Total: {len(final_list)}")
        
        # Ensure we have at least the expected numbers (49, 27, 10)
        # if len(final_list) < 86:
        #    print("⚠️ Warning: Hotel count is lower than expected 86. Checking source extraction...")

        final_output = {
            "concert_info": {
                "tour": "BTS ARIRANG World Tour 2026",
                "locations": ["Seoul", "Goyang", "Busan"],
                "generated_at": "2026-02-07",
                "total_hotels_analyzed": len(valid_hotels)
            },
            "top_recommendations": final_list
        }
        
        # JSON 파일로 저장
        try:
            with open("concert_recommendations.json", "w", encoding='utf-8') as f:
                json.dump(final_output, f, indent=2, ensure_ascii=False)
            print("💾 Saved to: concert_recommendations.json")
            print(f"   Top {len(final_output['top_recommendations'])} recommendations\n")
        except Exception as e:
            print(f"❌ Error saving file: {e}\n")
            return
        
        print("="*60)
        print("✅ Fan Match Score Engine execution completed.")
        print("="*60 + "\n")

if __name__ == "__main__":
    recommender = ConcertHotelRecommender()
    recommender.generate_recommendations()
