import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronRight, Star, Heart, List, Users, TrendingUp, Footprints, Car, Calendar, Ticket, Timer, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { translations } from '@/translations';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
  useMapEvents({
    click: () => onMapClick(),
  });
  return null;
};

// Custom Icon Creators
const createPriceIcon = (price: string, isSelected: boolean) => L.divIcon({
  className: '',
  html: `<div class="${isSelected
    ? 'bg-purple-700 text-white scale-110 z-50'
    : 'bg-white text-gray-900 hover:scale-110 hover:z-40'
    } transition-all duration-200 font-extrabold text-[13px] px-3 py-1.5 rounded-full shadow-md border border-gray-200 whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer">${price}</div>`,
  iconSize: [50, 28],
  iconAnchor: [25, 14]
});

const createCategoryIcon = (color: string, iconHtml: string, isSelected: boolean) => L.divIcon({
  className: '',
  html: `<div class="${color} text-white w-9 h-9 rounded-full shadow-lg border-2 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">${iconHtml}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

type SortOption = 'recommended' | 'lowest_price' | 'distance' | 'available' | 'popular' | 'army_density' | 'closing_soon' | 'safe_return' | 'bts_spot' | 'after_party';

interface ResultsProps {
  onSelectHotel: (hotelId: string) => void;
  t: typeof translations['en'];
  currentLang?: string;
  initialSort?: SortOption;
  initialCity?: City;
  viewMode: 'list' | 'map';
  setViewMode: (mode: 'list' | 'map') => void;
  items: any[];
  mapData?: any;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  cityCounts?: Record<string, number>;
  searchQuery?: string;
  bookmarks: Set<string>;
  toggleBookmark: (id: string) => void;
}

type Category = 'all' | 'stay' | 'food' | 'spot';
export type City = 'seoul' | 'goyang' | 'busan' | 'paju' | 'other' | 'near_gwanghwamun';

const CITY_COORDS: Record<City, { lat: number; lng: number }> = {
  seoul: { lat: 37.5300, lng: 127.0500 },
  near_gwanghwamun: { lat: 37.5759, lng: 126.9768 },
  goyang: { lat: 37.6584, lng: 126.7640 },
  paju: { lat: 37.7590, lng: 126.7750 },
  busan: { lat: 35.1900, lng: 129.0700 },
  other: { lat: 37.5, lng: 127.0 }
};

const JAMSIL_COORDS = { lat: 37.5148, lng: 127.0733 };
const GOYANG_COORDS = { lat: 37.6695, lng: 126.7490 };

const CONCERT_VENUES = [
  { name: 'Gwanghwamun', lat: 37.5759, lng: 126.9769 },
  { name: 'Goyang Stadium', lat: 37.6695, lng: 126.7490 },
  { name: 'Busan Asiad', lat: 35.1900, lng: 129.0700 }
];

const SPECIAL_LOCATIONS: Record<string, { venue: any, stations: any[] }> = {
  seoul: {
    venue: { ...JAMSIL_COORDS, name: 'BTS Venue' },
    stations: [
      { lat: 37.5105, lng: 127.0736, name: 'Sports Complex' },
      { lat: 37.5140, lng: 127.0580, name: 'Samseong' }
    ]
  },
  goyang: {
    venue: { ...GOYANG_COORDS, name: 'BTS Venue' },
    stations: [
      { lat: 37.6761, lng: 126.7475, name: 'Daehwa Station' }
    ]
  },
  busan: {
    venue: { lat: 35.1900, lng: 129.0700, name: 'Busan Concert' },
    stations: []
  },
  paju: {
    venue: { lat: 37.6695, lng: 126.7490, name: 'BTS Venue' },
    stations: []
  },
  other: {
    venue: { lat: 37.5, lng: 127.0, name: 'Default' },
    stations: []
  }
};

const CONCERT_DATES: Record<City, DateRange> = {
  seoul: { from: new Date(2026, 5, 13), to: new Date(2026, 5, 14) },
  near_gwanghwamun: { from: new Date(2026, 5, 13), to: new Date(2026, 5, 14) },
  goyang: { from: new Date(2026, 5, 14), to: new Date(2026, 5, 15) },
  busan: { from: new Date(2026, 5, 15), to: new Date(2026, 5, 16) },
  paju: { from: new Date(2026, 5, 14), to: new Date(2026, 5, 15) },
  other: { from: new Date(2026, 5, 13), to: new Date(2026, 5, 15) },
};

const cities: { id: City; label: string; dates: string }[] = [
  { id: 'near_gwanghwamun', label: 'Gwanghwamun', dates: 'Jun 13-14' },
  { id: 'goyang', label: 'Goyang', dates: 'Jun 14-15' },
  { id: 'busan', label: 'Busan', dates: 'Jun 15-16' },
  { id: 'seoul', label: 'Seoul', dates: 'Jun 13-14' },
];

const createVenueIcon = () => L.divIcon({
  className: '',
  html: `<div class="bg-red-500 text-white w-10 h-10 rounded-full shadow-xl border-2 border-white flex items-center justify-center animate-bounce z-[100]">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
         </div>
         <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm z-[100]">
           D-Day
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const createStationIcon = (name: string, line?: string) => {
  // Line colors
  const lineColors: Record<string, string> = {
    '1': '#0052A4',
    '2': '#00A84D',
    '3': '#EF7C1C',
    '4': '#00A4E3',
    '5': '#996CAC',
    '6': '#CD7C2F',
    '7': '#747F00',
    '8': '#E6186C',
    '9': '#BDB092',
    'Gyeongui-Jungang': '#77C4A3',
    'GTX-A': '#9A6292',
    'Shinbundang': '#D4003B',
    'Arex': '#0090D2'
  };

  let detectedLine = line || '2';
  let displayName = name || '';
  const lowerName = displayName.toLowerCase();

  // Robust detection logic
  if (line) {
    detectedLine = line;
  } else {
    const lineMatch = displayName.match(/Line\s*(\w+)/i) || displayName.match(/(\d+)호선/);
    if (lineMatch) {
      detectedLine = lineMatch[1];
      displayName = displayName.replace(/Line\s*\w+/i, '').replace(/\d+호선/, '').trim();
    } else {
      // Line 3 (Orange) - Goyang/Ilsan area
      if (['daehwa', 'juyeop', 'jeongbalsan', 'madu', 'baekseok', 'daegok', 'hwajeong', 'wondang', 'samsong', 'jichuk', 'kupabal', 'yeonsinnae'].some(s => lowerName.includes(s)) ||
        ['대화', '주엽', '정발산', '마두', '백석', '화정', '원당', '삼송', '지축', '구파발', '연신내'].some(s => displayName.includes(s))) {
        detectedLine = '3';
      }
      // Gyeongui-Jungang (Mint)
      else if (['tanhyeon', 'ilsan', 'pungsan', 'baekma', 'goksan', 'neunggok', 'haengsin', 'dmc', 'digital media city'].some(s => lowerName.includes(s)) ||
        ['탄현', '일산', '풍산', '백마', '곡산', '능곡', '행신', '수색'].some(s => displayName.includes(s))) {
        detectedLine = 'Gyeongui-Jungang';
      }
      // Line 2 (Green) - Seoul core
      else if (['sports complex', 'samseong', 'gangnam', 'hongik', 'hongdae', 'sinchon', 'ewha', 'city hall', 'jamsil', 'euljiro'].some(s => lowerName.includes(s)) ||
        ['종합운동장', '삼성', '강남', '홍대', '신촌', '이대', '시청', '잠실', '을지로'].some(s => displayName.includes(s))) {
        detectedLine = '2';
      }
      // Line 5 (Purple)
      else if (['olympic', 'gimpo', 'yeouido', 'gwanghwamun'].some(s => lowerName.includes(s)) ||
        ['올림픽', '김포', '여의도', '광화문'].some(s => displayName.includes(s))) {
        detectedLine = '5';
      }
      // Arex (Blue)
      else if (['gimpo airport', 'incheon airport', 'seoul station'].some(s => lowerName.includes(s))) {
        detectedLine = 'Arex';
      }
    }
  }

  const color = lineColors[detectedLine] || lineColors['2'];
  const badgeContent = detectedLine === 'Gyeongui-Jungang' ? 'GJ' : (detectedLine.length > 2 ? detectedLine.charAt(0) : detectedLine);

  return L.divIcon({
    className: '',
    html: `<div class="bg-[${color}] text-white w-8 h-8 rounded-full shadow-lg border-2 border-white flex items-center justify-center z-[90]" style="background-color: ${color}">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <rect width="16" height="16" x="4" y="3" rx="2" />
             <path d="M4 11h16" />
             <path d="M12 3v8" />
             <path d="m8 19-2 3" />
             <path d="m16 19 2 3" />
             </svg>
         </div>
         ${displayName ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 text-[11px] font-bold px-2 py-1 rounded-full shadow-md border border-gray-200 whitespace-nowrap flex items-center gap-1.5 min-w-max">
           <div class="w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white" style="background-color: ${color}">${badgeContent}</div>
           ${displayName}
         </div>` : ''}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapUpdater = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 13, { duration: 0.5 });
  }, [center, map]);
  return null;
};



