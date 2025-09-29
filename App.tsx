import React, { useState, useEffect, useCallback } from 'react';
import MainScreen from './components/MainScreen';
import { getAirQualityData } from './services/geminiService';
import type { RawAirData, SignalData } from './types';

const NATIONWIDE_QUERY = '대한민국';

const App: React.FC = () => {
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAirQualityData(NATIONWIDE_QUERY);
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

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <MainScreen
      locationName={
        rawAirData ? `${rawAirData.locationName} · 전국 요약` : '대한민국 대기질 요약'
      }
      nationwideData={rawAirData}
      coordinates={null}
      signalData={signalData}
      isLoading={isLoading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={handleRefresh}
    />
  );
};

export default App;