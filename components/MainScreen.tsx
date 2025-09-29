import React, { useMemo } from 'react';
import type { SignalData, Coordinates } from '../types';
import SignalIcon from './SignalIcon';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import Header from './Header';
import { MaskIcon, VentilateIcon, HumidifyIcon } from './Icons';
import MapView from './MapView';

interface MainScreenProps {
  locationName: string;
  coordinates: Coordinates | null;
  signalData: SignalData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onRequestLocation: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({
  locationName,
  coordinates,
  signalData,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
  onRequestLocation,
}) => {
    
  const timeAgo = useMemo(() => {
    if (!lastUpdated) return '';
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "개월 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    if (seconds < 10) return "방금 전";
    return Math.floor(seconds) + "초 전";
  }, [lastUpdated]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return <ErrorDisplay message={error} lastUpdated={lastUpdated ? `마지막 성공 업데이트: ${timeAgo}`: ''} />;
    }
    if (signalData) {
      return (
        <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl">
          <SignalIcon 
            label="마스크" 
            isOn={signalData.isMaskOn} 
            icon={<MaskIcon />}
            onColor="bg-red-100 text-danger-red"
            offColor="bg-gray-100 text-medium-text"
            recommendation={signalData.isMaskOn ? "착용 권장" : "필요 없음"}
          />
          <SignalIcon 
            label="환기" 
            isOn={signalData.isVentilateOn} 
            icon={<VentilateIcon />}
            onColor="bg-blue-100 text-brand-blue"
            offColor="bg-gray-100 text-medium-text"
            recommendation={signalData.isVentilateOn ? "환기 권장" : "창문 닫기"}
          />
          <SignalIcon 
            label="가습" 
            isOn={signalData.isHumidifyOn} 
            icon={<HumidifyIcon />}
            onColor="bg-green-100 text-brand-green"
            offColor="bg-gray-100 text-medium-text"
            recommendation={signalData.isHumidifyOn ? "가습 권장" : "습도 적정"}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 bg-light-bg">
      <Header locationName={locationName} onRefresh={onRefresh} />
      <main className="flex-grow flex flex-col items-center w-full gap-6 py-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-dark-text">현재 위치</h2>
            <button
              type="button"
              onClick={onRequestLocation}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-medium',
                'bg-brand-blue text-white shadow hover:bg-brand-blue/90 transition',
              ].join(' ')}
            >
              내 위치
            </button>
          </div>
          <MapView
            coordinates={coordinates}
            locationName={locationName}
            onRequestLocation={onRequestLocation}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          {renderContent()}
        </div>
      </main>
      <footer className="w-full text-center p-4 text-medium-text">
        {lastUpdated && !error && `업데이트: ${timeAgo}`}
      </footer>
    </div>
  );
};

export default MainScreen;