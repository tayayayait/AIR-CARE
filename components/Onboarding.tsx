import React from 'react';
import type { RawAirData } from '../types';
import { LogoIcon } from './Icons';

interface NationwideOverviewProps {
  data: RawAirData | null;
  isLoading: boolean;
  error: string | null;
}

const NationwideOverview: React.FC<NationwideOverviewProps> = ({ data, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-base text-ink-muted">전국 데이터를 불러오는 중...</p>
        </div>
      );
    }

    if (error) {
      return <p className="text-base font-medium text-danger text-center">{error}</p>;
    }

    if (data) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-surface p-4 text-center">
            <p className="text-sm text-ink-muted">주요 지역</p>
            <p className="text-2xl font-semibold text-ink-strong">{data.locationName}</p>
          </div>
          <div className="rounded-2xl bg-surface p-4 text-center">
            <p className="text-sm text-ink-muted">미세먼지 (PM10)</p>
            <p className="text-3xl font-bold text-ink-strong">{Math.round(data.pm10)} ㎍/㎥</p>
          </div>
          <div className="rounded-2xl bg-surface p-4 text-center">
            <p className="text-sm text-ink-muted">초미세먼지 (PM2.5)</p>
            <p className="text-3xl font-bold text-ink-strong">{Math.round(data.pm25)} ㎍/㎥</p>
          </div>
          <div className="rounded-2xl bg-surface p-4 text-center sm:col-span-3 sm:max-w-md sm:mx-auto">
            <p className="text-sm text-ink-muted">상대 습도</p>
            <p className="text-3xl font-bold text-ink-strong">{Math.round(data.humidity)}%</p>
          </div>
        </div>
      );
    }

    return <p className="text-base text-ink-muted text-center">대기질 정보를 준비하고 있어요.</p>;
  };

  return (
    <section className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-md p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <LogoIcon className="h-12 w-12 text-primary" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-strong">대한민국 대기질 한눈에 보기</h2>
            <p className="text-ink-muted text-base sm:text-lg">
              전국 주요 지역의 대기질을 요약해 실내 생활 신호를 안내해드려요.
            </p>
          </div>
        </div>
        <div className="text-sm text-ink-muted sm:text-right">
          <p>실시간 데이터를 기반으로 신호가 구성돼요.</p>
          <p>변화가 느껴지면 새로고침해 최신 정보를 확인하세요.</p>
        </div>
      </div>
      {renderContent()}
    </section>
  );
};

export default NationwideOverview;
