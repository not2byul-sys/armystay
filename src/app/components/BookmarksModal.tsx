import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Star, MapPin, ChevronRight, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookmarksModalProps {
    items: any[];
    onSelectHotel: (id: string) => void;
    t: any;
}

export const BookmarksModal = ({ items, onSelectHotel, t }: BookmarksModalProps) => {
    const { bookmarks, toggleBookmark, isAuthenticated, setShowLoginModal, showBookmarksModal, setShowBookmarksModal } = useAuth();

    const likedItems = items.filter(item => bookmarks.has(item.id));

    const formatPrice = (price: number) => {
        // @ts-ignore
        const rate = t.currencyRate || 1;
        // @ts-ignore
        const symbol = t.currencySymbol || '$';

        const converted = Math.round(price * rate);
        return `${symbol}${converted.toLocaleString()}`;
    };

    if (!showBookmarksModal) return null;

    const handleClose = () => setShowBookmarksModal(false);

    const handleHotelClick = (id: string) => {
        onSelectHotel(id);
        handleClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
            <div
                onClick={handleClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-white w-full max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-purple-700 p-6 text-white relative shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">My Saved Stays</h2>
                            <p className="text-purple-100/80 text-sm font-medium">
                                {isAuthenticated ? `${likedItems.length} items` : 'Sign in to view'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {!isAuthenticated ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] p-5 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <Heart size={40} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Log in to view bookmarks</h3>
                            <p className="text-gray-500 max-w-xs mb-6">
                                Sign in to see your saved hotels and stays.
                            </p>
                            <button
                                onClick={() => {
                                    handleClose();
                                    setShowLoginModal(true);
                                }}
                                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors"
                            >
                                Log In / Sign Up
                            </button>
                        </div>
                    ) : likedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] p-5 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <Heart size={40} fill="currentColor" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookmarks Yet</h3>
                            <p className="text-gray-500 max-w-xs">
                                Tap the heart icon on any hotel to save it here for later.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 p-5">
                            {likedItems.map((hotel, index) => (
                                <motion.div
                                    key={hotel.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleHotelClick(hotel.id)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex h-32 cursor-pointer group hover:shadow-md transition-shadow"
                                >
                                    <div className="w-32 h-32 shrink-0 bg-gray-200 relative">
                                        <ImageWithFallback
                                            src={hotel.image || ''}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleBookmark(hotel.id);
                                            }}
                                            className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-purple-700 hover:scale-110 transition-transform shadow-sm"
                                        >
                                            <Heart size={14} fill="currentColor" />
                                        </button>
                                    </div>

                                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">
                                                    {hotel.name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-[10px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded shrink-0">
                                                    <Star size={8} fill="currentColor" />
                                                    {hotel.rating}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                                <MapPin size={10} />
                                                {hotel.location}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 line-through">
                                                    {hotel.originalPrice && formatPrice(hotel.originalPrice)}
                                                </span>
                                                <span className="text-lg font-extrabold text-gray-900 leading-none">
                                                    {hotel.price_usd ? `$${hotel.price_usd}` : `$${hotel.price}`}
                                                </span>
                                            </div>
                                            <button className="bg-purple-100 text-purple-700 p-2 rounded-lg group-hover:bg-purple-700 group-hover:text-white transition-colors">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
