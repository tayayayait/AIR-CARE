import React, { useState, useEffect, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import MainScreen from './components/MainScreen';
import { getAirQualityData } from './services/geminiService';
import type { RawAirData, SignalData, LocationSelection } from './types';

const App: React.FC = () => {
  const [locationSelection, setLocationSelection] = useState<LocationSelection | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [rawAirData, setRawAirData] = useState<RawAirData | null>(null);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const processSignalLogic = useCallback((data: RawAirData): SignalData => {
    const isMaskOn = data.pm10 > 80 || data.pm25 > 35;
    const isVentilateOn = !isMaskOn;
    const isHumidifyOn = data.humidity < 40;
    
    return { isMaskOn, isVentilateOn, isHumidifyOn };
  }, []);
  
  const fetchData = useCallback(async (loc: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAirQualityData(loc);
      setRawAirData(data);
      setSignalData(processSignalLogic(data));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('데이터를 불러올 수 없습니다. 연결 상태를 확인하고 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [processSignalLogic]);

  const formatLocationQuery = useCallback((selection: LocationSelection): string | null => {
    const parts: string[] = [];
    if (selection.city) {
      parts.push(selection.city);
    }
    if (selection.coordinates) {
      const { latitude, longitude } = selection.coordinates;
      parts.push(`위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`);
    }
    return parts.length ? parts.join(' | ') : null;
  }, []);

  useEffect(() => {
    if (locationSelection) {
      const query = formatLocationQuery(locationSelection);
      if (query) {
        setLastQuery(query);
        fetchData(query);
      } else {
        setError('위치를 확인할 수 없습니다. 다시 시도해주세요.');
      }
    }
  }, [locationSelection, formatLocationQuery, fetchData]);

  const updateLocationSelection = useCallback((newLocation: LocationSelection) => {
    setRawAirData(null);
    setSignalData(null);
    setLastUpdated(null);
    setLocationSelection(newLocation);
  }, []);

  const handleLocationSubmit = (newLocation: LocationSelection) => {
    updateLocationSelection(newLocation);
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('현재 브라우저에서 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const selection: LocationSelection = {
          city: null,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        };
        updateLocationSelection(selection);
      },
      (geoError) => {
        console.error(geoError);
        setError('현재 위치를 가져오지 못했습니다. 위치 권한을 확인해주세요.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [updateLocationSelection]);

  const handleRefresh = () => {
    if (lastQuery) {
      fetchData(lastQuery);
    }
  };

  if (!locationSelection) {
    return <Onboarding onSubmit={handleLocationSubmit} />;
  }

  return (
    <MainScreen
      locationName={
        locationSelection.city
          ? rawAirData?.locationName || locationSelection.city
          : '현재 위치'
      }
      coordinates={locationSelection.coordinates || null}
      signalData={signalData}
      isLoading={isLoading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
      onRequestLocation={handleUseCurrentLocation}
    />
  );
};

export default App;