export const Results = ({ onSelectHotel, t, currentLang = 'en', initialSort = 'recommended', initialCity = 'goyang', viewMode, setViewMode, items, mapData, dateRange, setDateRange, cityCounts, searchQuery = '', bookmarks, toggleBookmark }: ResultsProps) => {

  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeCity, setActiveCity] = useState<City>(initialCity || 'goyang');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>(initialSort || 'recommended');

  useEffect(() => {
    if (initialCity) {
      setActiveCity(initialCity);
    }
  }, [initialCity]);

  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);

  const [isCityOpen, setIsCityOpen] = useState(false);

  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };



  const getCityLabel = (city: City) => {
    // @ts-ignore
    return t[`city${city.charAt(0).toUpperCase() + city.slice(1)}`];
  };

  const displayDate = dateRange?.from
    ? `${format(dateRange.from, 'MMM d')}${dateRange.to ? ` - ${format(dateRange.to, 'MMM d')}` : ''}`
    : 'Select Dates';



  useEffect(() => {
    if (initialSort) {
      setActiveSort(initialSort);
    }
  }, [initialSort]);

  const formatPrice = (usdPrice: number) => {
    // @ts-ignore
    const rate = t.currencyRate || 1;
    // @ts-ignore
    const symbol = t.currencySymbol || '$';

    const converted = Math.round(usdPrice * rate);
    return `${symbol}${converted.toLocaleString()}`;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };



  // Filter items based on city, category, and search query
  const filteredItems = useMemo(() => {
    // Ensure we have a valid string for search query
    const query = (searchQuery || '').toLowerCase().trim();

    let filtered = items.filter(item => {
      let cityMatch = false;

      if (query) {
        cityMatch = true;
      } else {
        if (activeCity === 'near_gwanghwamun') {
          // Special filter for Gwanghwamun: Hotel MUST be in Gwanghwamun area OR very close (< 2km from Gwanghwamun Square)
          // We check 'city_key' which we manually set to 'gwanghwamun' in JSON for the top recommendations
          // Or strictly check area name.
          cityMatch = item.city_key === 'gwanghwamun' || (item.city === 'seoul' && item.location?.area_en?.toLowerCase() === 'gwanghwamun');

          // Fallback: If distance to Gwanghwamun is calculated and small
          if (!cityMatch && item.city === 'seoul' && item.distance?.minutes && item.distance.minutes < 15 && item.distance.display_en?.includes('Gwanghwamun')) {
            cityMatch = true;
          }
        } else if (activeCity === 'seoul') {
          // Seoul tab shows Seoul hotels, excluding those explicitly in 'Near Gwanghwamun' tab to avoid dups?
          // Or user meant "Seoul" contains everything else.
          // Let's exclude Gwanghwamun-specific ones to make it a distinct "Other Seoul" list if implied,
          // OR include everything.
          // Re-reading: "Seoul hotels after Busan". Likely means "Rest of Seoul" or "Seoul General".
          // If I just show ALL Seoul, then Gwanghwamun hotels appear twice.
          // Let's TRY to exclude the ones that appear in "Near Gwanghwamun" to make it clean,
          // UNLESS user wants to find them in Seoul too. 
          // Re-reading: "Seoul hotels... separate into Seoul".
          // I'll default to ALL Seoul hotels in 'seoul' tab for safety, or exclude if it feels redundant.
          // Getting feedback: "Near Gwanghwamun ONLY Gwanghwamun". 
          // So 'Seoul' probably acts as "Seoul (All)" or "Seoul (Other)".
          // Let's show ALL Seoul hotels in 'Seoul' tab for catch-all, but sort differently?
          // Actually, if I strictly split, 'Seoul' should exclude 'gwanghwamun' keyed items.
          cityMatch = item.city === 'seoul' && item.city_key !== 'gwanghwamun';
        } else {
          cityMatch = item.city === activeCity;
        }
      }
      const categoryMatch = activeCategory === 'all' || item.type === activeCategory;
      const searchMatch = (() => {
        if (!query) return true;
        return (
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.name_kr && item.name_kr.includes(query)) ||
          (item.name_en && item.name_en.toLowerCase().includes(query)) ||
          (item.location && item.location.toLowerCase().includes(query)) ||
          (item.address && item.address.toLowerCase().includes(query)) ||
          (item.address_kr && item.address_kr.includes(query)) ||
          (item.tags && item.tags.some((tag: any) => typeof tag === 'string' && tag.toLowerCase().includes(query)))
        );
      })();

      // Sub-filter Logic
      let subFilterMatch = true;
      if (activeSort === 'safe_return') {
        // Check multiple possible locations for safe return info
        subFilterMatch = !!(item.safe_return || item.safe_route || (item.tags && item.tags.some((t: string) => t.toLowerCase().includes('safe') || t.toLowerCase().includes('return'))));
      }

      return cityMatch && categoryMatch && searchMatch && subFilterMatch;
    });

    // Sort Logic based on activeSort
    if (activeSort === 'distance') {
      filtered.sort((a, b) => (a.distance?.minutes || 999) - (b.distance?.minutes || 999));
    } else if (activeSort === 'army_density') {
      filtered.sort((a, b) => (b.army_density?.value || 0) - (a.army_density?.value || 0));
    }


    else {
      // Default sort (Recommended)
      filtered.sort((a, b) => {
        const scoreA = (a.rating || 0) * 20 + (100 - (a.distance?.minutes || 100));
        const scoreB = (b.rating || 0) * 20 + (100 - (b.distance?.minutes || 100));
        return scoreB - scoreA;
      });
    }

    return filtered;
  }, [items, activeCity, activeCategory, searchQuery, activeSort]);

  const hotels = useMemo(() => filteredItems.filter(i => i.type === 'stay'), [filteredItems]);
  const selectedItem = useMemo(() => items.find(i => i.id === selectedMarkerId), [selectedMarkerId, items]);

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'recommended', label: 'All', icon: <List size={12} /> },
    { id: 'distance', label: t.sortDistance, icon: <MapPin size={12} /> },
    { id: 'army_density', label: t.sortArmyDensity, icon: <Users size={12} /> },
    { id: 'safe_return', label: 'Safe Return', icon: <TrendingUp size={12} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-[80px] relative pt-[0px] pr-[0px] pl-[0px]">
      {/* Floating map controls removed in favor of unified sticky header */}

      {/* Sticky Header: Search Bar Removed, only City Tabs now? 
          Actually, we need to remove the search bar container entirely. 
          But wait, the City Tabs were sticky top-[120px]. Now that search is gone, they should be top-[56px] (header height).
      */}

      {/* City Tabs */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth px-4 gap-6">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setActiveCity(city.id);
                setDateRange?.(CONCERT_DATES[city.id]);
                // Scroll to top when changing city
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-none py-3 text-sm transition-colors relative ${activeCity === city.id
                ? 'text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-bold text-[15px] relative">
                  {city.label}
                  <span className="ml-1 text-[11px] font-semibold text-gray-400">
                    {cityCounts?.[city.id] || 0}
                  </span>
                  {activeCity === city.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute -bottom-[13px] left-0 right-0 h-[2px] bg-purple-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          <div className="w-full bg-gray-20 pt-[5px] pb-[2px]">
            {/* Date/City filters removed */}
          </div>

          <div className="pr-[0px] pl-[20px] pt-[16px] pb-[10px] mb-3 flex items-center justify-between">
            <div
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-center gap-2 overflow-x-auto hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  id={`filter-${option.id}`}
                  onClick={() => {
                    setActiveSort(option.id);
                    document.getElementById(`filter-${option.id}`)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                      inline: 'center'
                    });
                  }}
                  className={`px-[13px] py-[7px] rounded-lg text-[13px] font-medium transition-all whitespace-nowrap border flex-shrink-0 ${activeSort === option.id
                    ? 'bg-[#333] text-[#FFF] border-0'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    {/* Icon removed as requested */}
                    {option.label}
                  </span>
                </button>
              ))}
              <div className="w-[40px] flex-shrink-0"></div> {/* 40px padding at the end */}
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 pt-0">

            <section>

              <div className="flex flex-col gap-5" key={`list-${activeCity}-${activeSort}`}>
                {filteredItems.filter(i => i.type === 'stay').map((hotel: any, index: number) => {
                  const imageUrl = hotel.image_url || hotel.image || '';
                  const name = hotel.name_en || hotel.name;
                  const price = hotel.price_usd ? `$ ${hotel.price_usd}` : formatPrice(hotel.price);
                  const platform = hotel.booking?.platform;
                  const statusEn = hotel.status_en;
                  const accommodationType = hotel.accommodation_type_name || hotel.display_tags?.type?.en;
                  const rawTags = hotel.tags || [];

                  const tags = rawTags.filter((tag: any): tag is string => typeof tag === 'string' && tag.length > 0);

                  const isLiked = bookmarks.has(hotel.id);
                  // console.log(`Rendering hotel ${hotel.id}, isLiked: ${isLiked}, bookmarks:`, Array.from(bookmarks));

                  const nearestStation = (() => {
                    const stations = SPECIAL_LOCATIONS[activeCity]?.stations || [];
                    if (!stations.length) return null;

                    const withDist = stations.map(s => ({
                      ...s,
                      dist: calculateDistance(hotel.coords.lat, hotel.coords.lng, s.lat, s.lng)
                    }));

                    return withDist.reduce((prev, curr) => prev.dist < curr.dist ? prev : curr);
                  })();

                  // Calculate distance to venue for tag
                  const venueDistanceInfo = (() => {
                    const nearestVenue = CONCERT_VENUES.map(v => ({
                      ...v,
                      dist: calculateDistance(hotel.coords.lat, hotel.coords.lng, v.lat, v.lng)
                    })).reduce((min, curr) => curr.dist < min.dist ? curr : min);

                    const walkTime = Math.ceil(nearestVenue.dist * 15);
                    const driveTime = Math.ceil(nearestVenue.dist * 2.5);
                    const isWalk = walkTime <= 20;

                    return {
                      text: isWalk
                        ? `${walkTime} min walk to ${nearestVenue.name}`
                        : `${driveTime} min drive to ${nearestVenue.name}`,
                      icon: isWalk ? Footprints : Car,
                      isWalk
                    };
                  })();

                  return (
                    <div
                      key={`${hotel.id}-${activeCity}-${index}`}
                      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col transition-opacity duration-200 opacity-100`}
                    >
                      <div className="relative h-48 w-full shrink-0" data-layername="Hotel_Image">
                        <ImageWithFallback
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />

                        {platform && (
                          <div className="absolute top-3 left-3 z-20">
                            <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg uppercase tracking-wider border border-white/10">
                              {platform}
                            </span>
                          </div>
                        )}



                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleBookmark(hotel.id);
                          }}
                          className={`absolute top-3 right-3 p-2 backdrop-blur-sm rounded-full transition-colors z-10 group ${isLiked
                            ? 'bg-white text-purple-700'
                            : 'bg-white/90 text-gray-400 hover:text-purple-500'
                            }`}
                        >
                          <div className="relative">
                            <div>
                              <Heart
                                size={20}
                                fill={isLiked ? "currentColor" : "none"}
                                className={isLiked ? "fill-purple-700" : ""}
                              />
                            </div>



                          </div>
                        </button>

                        {/* Bottom tags container removed to close gap */}
                        <div
                          className="absolute bottom-3 left-3 bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm z-10"
                          data-layername="Rating"
                        >
                          <Star size={12} fill="currentColor" className="text-yellow-400" />
                          {hotel.rating}
                        </div>
                        {/* Heart shifted to top-right is already handled by absolute positioning in parent */}
                      </div>

                      <div className="px-4 py-5 flex flex-col gap-2 h-full">
                        {/* Gap removed */}
                        <div className="flex flex-col gap-1">
                          <h3
                            className="font-bold text-lg text-gray-900 leading-tight"
                            data-layername="Hotel_Name"
                          >
                            {name.replace(/\[.*?\]\s*/g, '')}
                          </h3>

                          {/* Consolidated Info Row: Location • Hotel • Transport (Grey text) */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap leading-relaxed">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="shrink-0" />
                              {hotel.area || hotel.location || activeCity.charAt(0).toUpperCase() + activeCity.slice(1)}
                            </div>

                            <span className="text-gray-300">•</span>
                            <span>{hotel.type === 'stay' ? 'Hotel' : (hotel.type === 'food' ? 'Restaurant' : 'Spot')}</span>

                            {hotel.transport_desc && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  {hotel.transport_desc}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Badges Row: ARMY (Purple) + Others (Grey Rounded) */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {/* ARMY Density - Purple */}
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center font-bold bg-purple-100 text-purple-700">
                              ARMY {hotel.army_density?.value}%
                            </span>

                            {/* Near Spot - Grey Rounded (was Purple) */}
                            {/* Near Spot - Grey Rounded (was Purple) - REMOVED per user feedback that it's confusing with venue distance */}
                            {/* {hotel.nearest_bts_spot && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center bg-gray-100 text-gray-600 font-medium">
                                Near {hotel.nearest_bts_spot.name}
                              </span>
                            )} */}

                            {/* Drive Time / Distance - Grey Rounded — prefer per-hotel data */}
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center bg-gray-100 text-gray-600 font-medium">
                              {hotel.distance?.display_en || venueDistanceInfo.text}
                            </span>

                            {/* Safety - Grey Rounded (if space permits) - REMOVED per user feedback that it's confusing */}
                          </div>
                        </div>

                        {/* Hidden extra tags container to maintain structure if needed, or just remove */}
                        <div className="hidden"></div>

                        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-3">
                          <div data-layername="Price" className="flex items-center">
                            <span className="text-[12px] font-bold text-green-600 flex items-center gap-1">
                              Visa/Master OK
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              onSelectHotel(hotel.id);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 shrink-0 ${(hotel.type === 'spot' || hotel.type === 'food')
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-purple-700 text-white hover:bg-purple-800'
                              }`}
                          >
                            {(hotel.type === 'spot' || hotel.type === 'food') ? 'View Info' : 'Check Rates'}
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {hotels.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p>No hotels found in this area/category.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}

      {viewMode === 'map' && (
        <div className="fixed inset-0 top-0 left-0 z-0 h-full w-full bg-gray-100">
          <MapContainer
            center={[CITY_COORDS.seoul.lat, CITY_COORDS.seoul.lng]}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <MapClickHandler onMapClick={() => setSelectedMarkerId(null)} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapUpdater center={CITY_COORDS[activeCity]} />

            {(mapData || SPECIAL_LOCATIONS[activeCity]) && (
              <>
                {(mapData?.venue || SPECIAL_LOCATIONS[activeCity]?.venue) && (
                  <Marker
                    position={
                      mapData?.venue
                        ? [mapData.venue.lat, mapData.venue.lng]
                        : [SPECIAL_LOCATIONS[activeCity].venue.lat, SPECIAL_LOCATIONS[activeCity].venue.lng]
                    }
                    icon={createVenueIcon()}
                    interactive={false}
                  />
                )}

                {(mapData?.local_spots || SPECIAL_LOCATIONS[activeCity]?.stations || []).map((spot: any, idx: number) => {
                  const spotName = currentLang === 'en' && spot.name_en ? spot.name_en : spot.name;
                  return (
                    <Marker
                      key={`spot-${idx}`}
                      position={[spot.lat, spot.lng]}
                      icon={createStationIcon(spotName, spot.line)}
                      interactive={false}
                    />
                  );
                })}
              </>
            )}

            {filteredItems.map((item) => {
              const isSelected = selectedMarkerId === item.id;
              let icon;

              if (item.type === 'food') {
                icon = createCategoryIcon('bg-orange-500', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>', isSelected);
              } else if (item.type === 'spot') {
                icon = createCategoryIcon('bg-blue-500', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>', isSelected);
              } else {
                // Default to stay (purple) for all other types (stay, Hotel, Guesthouse, unknown, etc.)
                icon = createCategoryIcon('bg-purple-600', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>', isSelected);
              }

              return (
                <Marker
                  key={item.id}
                  position={[item.coords.lat, item.coords.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      setSelectedMarkerId(item.id);
                    },
                  }}
                />
              );
            })}
          </MapContainer>


          {selectedItem && (
            <div
              className="absolute bottom-6 left-5 right-5 z-[1000] bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex gap-4 items-center cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => onSelectHotel(selectedItem.id)}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                <ImageWithFallback
                  src={selectedItem.image_url || selectedItem.image || ''}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 truncate pr-2 text-[14px]">{selectedItem.name_en || selectedItem.name}</h3>
                  <div className="flex items-center gap-1 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-md">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold">{selectedItem.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                  <MapPin size={10} />
                  {selectedItem.location_desc || activeCity}
                </p>
                <div className="flex items-end justify-between mt-1.5">
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-gray-400 mb-0.5">
                      Check rates
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-lg text-purple-700">
                        View Details
                      </span>
                    </div>
                  </div>
                  <button className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};