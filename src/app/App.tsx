import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/app/components/Header';
import { Landing } from '@/app/components/Landing';
import { Results, City } from '@/app/components/Results';
import { HotelList } from '@/app/components/HotelList';
import { Detail } from '@/app/components/Detail';
import { Bookmarks } from '@/app/components/Bookmarks';
import { ConcertInsights } from '@/app/components/ConcertInsights';
import { AboutUs } from '@/app/components/AboutUs';
import { PrivacyPolicy } from '@/app/components/PrivacyPolicy';
import { LoginModal } from '@/app/components/auth/LoginModal';
import { MyPageModal } from '@/app/components/auth/MyPageModal';
import { translations } from '@/translations';

import { initialItems } from '@/app/data';
import { DateRange } from 'react-day-picker';
import { ArrowUp } from 'lucide-react';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { SortOption } from '@/app/types';
import { getOverrideImage } from '@/app/customImages';


// Re-export SortOption for backward compatibility
export type { SortOption } from '@/app/types';

type Screen = 'landing' | 'results' | 'detail' | 'bookmarks' | 'concerts' | 'about' | 'privacy' | 'hotel-list';

const DATA_URL = "/concert_recommendations.json";


// Helper to calculate distance in km (Haversine formula approximation)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Helper to sanitize broken URLs (e.g., double https://www.booking.com)
const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  // Fix double booking.com prefix
  if (url.includes('https://www.booking.comhttps://www.booking.com')) {
    return url.replace('https://www.booking.comhttps://www.booking.com', 'https://www.booking.com');
  }
  return url;
};


