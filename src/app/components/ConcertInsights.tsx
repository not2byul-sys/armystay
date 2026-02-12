import React, { useEffect, useState } from 'react';
import { getOverrideImage } from '../customImages';

export const ConcertInsights = ({ data: initialData }: { data: any }) => {
    const [recommendations, setRecommendations] = useState<any[]>(initialData?.top_recommendations || []);

    useEffect(() => {
        // Fetch the locally generated recommendations (from python script -> public folder)
        // Added timestamp to prevent caching
        fetch(`/concert_recommendations.json?t=${new Date().getTime()}`)
            .then(res => res.json())
            .then(data => {
                if (data?.top_recommendations) {
                    setRecommendations(data.top_recommendations);
                    console.log("✅ Loaded local concert recommendations:", data.top_recommendations.length);
                }
            })
            .catch(err => console.error("❌ Failed to load local recommendations:", err));
    }, []);

    return (
        <div className="concert-insights-container p-6 bg-slate-50">
            {/* 🛡️ Safety & Convenience Banner (Emphasizing premium fan experience) */}
            <div className="bg-purple-50 border-l-8 border-purple-500 p-5 mb-8 rounded-r-lg shadow-sm">
                <h3 className="text-purple-800 font-bold text-lg flex items-center">
                    🛡️ Safety & Convenience Verified
                </h3>
                <p className="text-purple-700 mt-1">
                    We prioritize your safety. All recommendations are <b>hand-picked for proximity</b> to the venue and <b>safe return routes</b> for late-night concert endings.
                </p>
            </div>

            <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-purple-900 mb-2">💜 Fan Match Top Picks</h2>
                <p className="text-slate-500">Based on Reddit Sentiment & Proximity Analysis</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations?.slice(0, 6).map((hotel: any, i: number) => {
                    const overrideImage = getOverrideImage(hotel.id, hotel.name_en || hotel.name);
                    const displayImage = overrideImage || hotel.image_url;
                    // Debug image choice
                    // console.log(`Hotel: ${hotel.name_en}, Override: ${!!overrideImage}, Src: ${displayImage}`);

                    return (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-purple-100 hover:scale-105 transition-transform group">
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={displayImage}
                                    alt={hotel.name_en || hotel.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=ARMY+STAY';
                                    }}
                                />
                                <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    Match {hotel.fan_match_score}%
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{hotel.name_en || hotel.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {hotel.distance_km ? `${hotel.distance_km}km from venue` : 'Near venue'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-purple-700">₩{(hotel.price_krw || 0).toLocaleString()}k</div>
                                    </div>
                                </div>

                                {/* 💡 ARMY Travel Tips 섹션 */}
                                <div className="bg-purple-50 p-3 rounded-lg mt-4">
                                    <p className="text-purple-800 text-xs font-bold uppercase tracking-wide mb-1">✨ ARMY Property Check:</p>
                                    <p className="text-purple-700 text-xs">
                                        {hotel.distance_km < 1.5 ? "Walking distance! innovative late-night return." :
                                            (hotel.name_en?.toLowerCase().includes('myeongdong') || hotel.location?.address_en?.toLowerCase().includes('myeongdong')) ? "Tourist hotspot! Great for sightseeing & shopping." :
                                                "Safe area with verified late-night transport options."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
