import React, { useState } from 'react';
import { LogoIcon } from './Icons';
import type { LocationSelection } from '../types';

interface OnboardingProps {
  onSubmit: (location: LocationSelection) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const submitLocation = (selection: LocationSelection) => {
    setGeoError(null);
    onSubmit(selection);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      submitLocation({ city: location.trim() });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('현재 브라우저에서는 위치 정보를 사용할 수 없습니다.');
      return;
    }

    setIsRequestingLocation(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequestingLocation(false);
        submitLocation({
          city: location.trim() || null,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.error(error);
        setIsRequestingLocation(false);
        setGeoError('현재 위치를 가져오는 데 실패했습니다. 위치 권한을 확인하고 다시 시도하세요.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <LogoIcon className="h-16 w-16 text-brand-blue" />
          <h1 className="text-5xl font-bold text-dark-text">에어케어</h1>
        </div>
        <p className="text-medium-text text-lg mb-8">
          내 주변 공기 상태를 위한 간단한 신호를 받아보세요.
        </p>
        <p className="text-dark-text font-medium mb-4">
          시작하려면 도시 이름을 입력하거나 현재 위치를 사용하세요.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 서울특별시"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none transition"
            aria-label="위치 입력"
          />
          <button
            type="submit"
            className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-400"
            disabled={!location.trim()}
          >
            신호 받기
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-full border border-brand-blue text-brand-blue font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-300 disabled:bg-gray-200 disabled:text-gray-500"
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? '현재 위치 확인 중...' : '현재 위치 사용'}
            </button>
            {isRequestingLocation && (
              <span className="absolute inset-y-0 right-4 flex items-center text-sm text-medium-text">
                허용을 선택해주세요
              </span>
            )}
          </div>
        </form>
        {geoError && <p className="text-sm text-danger-red mt-4">{geoError}</p>}
        <p className="text-xs text-gray-400 mt-8">
          에어케어는 현재 위치의 정확한 대기 정보를 제공하기 위해 위치 정보가 필요합니다. 이 정보는 데이터 조회에만 사용되며 절대 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;