export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ArmyStayContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function ArmyStayContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [initialSort, setInitialSort] = useState<SortOption>('recommended');

  const [initialCity, setInitialCity] = useState<City>('seoul');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const { isAuthenticated, user, logout, setShowLoginModal, setShowMyPageModal } = useAuth();


  // Login Redirect Logic
  const [pendingRedirect, setPendingRedirect] = useState(false);

  useEffect(() => {
    if (isAuthenticated && pendingRedirect) {
      navigateTo('hotel-list');
      setPendingRedirect(false);
    }
  }, [isAuthenticated, pendingRedirect]);

  // Date Range State (Default to Concert Period: June 13-15, 2026)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 5, 13),
    to: new Date(2026, 5, 15)
  });

  const t = translations['en'];


  // Script Injection for Ownership Verification
  useEffect(() => {
    // Check if script is already present to prevent duplicates
    if (!document.querySelector('script[src*="tp-em.com"]')) {
      const script = document.createElement("script");
      script.async = true;
      script.src = 'https://tp-em.com/NDkyNTk4.js?t=492598';
      document.head.appendChild(script);
    }
  }, []);

  // Fetch Data from External JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`📡 Fetching data from: ${DATA_URL}`);
        const response = await fetch(`${DATA_URL}?t=${new Date().getTime()}`);

        if (!response.ok) {
          console.error(`❌ Fetch failed with status: ${response.status}`);
          throw new Error("Failed to fetch data");
        }

        const json = await response.json();
        console.log("✅ Data fetched successfully:", json ? Object.keys(json) : "empty");

        if (json && (json.top_recommendations || json.hotels)) {
          setFetchedData(json);
        } else {
          console.warn("⚠️ Fetched data seems empty or invalid structure:", json);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Scroll listener for Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Combine initial items with fetched data and handle localization
  const items = useMemo(() => {
    // Support both old 'hotels' structure and new 'top_recommendations' structure
    const rawHotels = fetchedData?.top_recommendations || fetchedData?.hotels || (Array.isArray(fetchedData) ? fetchedData : []);

    // CRITICAL FIX: If rawHotels is empty, FORCE usage of initialItems
    const sourceData = (rawHotels && rawHotels.length > 0) ? rawHotels : initialItems;
    const lang = 'en';

    const btsSpots = fetchedData?.map?.local_spots?.filter((s: any) => s.category === 'bts') || [];

    return sourceData.map((item: any, index: number) => {
      const name = item.hotel_name || item.name_en || item.name;
      const images = item.images || [];

      // Let's decide which image to use precisely
      let image = '';
      const rawImage = (images.length > 0 ? images[0] : null) || item.image_url || item.image || '';

      // 1. Check for manual overrides first (User's high quality actual photos)
      const overrideImage = getOverrideImage(item.id || '', name);
      if (overrideImage) {
        image = overrideImage;
      }
      // 2. If no override, check if rawImage is a valid external URL and not a Figma link
      else if (rawImage && !rawImage.includes('figma.com') && !rawImage.includes('s3-figma-foundry')) {
        // --- AUTO QUALITY UPGRADE ENGINE ---
        // If it's a Booking.com thumbnail, upgrade it to HD
        if (rawImage.includes('cf.bstatic.com') && rawImage.includes('square240')) {
          image = rawImage.replace('square240', 'max1024x768');
        } else {
          image = rawImage;
        }
      }


      // If still no image (failed check or empty), apply city/type based fallback
      if (!image) {
        const cityKey = (item.city_key || item.city || '').toLowerCase();
        const typeKey = (item.hotel_type?.label_en || item.type || '').toLowerCase();

        // City-based high quality Unsplash images
        if (cityKey === 'busan') {
          image = 'https://images.unsplash.com/photo-1590483863741-f70cc6bf200c?auto=format&fit=crop&q=80&w=1080';
        } else if (cityKey === 'goyang' || cityKey === 'paju') {
          image = 'https://images.unsplash.com/photo-1549410961-d6a13180491b?auto=format&fit=crop&q=80&w=1080';
        } else if (typeKey.includes('guesthouse') || typeKey.includes('hostel')) {
          image = 'https://images.unsplash.com/photo-1555854811-8aa226472e6c?auto=format&fit=crop&q=80&w=1080';
        } else {
          image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1080';
        }
      }




      const priceObj = item.price || {};
      const priceVal = typeof priceObj === 'number' ? priceObj : (priceObj.discounted_price || item.price_krw || 0);
      const priceKrw = typeof priceObj === 'number' ? null : (priceObj.discounted_price || item.price_krw);

      const ratingObj = item.rating || {};
      const ratingVal = typeof ratingObj === 'number' ? ratingObj : (ratingObj.score || 0);

      const locObj = item.location || {};
      let areaEn = locObj.area_en;
      const addressEn = locObj.address_en;

      const coords = (item.lat && item.lng) ? { lat: item.lat, lng: item.lng } : (item.coords || { lat: 37.5300, lng: 127.0500 });

      let armyScore = 30;

      const dist = calculateDistance(coords.lat, coords.lng, 37.6695, 126.7490);
      if (dist <= 1) armyScore += 30;
      else if (dist <= 3) armyScore += 25;
      else if (dist <= 5) armyScore += 20;
      else if (dist <= 10) armyScore += 10;

      const rawType = item.hotel_type?.label_en || item.type || '';
      const typeStr = (typeof rawType === 'string' ? rawType : '').toLowerCase();

      let displayType = rawType;
      if (typeStr.includes('airbnb')) {
        displayType = "Private Stay";
      }

      if (typeStr.includes('guesthouse')) armyScore += 20;
      else if (typeStr.includes('hostel')) armyScore += 18;
      else if (typeStr.includes('airbnb') || typeStr.includes('bnb')) armyScore += 10;
      else if (typeStr.includes('residence')) armyScore += 8;

      if (btsSpots.length > 0) {
        const minDist = Math.min(...btsSpots.map((s: any) => calculateDistance(coords.lat, coords.lng, s.lat, s.lng)));
        if (minDist <= 2) armyScore += 15;
        else if (minDist <= 5) armyScore += 10;
        else if (minDist <= 10) armyScore += 5;
      }

      const rawAddress = [
        addressEn,
        item.address_en,
        item.address,
        typeof item.location === 'string' ? item.location : '',
        item.location_kr,
        item.address_kr
      ].filter(s => typeof s === 'string').join(' ');

      const address = rawAddress.toLowerCase();

      // Inferred area for Busan if missing
      if (!areaEn && (address.includes('busan') || address.includes('부산'))) {
        if (address.includes('haeundae') || address.includes('해운대')) areaEn = 'Haeundae';
        else if (address.includes('suyeong') || address.includes('gwangalli') || address.includes('수영') || address.includes('광안리')) areaEn = 'Gwangalli';
        else if (address.includes('busanjin') || address.includes('seomyeon') || address.includes('부산진') || address.includes('서면')) areaEn = 'Seomyeon';
        else if (address.includes('jung-gu') || address.includes('nampo') || address.includes('중구') || address.includes('남포')) areaEn = 'Nampo';
        else if (address.includes('yeongdo') || address.includes('영도')) areaEn = 'Yeongdo';
        else if (address.includes('gijang') || address.includes('기장')) areaEn = 'Gijang';
      }

      if (address.includes('ilsan') || address.includes('일산') || address.includes('goyang') || address.includes('고양') || item.city === 'goyang' || item.city_key === 'goyang') armyScore += 10;
      else if (address.includes('hongdae') || address.includes('홍대') || address.includes('mapo') || address.includes('마포')) armyScore += 8;
      else if (address.includes('sangam') || address.includes('상암')) armyScore += 5;

      const finalScore = Math.min(armyScore, 99);
      const densityLabel = `ARMY ${finalScore}%`;
      const densityLevel = finalScore >= 80 ? 'Very High' : finalScore >= 60 ? 'High' : 'Normal';

      const resolveLocation = () => {
        if (areaEn && addressEn) return `${areaEn}, ${addressEn}`;
        if (areaEn) return areaEn;

        if (item.area && typeof item.area === 'object') {
          const areaVal = item.area.area_en;

          return areaVal || item.area.area_en || item.area.area_kr;
        }
        if (typeof item.area === 'string') return item.area;

        const suffix = 'en';


        if (typeof item[`location_${suffix}`] === 'string') return item[`location_${suffix}`];
        if (typeof item[`address_${suffix}`] === 'string') return item[`address_${suffix}`];

        if (typeof item.address_en === 'string') return item.address_en;
        if (typeof item.location_en === 'string') return item.location_en;


        if (typeof item.address === 'string') return item.address;
        if (typeof item.location === 'string') return item.location;
        if (typeof item.addr === 'string') return item.addr;

        if (typeof item.city === 'string') {
          return item.city.charAt(0).toUpperCase() + item.city.slice(1);
        }
      };

      const safeLocation = resolveLocation();


      const detectCity = () => {
        if (item.city_key) {
          const ck = item.city_key.toLowerCase();
          if (ck === 'seongsu') return 'seoul';
          if (['seoul', 'busan', 'paju', 'goyang'].includes(ck)) return ck;
        }
        if (item.city) return item.city.toLowerCase();

        const searchStr = [
          safeLocation,
          item.address,
          item.address_en,
          item.address_kr,
          typeof item.location === 'string' ? item.location : '',
          item.location_en,
          item.location_kr,
          item.area?.area_en,
          item.area?.area_kr
        ].filter(s => typeof s === 'string').join(' ').toLowerCase();

        if (searchStr.includes('seoul') || searchStr.includes('gangnam') || searchStr.includes('hongdae') || searchStr.includes('mapo') || searchStr.includes('yongsan') ||
          searchStr.includes('서울') || searchStr.includes('강남') || searchStr.includes('홍대') || searchStr.includes('마포') || searchStr.includes('용산')) return 'seoul';

        if (searchStr.includes('busan') || searchStr.includes('haeundae') || searchStr.includes('seomyeon') ||
          searchStr.includes('부산') || searchStr.includes('해운대') || searchStr.includes('서면')) return 'busan';

        if (searchStr.includes('paju') || searchStr.includes('파주')) return 'paju';

        if (searchStr.includes('goyang') || searchStr.includes('ilsan') || searchStr.includes('kintex') ||
          searchStr.includes('고양') || searchStr.includes('일산') || searchStr.includes('킨텍스')) return 'goyang';

        return 'goyang';
      };

      const detectedCity = detectCity();
      const coords2 = (item.lat && item.lng) ? { lat: item.lat, lng: item.lng } : (item.coords || { lat: 37.5300, lng: 127.0500 });

      return {
        ...item,
        address_en: typeof item.address_en === 'string' ? item.address_en : addressEn,
        area: (item.location?.area_en || item.area?.area_en || item.area_en)
          || (typeof item.area === 'string' ? item.area : areaEn),

        id: item.id || `item-${index}`,
        name: name,
        location: safeLocation,
        price: priceKrw ? Math.round(priceKrw / 1350) : (typeof priceVal === 'number' ? priceVal : 0),

        type: item.type || 'stay',
        city: detectedCity,
        coords: coords2,
        rating: ratingVal,
        army_density: {
          value: finalScore,
          label: densityLabel,
          level: densityLevel
        },
        accommodation_type_name: displayType,
        transport_desc: item.transport?.display_en,
        tags: [
          densityLabel,
        ].filter((tag): tag is string => typeof tag === 'string' && tag.length > 0),
        image: image,
        link: (() => {
          // Priority 1: Backend provided link
          if (item.link) return sanitizeUrl(item.link);

          // Priority 2: Platform specific deep link generation
          const platformName = item.platform?.name || '';
          const searchName = name;

          if (platformName === 'Booking.com') {
            return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchName)}`;
          }

          // Priority 3: Existing booking URL if valid
          if (item.platform?.booking_url && item.platform.booking_url.length > 30) {
            return sanitizeUrl(item.platform.booking_url);
          }

          // Priority 4: Default to Agoda Search
          return `https://www.agoda.com/search?text=${encodeURIComponent(searchName)}`;
        })(),

        safe_return: item.safe_return,

        army_local_guide: item.army_local_guide,
        booking: item.platform,
        rooms_left: item.rooms_left ?? 99
      };
    });
  }, [fetchedData, t]);


  const homeStats = useMemo(() => {
    if (fetchedData?.home) {
      return {
        availableCount: fetchedData.home.available_count,
        lowestPrice: Math.round(fetchedData.home.lowest_price_krw / 1350)
      };
    }
    return undefined;
  }, [fetchedData]);

  const mapData = useMemo(() => {
    // Add default color to stations if not present
    const data = fetchedData?.map;
    if (data && Array.isArray(data.local_spots)) {
      // Create a shallow copy of data to avoid direct mutation if possible, 
      // though deep cloning fetchedData is expensive. 
      // We will just map local_spots to a new array.
      return {
        ...data,
        local_spots: data.local_spots.map((spot: any) => ({
          ...spot,
          // Detect line color based on station name or add a default property
          lineColor: spot.lineColor || (spot.name?.includes('Line 3') || spot.name?.includes('3호선') ? '#EF7C1C' : '#00A84D')
        }))
      };
    }
    return data;
  }, [fetchedData]);

  const navigateTo = (screen: Screen) => {
    window.scrollTo(0, 0);
    setCurrentScreen(screen);
  };

  const handleSearch = (sortBy: SortOption = 'recommended', city: City = 'goyang') => {
    setInitialSort(sortBy);
    setInitialCity(city);
    setViewMode('list');
    navigateTo('results');
  };

  const handleSelectHotel = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    navigateTo('detail');
  };

  const handleBack = () => {
    if (currentScreen === 'detail') {
      navigateTo('results');
    } else if (currentScreen === 'results' || currentScreen === 'bookmarks' || currentScreen === 'hotel-list') {
      navigateTo('landing');
    }
  };

  const handleBookmarksClick = () => {
    // Navigate immediately to bookmarks screen regardless of auth state
    navigateTo('bookmarks');

    // If not authenticated, show login modal on top of the bookmarks screen
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-purple-100 relative">
      <LoginModal />
      <MyPageModal />

      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative border-x border-gray-100">

        {currentScreen !== 'detail' && (
          <Header
            onHome={() => navigateTo('landing')}
            onSearch={currentScreen === 'results' || currentScreen === 'hotel-list' ? () => navigateTo('landing') : undefined}
            onBookmarks={handleBookmarksClick}
            viewMode={currentScreen === 'results' || currentScreen === 'hotel-list' ? viewMode : undefined}
            setViewMode={currentScreen === 'results' || currentScreen === 'hotel-list' ? setViewMode : undefined}
            isAuthenticated={isAuthenticated}
            user={user}
            onLoginClick={() => {
              console.log('Header onLoginClick triggered'); // Debug log
              setPendingRedirect(true);
              setShowLoginModal(true);
            }}
            onProfileClick={() => setShowMyPageModal(true)}
            onLogoutClick={logout}
          />

        )}

        <main className={currentScreen !== 'detail' ? 'pt-14' : ''}>
          {currentScreen === 'landing' && (
            <Landing
              onSearch={handleSearch}
              t={t}
              dateRange={dateRange}
              setDateRange={setDateRange}
              stats={homeStats}
              items={items}
            />
          )}

          {currentScreen === 'results' && (
            <Results
              onSelectHotel={handleSelectHotel}
              t={t}
              currentLang="en"
              initialSort={initialSort}

              initialCity={initialCity}
              viewMode={viewMode}
              setViewMode={setViewMode}
              items={items}
              mapData={mapData}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}

          {currentScreen === 'detail' && (
            <Detail onBack={handleBack} t={t} hotelId={selectedHotelId} items={items} onSelectHotel={handleSelectHotel} />
          )}

          {currentScreen === 'bookmarks' && (
            <Bookmarks items={items} onSelectHotel={handleSelectHotel} t={t} />
          )}

          {currentScreen === 'concerts' && (
            <ConcertInsights data={fetchedData?.concerts || {}} />
          )}

          {currentScreen === 'hotel-list' && (
            <HotelList
              onSelectHotel={handleSelectHotel}
              t={t}
              currentLang="en"
              initialSort={initialSort}
              initialCity={initialCity}
              viewMode={viewMode}
              setViewMode={setViewMode}
              items={items}
              mapData={mapData}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}

          {currentScreen === 'about' && (
            <AboutUs onBack={() => navigateTo('landing')} />
          )}

          {currentScreen === 'privacy' && (
            <PrivacyPolicy onBack={() => navigateTo('landing')} />
          )}


        </main>

        {/* Scroll To Top Button */}
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-5 z-[90] pointer-events-none transition-opacity duration-300 ${showTopBtn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-end">
            <button
              onClick={scrollToTop}
              className="pointer-events-auto bg-gray-900/90 text-white p-3 rounded-full shadow-xl backdrop-blur hover:bg-black transition-transform hover:scale-110 active:scale-90 flex items-center justify-center"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
