import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    initialQuery?: string;
}

export const SearchModal = ({ isOpen, onClose, onSearch, initialQuery = '' }: SearchModalProps) => {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery);
            // Focus input after animation
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, initialQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
        onClose();
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    // Common search terms for suggestions
    const allSuggestions = [
        'Gwanghwamun', 'Hongdae', 'Gangnam', 'Myeongdong', 'Itaewon', 'Busan', 'Haeundae'
    ];

    const filteredSuggestions = query
        ? allSuggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
        : allSuggestions;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-0 sm:pb-0">
                    <div
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="bg-white w-full max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl relative z-10 h-[90vh] sm:h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
                            <button
                                onClick={onClose}
                                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <form onSubmit={handleSubmit} className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search hotel, area, or station..."
                                    className="w-full bg-transparent text-lg font-medium placeholder-gray-400 focus:outline-none"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-0">
                            <div className="py-2">
                                {query && filteredSuggestions.length > 0 ? (
                                    <div>
                                        {filteredSuggestions.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    setQuery(term);
                                                    onSearch(term);
                                                    onClose();
                                                }}
                                                className="w-full text-left px-6 py-4 text-[15px] text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 border-b border-gray-50 last:border-none transition-colors"
                                            >
                                                <Search size={18} className="text-gray-400 shrink-0" />
                                                <span className="font-medium">{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-6 py-6">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4">Popular Areas</h3>
                                        <div className="flex flex-col">
                                            {allSuggestions.map((term) => (
                                                <button
                                                    key={term}
                                                    onClick={() => {
                                                        setQuery(term);
                                                        onSearch(term);
                                                        onClose();
                                                    }}
                                                    className="w-full text-left py-3 text-[15px] text-gray-700 hover:text-purple-700 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                                        <Search size={14} />
                                                    </div>
                                                    <span className="font-medium">{term}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredSuggestions.length === 0 && query && (
                                    <div className="px-6 py-8 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">No results found</p>
                                        <p className="text-gray-500 text-sm">Try searching for a different keyword</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence >
    );
};
