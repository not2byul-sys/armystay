import React from 'react';
import { Check, List, Map, Heart, User, LogIn } from 'lucide-react';

import * as Popover from '@radix-ui/react-popover';
import { Language } from '@/translations';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  onHome?: () => void;
  onSearch?: () => void;
  onBookmarks?: () => void;
  viewMode?: 'list' | 'map';
  setViewMode?: (mode: 'list' | 'map') => void;

  isAuthenticated: boolean;
  user: SupabaseUser | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

export const Header = ({
  onHome,
  onSearch,
  onBookmarks,
  viewMode,
  setViewMode,
  isAuthenticated,
  user,
  onLoginClick,
  onProfileClick,
  onLogoutClick
}: HeaderProps) => {


  const handleBookmarksClick = () => {
    // Simply delegate to parent handler regardless of auth state
    onBookmarks?.();
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      onProfileClick();
    } else {
      onLoginClick();
    }
  };

  return (
    <header className="fixed top-0 z-[100] w-full max-w-md left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className={`${viewMode === 'map' ? 'fixed top-0 left-0 right-0 w-full' : 'fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md'} z-[100] px-5 bg-white border-b border-gray-100 h-14 flex items-center justify-between transition-all duration-300`}>
        <button
          onClick={onHome}
          className="p-2 -ml-2 text-[#333] hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        {viewMode && setViewMode && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-full flex items-center px-[4px] py-[3.6px]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              LIST
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              MAP
            </button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleUserClick}
            className="p-2 text-[#333] hover:bg-gray-100 rounded-full transition-colors"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>
          {onBookmarks && (
            <button
              onClick={handleBookmarksClick}
              className="p-2 text-[#333] hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className="w-[22px] h-[22px]" strokeWidth={2} />
            </button>
          )}

        </div>
      </div>
    </header>

  );
};
