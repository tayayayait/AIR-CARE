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
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-primary-soft/80 via-background/80 to-secondary-soft/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-2">
          <LocationIcon className="h-5 w-5 text-ink-muted" />
          <h1 className="text-lg font-semibold text-ink-strong truncate">{locationName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 text-ink-muted hover:text-ink-strong transition-colors disabled:opacity-50"
            aria-label="데이터 새로고침"
          >
            <RefreshIcon className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <ShareButton />
        </div>
      </div>
    </header>
  );
};

export default Header;