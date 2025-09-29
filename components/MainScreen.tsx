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
        <p className="text-medium-text text-center text-base">
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
    return (
      <p className="text-medium-text text-center text-base">
        전국 대기질 정보를 불러오면 신호가 표시됩니다.
      </p>
    );
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_#0b1220,_#020617_65%)] p-4 text-slate-100 sm:p-6
      before:absolute before:-left-32 before:top-[-10%] before:h-3/4 before:w-96 before:rounded-full before:bg-[radial-gradient(circle,_rgba(56,189,248,0.35),_transparent_70%)] before:blur-3xl before:content-[''] before:opacity-80
      after:absolute after:-right-40 after:bottom-[-15%] after:h-[28rem] after:w-[32rem] after:rounded-full after:bg-[radial-gradient(circle,_rgba(16,185,129,0.3),_transparent_70%)] after:blur-3xl after:content-[''] after:opacity-70"
    >
      <Header locationName={locationName} onRefresh={onRefresh} />
      <main className="relative flex w-full flex-grow flex-col items-center gap-8 py-8">
        <div className="w-full max-w-5xl">
          <div className="group relative transform-gpu transition-all duration-500 ease-out hover:-translate-y-1">
            <div className="absolute inset-4 -z-10 rounded-[2.25rem] bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 bg-clip-padding shadow-[0_32px_80px_-40px_rgba(15,23,42,0.75)] backdrop-blur-2xl transition-shadow duration-500 group-hover:shadow-[0_40px_95px_-45px_rgba(15,23,42,0.85)]">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_70%)] opacity-50" />
              <div className="relative z-10">
                <NationwideOverview data={nationwideData} isLoading={isLoading} error={error} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-2xl">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">현재 위치</h2>
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
      <footer className="w-full p-4 text-center text-slate-400">
        {lastUpdated && !error && `업데이트: ${timeAgo}`}
      </footer>
    </div>
  );
};

export default MainScreen;