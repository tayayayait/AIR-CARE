import React, { useState } from 'react';
import ShareButton from './ShareButton';
import { LocationIcon, RefreshIcon } from './Icons';

interface HeaderProps {
  locationName: string;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ locationName, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    // Prevent spamming the refresh button
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-brand-blue/90 via-brand-green/80 to-brand-blue/90 shadow-lg border-b border-white/10">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 py-3 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <LocationIcon className="h-5 w-5 text-white/90" />
          <h1 className="text-lg font-semibold text-white truncate drop-shadow-sm">{locationName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-full text-white/80 hover:text-white transition-colors disabled:opacity-60"
            aria-label="데이터 새로고침"
          >
            <RefreshIcon className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <ShareButton className="p-2 rounded-full text-white/80 hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;