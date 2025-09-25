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
    <header className="w-full max-w-5xl mx-auto flex justify-between items-center p-2">
      <div className="flex items-center gap-2">
        <LocationIcon className="h-5 w-5 text-medium-text" />
        <h1 className="text-lg font-semibold text-dark-text truncate">{locationName}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="p-2 text-medium-text hover:text-dark-text transition-colors disabled:opacity-50"
          aria-label="데이터 새로고침"
        >
          <RefreshIcon className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        <ShareButton />
      </div>
    </header>
  );
};

export default Header;