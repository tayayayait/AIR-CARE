import React, { useMemo } from 'react';
import type { SignalData, Coordinates, RawAirData } from '../types';
import Header from './Header';
import { MaskIcon, VentilateIcon, HumidifyIcon } from './Icons';
import MapView from './MapView';
import NationwideOverview from './Onboarding';
import SignalSheet, { SignalTileDefinition } from './SignalSheet';

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

  const signalTiles: SignalTileDefinition[] = useMemo(() => {
    if (!signalData) return [];

    return [
      {
        id: 'mask',
        label: '마스크',
        isOn: signalData.isMaskOn,
        icon: <MaskIcon />,
        onColor: 'bg-red-100 text-danger-red',
        offColor: 'bg-gray-100 text-medium-text',
        recommendation: signalData.isMaskOn ? '착용 권장' : '필요 없음',
      },
      {
        id: 'ventilate',
        label: '환기',
        isOn: signalData.isVentilateOn,
        icon: <VentilateIcon />,
        onColor: 'bg-blue-100 text-brand-blue',
        offColor: 'bg-gray-100 text-medium-text',
        recommendation: signalData.isVentilateOn ? '환기 권장' : '창문 닫기',
      },
      {
        id: 'humidify',
        label: '가습',
        isOn: signalData.isHumidifyOn,
        icon: <HumidifyIcon />,
        onColor: 'bg-green-100 text-brand-green',
        offColor: 'bg-gray-100 text-medium-text',
        recommendation: signalData.isHumidifyOn ? '가습 권장' : '습도 적정',
      },
    ];
  }, [signalData]);

  const lastUpdatedLabel = lastUpdated ? `마지막 성공 업데이트: ${timeAgo}` : undefined;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-light-bg">
      <Header locationName={locationName} onRefresh={onRefresh} />
      <main className="flex-grow flex flex-col items-center w-full gap-6 px-4 sm:px-6 py-6 pb-44 sm:pb-16">
        <NationwideOverview data={nationwideData} isLoading={isLoading} error={error} />
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-dark-text mb-3 flex items-center justify-between">
            <span>현재 위치</span>
            <span className="text-sm text-medium-text">환경 변화를 지도에서 확인하세요.</span>
          </h2>
          <MapView
            coordinates={coordinates}
            locationName={locationName}
            onRequestLocation={onRequestLocation}
            isLocating={isLocating}
          />
        </div>
      </main>
      <footer className="w-full text-center px-4 py-4 text-medium-text pb-24 sm:pb-6">
        {lastUpdated && !error && `업데이트: ${timeAgo}`}
      </footer>
      <SignalSheet
        tiles={signalTiles}
        isLoading={isLoading}
        error={error}
        emptyMessage="전국 대기질 정보를 불러오면 신호가 표시됩니다."
        lastUpdatedLabel={lastUpdatedLabel}
      />
    </div>
  );
};

export default MainScreen;