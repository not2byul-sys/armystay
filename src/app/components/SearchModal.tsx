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
                <div className="fixed inset-0 z-[200] flex justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
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
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-3">
                                    {query ? 'Related Searches' : 'Popular Areas'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {filteredSuggestions.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => {
                                                setQuery(term);
                                                onSearch(term);
                                                onClose();
                                            }}
                                            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                                        >
                                            <Search size={14} className="inline mr-1 -mt-0.5 text-gray-400" />
                                            {term}
                                        </button>
                                    ))}
                                    {filteredSuggestions.length === 0 && query && (
                                        <div className="text-gray-400 text-sm py-2">
                                            No related searches found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Helper text */}
                            <div className="text-center text-gray-400 mt-10 text-sm">
                                Press Enter to search
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence >
    );
};
