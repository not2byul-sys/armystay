import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Search, Shield, Wallet, Coffee, ChevronRight, X, Sparkles, TrendingDown, Home, Users, MapPin, CheckCircle, Ticket } from 'lucide-react';
import { clsx } from 'clsx';
import { translations } from '@/translations';
import { initialItems } from '@/app/data';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import type { SortOption } from '@/app/App';
import type { City } from '@/app/components/Results';

interface LandingProps {
  onSearch: (sortBy?: SortOption, city?: City) => void;
  t: typeof translations['en'];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  stats?: {
    availableCount: number;
    lowestPrice: number;
  };
  items: typeof initialItems;
}

export const Landing = ({ onSearch, t, dateRange, setDateRange, stats, items = initialItems }: LandingProps) => {
  const [preferences, setPreferences] = useState<string[]>(['venue']);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isConcertOpen, setIsConcertOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>('goyang');
  const [selectedConcert, setSelectedConcert] = useState<string>('Goyang');

  // Statistics Calculation - use props if available, otherwise calculate fallback
  const stayItems = items.filter(item => item.type === 'stay');
  const totalStays = stats?.availableCount ?? stayItems.length;
  const minPrice = stats?.lowestPrice ?? Math.min(...stayItems.map(item => item.price));

  // Currency Conversion
  // @ts-ignore
  const rate = t.currencyRate || 1;
  // @ts-ignore
  const symbol = t.currencySymbol || '$';

  const minPriceConverted = Math.round(minPrice * rate);
  const minPriceFormatted = minPriceConverted.toLocaleString();


  // Toggle preference logic
  const togglePreference = (id: string) => {
    setPreferences(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };


  // Special Dates
  const ticketOpenDate = new Date(2026, 4, 20); // May 20, 2026
  const concertDates = [
    new Date(2026, 5, 10),
    new Date(2026, 5, 11),
    new Date(2026, 5, 12),
    new Date(2026, 5, 13),
    new Date(2026, 5, 14),
    new Date(2026, 5, 15),
  ];

  const modifiers = {
    ticket: ticketOpenDate,
    concert: concertDates,
  };

  const modifiersStyles = {
    ticket: { color: 'white', backgroundColor: '#eab308', fontWeight: 'bold' }, // yellow-500
    concert: { color: 'white', backgroundColor: '#7e22ce', fontWeight: 'bold' }, // purple-700
  };

  const handleDateSelect = (range: DateRange | undefined, selectedDay: Date) => {
    if (dateRange?.from && dateRange?.to) {
      setDateRange({ from: selectedDay, to: undefined });
    } else {
      setDateRange(range);
    }
  };

  const handleConfirmDate = () => {
    setIsCalendarOpen(false);
  };

  // Custom formatting for the display date range
  const displayDate = dateRange?.from
    ? `${format(dateRange.from, 'MMM d')}${dateRange.to ? ` - ${format(dateRange.to, 'MMM d')}` : ''}`
    : t.dateValue;

  // City formatting
  const getCityLabel = (city: City) => {
    // @ts-ignore
    return t[`city${city.charAt(0).toUpperCase() + city.slice(1)}`] || city;
  };

  const concerts = [
    {
      id: 'seoul',
      title: 'seoul',
      date: 'Mar 21, 2026',
      location: 'Gwanghwamun Square',
      city: 'seoul' as City,
      dateRange: {
        from: new Date(2026, 2, 21),
        to: new Date(2026, 2, 22)
      }
    },
    {
      id: 'goyang',
      title: 'Goyang',
      date: 'Apr 9, 11-12, 2026',
      location: 'Goyang Stadium',
      city: 'goyang' as City,
      dateRange: {
        from: new Date(2026, 3, 9),
        to: new Date(2026, 3, 12)
      }
    },
    {
      id: 'busan',
      title: 'Busan',
      date: 'Jun 12-13, 2026',
      location: 'Stay Tune',
      city: 'busan' as City,
      dateRange: {
        from: new Date(2026, 5, 12),
        to: new Date(2026, 5, 13)
      }
    }
  ];

  const handleConcertSelect = (concert: typeof concerts[0]) => {
    setSelectedConcert(concert.title);
    setSelectedCity(concert.city);
    setDateRange(concert.dateRange);
    setIsConcertOpen(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] pb-10 relative">
      {/* Hero Section */}
      <section className="relative px-6 pt-[40px] pb-[80px] bg-purple-900 text-white overflow-hidden pr-[24px] pl-[24px]">

        <div
          className="relative z-10"
        >
          <h1 className="font-extrabold leading-tight mb-4 tracking-tight whitespace-pre-wrap text-white text-[32px]">
            {t.heroTitle}
          </h1>
          <p className="text-purple-100 leading-relaxed mb-6 whitespace-pre-wrap text-[15px]">
            We find the perfect stays for ARMY.
          </p>

          {/* Concert Schedule */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-lg relative z-20">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Ticket className="w-4 h-4 text-purple-300" />
              <span className="text-xs font-bold tracking-widest text-purple-100 uppercase">2026 Tour Schedule</span>
            </div>

            {/* D-Day calculation helper */}
            {(() => {
              const getDDay = (targetDate: Date) => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
                const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diff > 0) return `D-${diff}`;
                if (diff === 0) return 'D-DAY';
                return `D+${Math.abs(diff)}`;
              };

              const concertCards = [
                {
                  id: 'seoul',
                  city: 'seoul' as City,
                  targetDate: new Date(2026, 2, 21),
                  eventName: 'Seoul',
                  eventType: 'Comeback Show',
                  venue: 'Gwanghwamun Square · Mar 21',
                  dateRange: { from: new Date(2026, 2, 21), to: new Date(2026, 2, 22) },
                },
                {
                  id: 'goyang',
                  city: 'goyang' as City,
                  targetDate: new Date(2026, 3, 9),
                  eventName: 'Goyang',
                  eventType: 'Concert',
                  venue: 'Goyang Stadium · Apr 9, 11, 12',
                  dateRange: { from: new Date(2026, 3, 9), to: new Date(2026, 3, 12) },
                },
                {
                  id: 'busan',
                  city: 'busan' as City,
                  targetDate: new Date(2026, 5, 12),
                  eventName: 'Busan',
                  eventType: 'Concert',
                  venue: 'TBD · Jun 12, 13',
                  dateRange: { from: new Date(2026, 5, 12), to: new Date(2026, 5, 13) },
                },
              ];

              // Filter out past concerts
              const upcomingConcerts = concertCards.filter(c => !getDDay(c.targetDate).startsWith('D+'));

              return (
                <div className="space-y-2">
                  {upcomingConcerts.map((concert) => {
                    const dDay = getDDay(concert.targetDate);
                    return (
                      <div key={concert.id} className="bg-black/20 rounded-lg flex items-center gap-3 p-[12px]">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white leading-tight mb-0.5 truncate flex items-center gap-1.5">
                            {concert.eventName} <span className="text-[10px] font-normal text-purple-200">{concert.eventType}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${dDay === 'D-DAY' ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-400 text-gray-900'}`}>{dDay}</span>
                          </h3>
                          <p className="text-[11px] text-gray-300 truncate">{concert.venue}</p>
                        </div>
                        <button
                          onClick={() => {
                            setDateRange(concert.dateRange);
                            onSearch('recommended', concert.city);
                          }}
                          className="bg-white text-purple-900 text-[12px] font-bold px-[12px] py-[6px] rounded-full hover:bg-purple-50 transition-colors whitespace-nowrap shadow-sm"
                        >
                          Find Stays {items.filter(item => item.city === concert.city && item.status !== 'Sold Out').length}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ); /* end getDDay IIFE */
            })()}
          </div>
        </div>
      </section>

      {/* Filter Section - Overlapping the Hero */}
      <div className="px-5 -mt-12 relative z-20">
        <div
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-[20px]"
        >
          {/* Date and Concert Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">{t.dateLabel} & Concert</label>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() => setIsConcertOpen(true)}
                className="flex-1 flex items-center gap-3 p-3 bg-[rgb(249,249,249)] rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors text-left group cursor-pointer p-[12px]"
              >
                <MapPin size={22} className="text-[#333] group-hover:scale-110 transition-transform shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-gray-900 font-medium text-[14px] truncate block font-bold">
                    {selectedConcert}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex-1 flex items-center gap-3 p-3 bg-[rgb(249,249,249)] rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors text-left group cursor-pointer p-[12px]"
              >
                <Calendar size={22} className="text-[#333] group-hover:scale-110 transition-transform shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-gray-900 font-medium text-[14px] font-bold truncate block">
                    {dateRange ? displayDate : t.dateValue}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">{t.preferLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'venue', icon: Sparkles, label: t.sortDistance },
                { id: 'budget', icon: Wallet, label: t.prefBudget },
                { id: 'safety', icon: Users, label: t.prefSafety },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'all') {
                      setPreferences(['all']);
                    } else {
                      setPreferences(prev => {
                        const withoutAll = prev.filter(p => p !== 'all');
                        return withoutAll.includes(item.id)
                          ? withoutAll.filter(p => p !== item.id)
                          : [...withoutAll, item.id];
                      });
                    }
                  }}
                  className={clsx(
                    "flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200",
                    preferences.includes(item.id)
                      ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm scale-100"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <span className="text-xs font-medium whitespace-nowrap text-[13px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              let sortOption: SortOption = 'recommended';
              if (preferences.includes('safety')) sortOption = 'army_density';
              else if (preferences.includes('budget')) sortOption = 'lowest_price';
              else if (preferences.includes('venue')) sortOption = 'distance';

              onSearch(sortOption, selectedCity);
            }}
            className="w-full py-[14px] bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 group px-[0px]"
          >
            {t.ctaFind}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Concert Picker Modal */}

      {isConcertOpen && (
        <>
          <div
            onClick={() => setIsConcertOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100]"
          />
          <div
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[320px] bg-white rounded-t-3xl md:rounded-3xl z-[101] overflow-hidden shadow-2xl"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Ticket size={20} className="text-purple-600" />
                  Select Concert
                </h3>
                <button
                  onClick={() => setIsConcertOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {concerts.map((concert) => (
                  <button
                    key={concert.id}
                    onClick={() => handleConcertSelect(concert)}
                    className={clsx(
                      "flex flex-col p-4 rounded-xl border transition-all text-left gap-1",
                      selectedConcert === concert.title
                        ? "bg-purple-50 border-purple-500 shadow-md"
                        : "bg-white border-gray-100 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className={clsx("font-bold text-sm", selectedConcert === concert.title ? "text-purple-700" : "text-gray-900")}>
                        {concert.title}
                      </span>
                      {selectedConcert === concert.title && <CheckCircle size={18} className="text-purple-600" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      {concert.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} />
                      {concert.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}


      {/* Date Picker Modal */}

      {isCalendarOpen && (
        <>
          <div
            onClick={() => setIsCalendarOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100]"
          />
          <div
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[360px] bg-white rounded-t-3xl md:rounded-3xl z-[101] overflow-hidden shadow-2xl"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  {t.dateLabel}
                </h3>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex justify-center bg-gray-50 rounded-2xl p-2 mb-4">
                <style>{`
                    .rdp { --rdp-accent-color: #7e22ce; margin: 0; }
                    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f3e8ff; }
                    .rdp-day_selected { background-color: rgba(126, 34, 206, 0.1); color: #7e22ce; font-weight: bold; }
                    .rdp-day_concert:not(.rdp-day_selected) { border: 2px solid #7e22ce; color: #7e22ce; font-weight: bold; }
                  `}</style>
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  defaultMonth={new Date(2026, 5)} // June 2026
                  modifiers={{
                    concert: [
                      new Date(2026, 5, 10),
                      new Date(2026, 5, 11),
                      new Date(2026, 5, 12),
                      new Date(2026, 5, 13),
                      new Date(2026, 5, 14),
                      new Date(2026, 5, 15),
                    ]
                  }}
                />
              </div>

              <button
                onClick={handleConfirmDate}
                className="w-full py-3 bg-purple-700 text-white rounded-xl font-bold shadow-lg hover:bg-purple-800 active:scale-95 transition-all"
              >
                {/* @ts-ignore */}
                {t.confirmDate || 'Select Date'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
