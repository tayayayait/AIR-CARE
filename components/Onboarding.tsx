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
          <div className="h-12 w-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-base text-slate-300">전국 데이터를 불러오는 중...</p>
        </div>
      );
    }

    if (error) {
      return <p className="text-base font-medium text-danger-red text-center">{error}</p>;
    }

    if (data) {
      return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="group relative transform-gpu overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent p-[1px] shadow-xl shadow-slate-950/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.8)] sm:translate-y-2">
            <div className="relative flex h-full flex-col items-center justify-center gap-2 rounded-[1.75rem] bg-slate-900/75 px-6 py-8 text-center backdrop-blur-sm ring-1 ring-white/15">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-green/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative text-sm font-medium text-slate-300">주요 지역</p>
              <p className="relative text-3xl font-semibold text-white">{data.locationName}</p>
            </div>
          </div>
          <div className="group relative transform-gpu overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent p-[1px] shadow-xl shadow-slate-950/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.8)] sm:-translate-y-1">
            <div className="relative flex h-full flex-col items-center justify-center gap-2 rounded-[1.75rem] bg-slate-900/75 px-6 py-8 text-center backdrop-blur-sm ring-1 ring-white/15">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-yellow/25 via-transparent to-brand-blue/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative text-sm font-medium text-slate-300">미세먼지 (PM10)</p>
              <p className="relative text-3xl font-bold text-white">{Math.round(data.pm10)} ㎍/㎥</p>
            </div>
          </div>
          <div className="group relative transform-gpu overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent p-[1px] shadow-xl shadow-slate-950/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.8)] sm:translate-y-3">
            <div className="relative flex h-full flex-col items-center justify-center gap-2 rounded-[1.75rem] bg-slate-900/75 px-6 py-8 text-center backdrop-blur-sm ring-1 ring-white/15">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-blue/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative text-sm font-medium text-slate-300">초미세먼지 (PM2.5)</p>
              <p className="relative text-3xl font-bold text-white">{Math.round(data.pm25)} ㎍/㎥</p>
            </div>
          </div>
          <div className="group relative transform-gpu overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-transparent p-[1px] shadow-xl shadow-slate-950/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.8)] sm:col-span-3 sm:mx-auto sm:max-w-2xl sm:translate-y-1">
            <div className="relative flex h-full flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-slate-900/75 px-6 py-8 text-center backdrop-blur-sm ring-1 ring-white/15 sm:px-10 sm:py-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-blue/25 via-brand-green/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="relative text-sm font-medium text-slate-300">상대 습도</p>
              <p className="relative text-4xl font-bold text-white">{Math.round(data.humidity)}%</p>
              <span className="relative text-xs uppercase tracking-[0.2em] text-slate-400">Comfort Guidance</span>
            </div>
          </div>
        </div>
      );
    }

    return <p className="text-base text-center text-slate-300">대기질 정보를 준비하고 있어요.</p>;
  };

  return (
    <section className="relative flex w-full flex-col gap-8 px-6 py-8 text-slate-100 sm:px-10 sm:py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <LogoIcon className="h-12 w-12 text-brand-blue drop-shadow-[0_8px_18px_rgba(56,189,248,0.35)]" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold sm:text-3xl">대한민국 대기질 한눈에 보기</h2>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              전국 주요 지역의 대기질을 요약해 실내 생활 신호를 안내해드려요.
            </p>
          </div>
        </div>
        <div className="max-w-xs text-sm text-slate-400 sm:text-right">
          <p>실시간 데이터를 기반으로 신호가 구성돼요.</p>
          <p>변화가 느껴지면 새로고침해 최신 정보를 확인하세요.</p>
        </div>
      </div>
      {renderContent()}
    </section>
  );
};

export default NationwideOverview;
