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
      const stats = [
        {
          key: 'location',
          label: '주요 지역',
          value: data.locationName,
          valueClass: 'text-2xl font-semibold text-ink-strong',
          wrapperClass: '',
        },
        {
          key: 'pm10',
          label: '미세먼지 (PM10)',
          value: `${Math.round(data.pm10)} ㎍/㎥`,
          valueClass: 'text-3xl font-bold text-ink-strong',
          wrapperClass: '',
        },
        {
          key: 'pm25',
          label: '초미세먼지 (PM2.5)',
          value: `${Math.round(data.pm25)} ㎍/㎥`,
          valueClass: 'text-3xl font-bold text-ink-strong',
          wrapperClass: '',
        },
        {
          key: 'humidity',
          label: '상대 습도',
          value: `${Math.round(data.humidity)}%`,
          valueClass: 'text-3xl font-bold text-ink-strong',
          wrapperClass: 'sm:col-span-3 sm:max-w-2xl sm:mx-auto',
        },
      ];

      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.key} className={`group relative ${stat.wrapperClass}`}>
              <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white/70 via-white/20 to-white/5 p-[1px] transition-all duration-500 group-hover:from-white/80 group-hover:via-white/25 group-hover:to-white/10">
                <div className="relative flex h-full transform-gpu translate-y-1 flex-col items-center justify-center gap-2 rounded-[1.67rem] bg-white/15 px-6 py-6 text-center backdrop-blur-xl shadow-[0_20px_45px_-25px_rgba(16,38,74,0.65)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-28px_rgba(16,38,74,0.7)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[1.67rem] bg-gradient-to-br from-white/35 via-transparent to-white/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">{stat.label}</p>
                  <p className={stat.valueClass}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-base text-ink-muted text-center">대기질 정보를 준비하고 있어요.</p>;
  };

  return (
    <section className="relative z-10 w-full px-6 py-8 sm:px-10 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 via-secondary/70 to-white/60 shadow-[0_18px_35px_-18px_rgba(9,103,255,0.65)]">
            <div className="absolute inset-[2px] rounded-[1.35rem] bg-white/15 backdrop-blur-xl" />
            <LogoIcon className="relative z-10 h-10 w-10 text-white drop-shadow-[0_6px_10px_rgba(9,103,255,0.45)]" />
          </div>
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
