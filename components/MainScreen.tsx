import React, { useMemo } from 'react';
import type { SignalData, Coordinates, RawAirData } from '../types';
import SignalIcon from './SignalIcon';
import ErrorDisplay from './ErrorDisplay';
import Header from './Header';
import { MaskIcon, VentilateIcon, HumidifyIcon } from './Icons';
import MapView from './MapView';
import NationwideOverview from './Onboarding';

interface MainScreenProps {
  locationName: string;
  coordinates: Coordinates | null;
  nationwideData: RawAirData | null;
  signalData: SignalData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onRequestLocation: () => void;
  isLocating: boolean;
}

const MainScreen: React.FC<MainScreenProps> = ({
  locationName,
  coordinates,
  nationwideData,
  signalData,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
  onRequestLocation,
  isLocating,
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
      return (
        <p className="text-ink-muted text-center text-base">
          전국 데이터를 불러오는 중입니다...
        </p>
      );
    }
    if (error) {
      return (
        <ErrorDisplay
          message={error}
          lastUpdated={lastUpdated ? `마지막 성공 업데이트: ${timeAgo}` : ''}
        />
      );
    }
    if (signalData) {
      return (
        <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl">
          <SignalIcon
            label="마스크"
            isOn={signalData.isMaskOn}
            icon={<MaskIcon />}
            onColor="bg-danger-soft text-danger"
            offColor="bg-gray-100 text-ink-muted"
            recommendation={signalData.isMaskOn ? "착용 권장" : "필요 없음"}
          />
          <SignalIcon 
            label="환기" 
            isOn={signalData.isVentilateOn} 
            icon={<VentilateIcon />}
            onColor="bg-primary-soft text-primary"
            offColor="bg-gray-100 text-ink-muted"
            recommendation={signalData.isVentilateOn ? "환기 권장" : "창문 닫기"}
          />
          <SignalIcon 
            label="가습" 
            isOn={signalData.isHumidifyOn} 
            icon={<HumidifyIcon />}
            onColor="bg-secondary-soft text-secondary"
            offColor="bg-gray-100 text-ink-muted"
            recommendation={signalData.isHumidifyOn ? "가습 권장" : "습도 적정"}
          />
        </div>
      );
    }
    return (
      <p className="text-ink-muted text-center text-base">
        전국 대기질 정보를 불러오면 신호가 표시됩니다.
      </p>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 bg-background">
      <Header locationName={locationName} onRefresh={onRefresh} />
      <main className="flex-grow flex flex-col items-center w-full gap-6 py-6">
        <NationwideOverview data={nationwideData} isLoading={isLoading} error={error} />
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-ink-strong mb-3">현재 위치</h2>
          <MapView
            coordinates={coordinates}
            locationName={locationName}
            onRequestLocation={onRequestLocation}
            isLocating={isLocating}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          {renderContent()}
        </div>
      </main>
      <footer className="w-full text-center p-4 text-ink-muted">
        {lastUpdated && !error && `업데이트: ${timeAgo}`}
      </footer>
    </div>
  );
};

export default MainScreen;