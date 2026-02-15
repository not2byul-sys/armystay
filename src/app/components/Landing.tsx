import React from 'react';
import { initialItems } from '@/app/data';
import type { SortOption } from '@/app/App';
import type { City } from '@/app/components/Results';
import { ChevronRight, Calendar, MapPin } from 'lucide-react';

interface LandingProps {
  onSearch: (sortBy?: SortOption, city?: City) => void;
  t: any;
  items: typeof initialItems;
}

export const Landing = ({ onSearch, t, items = initialItems }: LandingProps) => {

  const concerts = [
    {
      id: 'near_gwanghwamun',
      title: 'Seoul',
      date: 'Mar 21, 2026',
      city: 'near_gwanghwamun' as City,
    },
    {
      id: 'goyang',
      title: 'Goyang',
      date: 'Apr 9, 11-12, 2026',
      city: 'goyang' as City,
    },
    {
      id: 'busan',
      title: 'Busan',
      date: 'Jun 12-13, 2026',
      city: 'busan' as City,
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] pb-10 relative">
      {/* Hero Section */}
      <section className="relative px-6 pt-[40px] pb-[220px] bg-purple-900 text-white overflow-hidden pr-[24px] pl-[24px]">
        <div className="relative z-10">
          <h1 className="font-extrabold leading-tight mb-4 tracking-tight whitespace-pre-wrap text-white text-[32px]">
            {t.heroTitle}
          </h1>
          <p className="text-purple-100 leading-relaxed mb-6 whitespace-pre-wrap text-[15px]">
            We find the perfect stays for ARMY.
          </p>
        </div>
      </section>

      {/* Overlapping White Box - Concert Selection */}
      <div className="px-5 -mt-[200px] relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-gray-900 font-bold text-lg mb-4">Select Concert</h2>
          <div className="flex flex-col gap-3">
            {concerts.map((concert) => {
              const count = items.filter(item => item.city === concert.city && item.status !== 'Sold Out').length;

              // D-Day Calculation
              const targetDate = new Date(concert.date.split(',')[0] + ', 2026'); // Simple parse for now or usage derived
              // Better to use specific dates:
              const dDates: Record<string, Date> = {
                'near_gwanghwamun': new Date('2026-03-21'),
                'goyang': new Date('2026-04-09'),
                'busan': new Date('2026-06-12')
              };
              const venues: Record<string, string> = {
                'near_gwanghwamun': 'Gwanghwamun Square',
                'goyang': 'Goyang Stadium',
                'busan': 'Busan Asiad Main Stadium' // Placeholder or specific if known, user said "TBD" earlier but "Gwanghwamun" for Seoul. 
              };

              // Title mapping to match App.tsx change
              const displayTitles: Record<string, string> = {
                'near_gwanghwamun': 'Gwanghwamun',
                'goyang': 'Goyang',
                'busan': 'Busan'
              };

              const today = new Date();
              const target = dDates[concert.id];
              const diffTime = target.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const dDay = diffDays > 0 ? `D-${diffDays}` : (diffDays === 0 ? 'D-DAY' : `D+${Math.abs(diffDays)}`);

              return (
                <button
                  key={concert.id}
                  onClick={() => onSearch('recommended', concert.city)}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:ring-2 hover:ring-inset hover:ring-purple-600 transition-all group active:scale-95 box-border"
                >
                  <div className="text-left flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-gray-900 font-bold text-lg leading-none truncate">{displayTitles[concert.id]}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <MapPin size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">{venues[concert.id]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[36px] text-center shrink-0">
                          {dDay}
                        </span>
                        <span className="text-gray-700">{concert.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-purple-700 whitespace-nowrap">
                      {count} stays
                    </span>
                    <ChevronRight className="text-gray-300 group-hover:text-purple-600 transition-colors" size={24} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
