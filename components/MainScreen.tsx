import React, { useEffect, useMemo, useState } from 'react';
import type { SignalData, Coordinates, RawAirData } from '../types';
import ErrorDisplay from './ErrorDisplay';
import Header from './Header';
import { MaskIcon, VentilateIcon, HumidifyIcon } from './Icons';
import MapView from './MapView';
import NationwideOverview from './Onboarding';
import SignalSheet, { SignalSheetItem } from './SignalSheet';

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

  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 640px)');

    const handleChange = () => {
      setIsDesktop(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsMapExpanded(true);
      }
    };

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const signalItems: SignalSheetItem[] = useMemo(() => {
    if (!signalData) return [];

    return [
      {
        key: 'mask',
        label: '마스크',
        isOn: signalData.isMaskOn,
        icon: <MaskIcon />,
        onColor: 'bg-danger-soft text-danger',
        offColor: 'bg-gray-100 text-ink-muted',
        recommendation: signalData.isMaskOn ? '착용 권장' : '필요 없음',
      },
      {
        key: 'ventilate',
        label: '환기',
        isOn: signalData.isVentilateOn,
        icon: <VentilateIcon />,
        onColor: 'bg-primary-soft text-primary',
        offColor: 'bg-gray-100 text-ink-muted',
        recommendation: signalData.isVentilateOn ? '환기 권장' : '창문 닫기',
      },
      {
        key: 'humidify',
        label: '가습',
        isOn: signalData.isHumidifyOn,
        icon: <HumidifyIcon />,
        onColor: 'bg-secondary-soft text-secondary',
        offColor: 'bg-gray-100 text-ink-muted',
        recommendation: signalData.isHumidifyOn ? '가습 권장' : '습도 적정',
      },
    ];
  }, [signalData]);

  const effectiveMapExpanded = isDesktop || isMapExpanded;

  return (
    <div
      className="relative isolate min-h-screen w-full overflow-hidden bg-ocean-dawn flex flex-col items-center before:content-[''] before:absolute before:-top-56 before:-left-32 before:h-[36rem] before:w-[36rem] before:rounded-full before:bg-gradient-to-br before:from-primary/30 before:via-secondary/20 before:to-white/10 before:blur-3xl before:opacity-80 before:-z-10 after:content-[''] after:absolute after:-bottom-64 after:-right-24 after:h-[40rem] after:w-[40rem] after:rounded-full after:bg-gradient-to-br after:from-secondary/25 after:via-primary/20 after:to-white/5 after:blur-3xl after:opacity-70 after:-z-10"
    >
      <Header locationName={locationName} onRefresh={onRefresh} />
      <main className="relative z-10 flex-grow flex flex-col items-center w-full gap-6 px-4 sm:px-6 pt-6 pb-36 sm:pb-12">
        <div className="w-full max-w-4xl">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/30 bg-white/20 backdrop-blur-3xl shadow-[0_25px_70px_-30px_rgba(18,40,76,0.65)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_90px_-30px_rgba(18,40,76,0.7)]">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/30 via-white/10 to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-px rounded-[2.45rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
            <NationwideOverview data={nationwideData} isLoading={isLoading} error={error} />
          </div>
        </div>
        <div className="w-full max-w-2xl">
          <div
            className={[
              'relative rounded-3xl border border-white/10 bg-background/80 backdrop-blur',
              'shadow-2xl transition-all duration-500 overflow-hidden',
              effectiveMapExpanded ? 'max-h-[32rem]' : 'max-h-[9rem] sm:max-h-[32rem]',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-ink-strong">현재 위치</h2>
                <p className="text-sm text-ink-muted">{locationName}</p>
              </div>
              <button
                type="button"
                className="sm:hidden inline-flex items-center rounded-full bg-gradient-to-r from-primary-soft to-secondary-soft px-3 py-1.5 text-xs font-semibold text-ink-strong shadow-md"
                onClick={() => setIsMapExpanded((prev) => !prev)}
                aria-expanded={effectiveMapExpanded}
                aria-controls="location-map"
              >
                {effectiveMapExpanded ? '숨기기' : '확대'}
              </button>
            </div>
            <div
              id="location-map"
              className={[
                'px-5 pb-5 transition-[max-height,opacity] duration-500 ease-out',
                effectiveMapExpanded ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0 sm:max-h-[28rem] sm:opacity-100',
                'overflow-hidden',
              ].join(' ')}
            >
              <div className="h-64 sm:h-80">
                <MapView
                  coordinates={coordinates}
                  locationName={locationName}
                  onRequestLocation={onRequestLocation}
                  isLocating={isLocating}
                  isExpanded={effectiveMapExpanded}
                />
              </div>
            </div>
          </div>
        </div>
        {error && (
          <ErrorDisplay
            message={error}
            lastUpdated={lastUpdated ? `마지막 성공 업데이트: ${timeAgo}` : ''}
          />
        )}
      </main>
      <footer className="w-full text-center p-4 text-ink-muted">
        {lastUpdated && !error && `업데이트: ${timeAgo}`}
      </footer>
      <SignalSheet
        title="실내 케어 신호"
        description={lastUpdated && !error ? `업데이트: ${timeAgo}` : undefined}
        signalItems={signalItems}
        isLoading={isLoading}
        errorMessage={error}
        emptyMessage="전국 대기질 정보를 불러오면 신호가 표시됩니다."
      />
    </div>
  );
};

export default MainScreen;