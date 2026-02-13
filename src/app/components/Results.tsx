import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ChevronRight, Star, Heart, List, Map as MapIcon, Utensils, Camera, X, TrendingUp, CheckCircle, Users, Timer, Calendar, Ticket, AlertCircle, Train, Footprints, Car } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { translations } from '@/translations';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/app/context/AuthContext';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

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

type SortOption = 'recommended' | 'lowest_price' | 'distance' | 'available' | 'popular' | 'army_density' | 'closing_soon';

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
}

type Category = 'all' | 'stay' | 'food' | 'spot';
export type City = 'seoul' | 'goyang' | 'busan' | 'paju' | 'other';

const CITY_COORDS: Record<City, { lat: number; lng: number }> = {
  seoul: { lat: 37.5300, lng: 127.0500 },
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
  goyang: { from: new Date(2026, 5, 14), to: new Date(2026, 5, 15) },
  busan: { from: new Date(2026, 5, 15), to: new Date(2026, 5, 16) },
  paju: { from: new Date(2026, 5, 14), to: new Date(2026, 5, 15) },
  other: { from: new Date(2026, 5, 13), to: new Date(2026, 5, 15) },
};

const cities: { id: City; label: string; dates: string }[] = [
  { id: 'seoul', label: 'Seoul', dates: 'Jun 13-14' },
  { id: 'goyang', label: 'Goyang', dates: 'Jun 14-15' },
  { id: 'busan', label: 'Busan', dates: 'Jun 15-16' },
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

export const Results = ({ onSelectHotel, t, currentLang = 'en', initialSort = 'recommended', initialCity = 'goyang', viewMode, setViewMode, items, mapData, dateRange, setDateRange }: ResultsProps) => {
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



  const getCityLabel = (city: City) => {
    // @ts-ignore
    return t[`city${city.charAt(0).toUpperCase() + city.slice(1)}`];
  };

  const displayDate = dateRange?.from
    ? `${format(dateRange.from, 'MMM d')}${dateRange.to ? ` - ${format(dateRange.to, 'MMM d')}` : ''}`
    : 'Select Dates';

  const { bookmarks, toggleBookmark } = useAuth();

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter items based on city, category, and search query
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const cityMatch = item.city === activeCity;
      const categoryMatch = activeCategory === 'all' || item.type === activeCategory;
      const searchMatch = (() => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
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
      return cityMatch && categoryMatch && searchMatch;
    });

    if (activeCategory === 'stay' || activeCategory === 'all') {
      // Default sort (Recommended)
      filtered.sort((a, b) => {
        const scoreA = (a.rating || 0) * 20 + (100 - (a.distance?.minutes || 100));
        const scoreB = (b.rating || 0) * 20 + (100 - (b.distance?.minutes || 100));
        return scoreB - scoreA;
      });
    }

    return filtered;
  }, [items, activeCity, activeCategory, searchQuery]);

  const hotels = useMemo(() => filteredItems.filter(i => i.type === 'stay'), [filteredItems]);
  const selectedItem = useMemo(() => items.find(i => i.id === selectedMarkerId), [selectedMarkerId, items]);

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'recommended', label: 'All', icon: <List size={12} /> },
    { id: 'distance', label: t.sortDistance, icon: <MapPin size={12} /> },
    { id: 'army_density', label: t.sortArmyDensity, icon: <Users size={12} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-[80px] relative pt-[0px] pr-[0px] pl-[0px]">
      {viewMode === 'map' && (
        <div className="absolute top-0 left-0 right-0 z-[500] p-4 flex flex-col gap-3.5 pointer-events-none">
          <div className="flex justify-between items-center pointer-events-auto">
            <div className="flex gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-purple-100 overflow-x-auto hide-scrollbar max-w-[calc(100vw-80px)]">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setActiveCity(city.id);
                    setSelectedMarkerId(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${activeCity === city.id
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {activeCity === city.id && <MapPin size={12} className="text-white" />}
                  {city.label}
                </button>
              ))}
            </div>


          </div>
        </div>
      )}

      {/* City Tabs */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar scroll-smooth">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setActiveCity(city.id);
                setDateRange?.(CONCERT_DATES[city.id]);
                // Scroll to top when changing city
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-none px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCity === city.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className="flex flex-col items-center">
                <span>{city.label}</span>
                <span className="text-[10px] font-normal mt-0.5 opacity-70">
                  {city.dates}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Search Bar - ADDED */}
        <div className="px-4 py-3 bg-white border-b border-gray-100/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search hotel name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-400"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          <div className="w-full bg-gray-20 pt-[5px] pb-[2px]">
            {/* Date/City filters removed */}
          </div>

          <div className="pr-[0px] pl-[20px] pt-[16px] pb-[10px] mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveSort(option.id)}
                  className={`px-[13px] py-[7px] rounded-lg text-[13px] font-medium transition-all whitespace-nowrap border ${activeSort === option.id
                    ? 'bg-[#333] text-[#FFF] border-0'
                    : 'bg-gray-100 text-[#333] border-0 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1 pt-0">

            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-lg font-bold text-gray-900">{t.bestMatches}</h2>
                <span className="text-xs font-medium text-gray-500">{filteredItems.length} results in {activeCity}</span>
              </div>

              <div className="flex flex-col gap-5" key={`list-${activeCity}-${activeSort}`}>
                {filteredItems.filter(i => i.type === 'stay').map((hotel, index) => {
                  const imageUrl = hotel.image_url || hotel.image || '';
                  const name = hotel.name_en || hotel.name;
                  const price = hotel.price_usd ? `$ ${hotel.price_usd}` : formatPrice(hotel.price);
                  const platform = hotel.booking?.platform;
                  const statusEn = hotel.status_en;
                  const accommodationType = hotel.accommodation_type_name || hotel.display_tags?.type?.en;
                  const rawTags = hotel.tags || [];

                  const tags = rawTags.filter((tag: any): tag is string => typeof tag === 'string' && tag.length > 0);

                  const isLiked = bookmarks.has(hotel.id);

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

                            {isLiked && (
                              <div
                                className="absolute inset-0 rounded-full border-2 border-purple-500 pointer-events-none"
                              />
                            )}

                          </div>
                        </button>

                        <div
                          className="absolute bottom-3 left-3 bg-gray-900 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm z-10"
                          data-layername="Rating"
                        >
                          <Star size={12} fill="currentColor" className="text-yellow-400" />
                          {hotel.rating}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-2 h-full">
                        <div className="flex flex-col gap-1">
                          <h3
                            className="font-bold text-lg text-gray-900 leading-tight break-words"
                            data-layername="Hotel_Name"
                          >
                            {name.replace(/\[.*?\]\s*/g, '')}
                          </h3>

                          {/* Fan tip — auto-generated based on hotel characteristics */}
                          <p className="text-[11px] text-purple-600/80 font-medium mt-0.5 leading-snug">
                            {venueDistanceInfo.isWalk
                              ? '💜 Walking distance to venue — perfect for concert night!'
                              : hotel.safe_return?.transport === 'walk'
                                ? '💜 Walk back after the concert — no taxi needed!'
                                : hotel.safe_return?.last_train
                                  ? `💜 Last train at ${hotel.safe_return.last_train} — plan your exit!`
                                  : '💜 Popular choice among international ARMYs'
                            }
                          </p>

                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 flex-wrap">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-gray-400" />
                              {hotel.area || hotel.location || activeCity.charAt(0).toUpperCase() + activeCity.slice(1)}
                            </div>

                            {accommodationType && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="">
                                  {accommodationType}
                                </div>
                              </>
                            )}

                            {hotel.transport_desc && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  <Train size={12} className="text-gray-400" />
                                  {hotel.transport_desc}
                                </div>
                              </>
                            )}
                          </div>

                          {nearestStation && (
                            <div className="hidden">
                              <Train size={12} className="text-gray-400" />
                              {nearestStation.name} <span className="text-gray-400">({Math.ceil(nearestStation.dist * 15)} min walk)</span>
                            </div>
                          )}

                          <div className="mt-1">
                            {/* Status badges removed */}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {tags?.map((tag: string, i: number) => {
                            const isArmyTag = tag.startsWith('ARMY');
                            return (
                              <span
                                key={i}
                                className={`text-[10.6px] px-2 py-1 rounded-md flex items-center gap-1 ${isArmyTag
                                  ? 'bg-purple-100/80 text-purple-700 font-bold'
                                  : (hotel.display_tags?.trans?.en === tag)
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'bg-gray-100 text-gray-600 font-medium'
                                  }`}
                              >
                                {(hotel.display_tags?.trans?.en === tag) && <MapPin size={10} className="shrink-0" />}
                                {tag}
                              </span>
                            );
                          })}

                          {(() => {
                            const VenueIcon = venueDistanceInfo.icon;
                            return (
                              <span className="text-[10.6px] px-2 py-1 rounded-md flex items-center gap-1 bg-gray-100 text-gray-600 font-medium">
                                <VenueIcon size={10} className="shrink-0" />
                                {venueDistanceInfo.text}
                              </span>
                            );
                          })()}

                          {/* Trust badges */}
                          {hotel.army_density?.value >= 70 && (
                            <span className="text-[10.6px] px-2 py-1 rounded-md flex items-center gap-1 bg-green-50 text-green-700 font-bold border border-green-200">
                              ✓ Verified by ARMY
                            </span>
                          )}

                          <span className="text-[10.6px] px-2 py-1 rounded-md flex items-center gap-1 bg-blue-50 text-blue-600 font-medium">
                            💳 Visa/Master OK
                          </span>

                          {hotel.safe_return && hotel.safe_return.time_min <= 15 && (
                            <span className="text-[10.6px] px-2 py-1 rounded-md flex items-center gap-1 bg-indigo-50 text-indigo-600 font-medium">
                              🌙 Late Return Safe
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-4">
                          <div data-layername="Price">
                            {/* Price removed */}
                          </div>

                          <button
                            onClick={() => {
                              onSelectHotel(hotel.id);
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 shrink-0 bg-purple-700 text-white hover:bg-purple-800`}
                          >
                            Check Rates
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

              if (item.type === 'stay') {
                icon = createCategoryIcon('bg-purple-600', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>', isSelected);
              } else if (item.type === 'food') {
                icon = createCategoryIcon('bg-orange-500', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>', isSelected);
              } else if (item.type === 'spot') {
                icon = createCategoryIcon('bg-blue-500', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>', isSelected);
              } else {
                icon = createCategoryIcon('bg-gray-500', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', isSelected);
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