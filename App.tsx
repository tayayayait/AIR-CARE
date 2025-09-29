import React, { useState, useEffect, useCallback } from 'react';
import MainScreen from './components/MainScreen';
import { getAirQualityData } from './services/geminiService';
import type { Coordinates, RawAirData, SignalData } from './types';

const NATIONWIDE_QUERY = '대한민국';

const App: React.FC = () => {
  const [rawAirData, setRawAirData] = useState<RawAirData | null>(null);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [activeLocationQuery, setActiveLocationQuery] = useState<string>(NATIONWIDE_QUERY);
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('대한민국 주요 지역');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const processSignalLogic = useCallback((data: RawAirData): SignalData => {
    const isMaskOn = data.pm10 > 80 || data.pm25 > 35;
    const isVentilateOn = !isMaskOn;
    const isHumidifyOn = data.humidity < 40;

    return { isMaskOn, isVentilateOn, isHumidifyOn };
  }, []);

  const fetchData = useCallback(async (query: string, displayName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAirQualityData(query);
      setRawAirData(data);
      setSignalData(processSignalLogic(data));
      setLastUpdated(new Date());
      setActiveLocationQuery(query);
      setActiveLocationLabel(displayName ?? query);
    } catch (err) {
      console.error(err);
      setError('데이터를 불러올 수 없습니다. 연결 상태를 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [processSignalLogic]);

  const resolveLocationQuery = useCallback(async ({ latitude, longitude }: Coordinates) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko&zoom=10`,
        {
          headers: {
            'Accept': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();
      const address = data.address ?? {};

      const locality =
        address.neighbourhood ||
        address.suburb ||
        address.quarter ||
        address.borough ||
        address.village ||
        address.town ||
        address.city_district ||
        address.district ||
        address.county;
      const city =
        address.city ||
        address.municipality ||
        address.state_district ||
        address.state ||
        address.region;
      const province = address.state || address.region || address.country;

      const displayName = [locality, city].filter(Boolean).join(', ') || city || province || NATIONWIDE_QUERY;
      const query = [locality, city].filter(Boolean).join(' ') || city || province || NATIONWIDE_QUERY;

      return { query, displayName } as const;
    } catch (geoError) {
      console.error('Failed to resolve location name', geoError);
      throw new Error('현재 위치 정보를 확인할 수 없습니다.');
    }
  }, []);

  useEffect(() => {
    void fetchData(NATIONWIDE_QUERY, '대한민국 주요 지역');
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    void fetchData(activeLocationQuery, activeLocationLabel);
  }, [activeLocationLabel, activeLocationQuery, fetchData]);

  const handleRequestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('이 기기에서는 위치 서비스를 사용할 수 없습니다.');
      return;
    }

    setError(null);
    setIsLocating(true);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        } satisfies Coordinates;

        try {
          const { query, displayName } = await resolveLocationQuery(nextCoordinates);
          setCoordinates(nextCoordinates);
          setActiveLocationLabel(displayName);
          await fetchData(query, displayName);
        } catch (geoError) {
          console.error(geoError);
          setError('현재 위치의 대기질 정보를 불러오지 못했습니다.');
          setIsLoading(false);
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setError('위치 정보를 가져오는 데 실패했습니다. 위치 접근 권한을 확인해주세요.');
        setIsLocating(false);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [fetchData, resolveLocationQuery]);

  const headerLocationName = coordinates
    ? activeLocationLabel
    : activeLocationLabel
      ? `${activeLocationLabel} · 전국 요약`
      : '대한민국 대기질 요약';

  return (
    <MainScreen
      locationName={headerLocationName}
      nationwideData={rawAirData}
      coordinates={coordinates}
      signalData={signalData}
      isLoading={isLoading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      onRequestLocation={handleRequestLocation}
      isLocating={isLocating}
    />
  );
};

export default App;