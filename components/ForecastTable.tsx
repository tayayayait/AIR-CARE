import React, { useMemo } from 'react';
import type { ForecastRow } from '../types';
import { PRECIPITATION_TYPE_LABELS, SKY_CONDITION_LABELS } from '../types';

interface ForecastTableProps {
  rows: ForecastRow[];
  isLoading: boolean;
}

const formatDateLabel = (fcstDate: string) => {
  if (fcstDate.length !== 8) return fcstDate;
  const month = Number(fcstDate.slice(4, 6));
  const day = Number(fcstDate.slice(6, 8));
  return `${month}월 ${day}일`;
};

const formatTimeLabel = (fcstTime: string) => {
  if (fcstTime.length < 2) return fcstTime;
  const hour = fcstTime.slice(0, 2);
  return `${hour}시`;
};

const ForecastTable: React.FC<ForecastTableProps> = ({ rows, isLoading }) => {
  const displayedRows = useMemo(() => rows.slice(0, 12), [rows]);

  if (isLoading && displayedRows.length === 0) {
    return (
      <section className="relative rounded-3xl border border-white/10 bg-background/80 backdrop-blur px-6 py-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-strong">단기 예보</h2>
            <p className="text-sm text-ink-muted">기상청 마을예보 (TMP, POP, PTY, SKY)</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden />
          <p className="text-sm text-ink-muted">예보 데이터를 불러오는 중...</p>
        </div>
      </section>
    );
  }

  if (displayedRows.length === 0) {
    return (
      <section className="relative rounded-3xl border border-white/10 bg-background/80 backdrop-blur px-6 py-6 shadow-2xl">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-lg font-semibold text-ink-strong">단기 예보</h2>
            <p className="text-sm text-ink-muted">기상청 마을예보 (TMP, POP, PTY, SKY)</p>
          </div>
        </div>
        <p className="text-sm text-ink-muted">표시할 예보 데이터가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/80 backdrop-blur shadow-2xl">
      <div className="flex items-center justify-between px-6 pt-6 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-ink-strong">단기 예보</h2>
          <p className="text-sm text-ink-muted">기상청 마을예보 (TMP, POP, PTY, SKY)</p>
        </div>
      </div>
      <div className="px-6 pb-6">
        <div className="overflow-hidden rounded-2xl bg-slate-900/70 text-slate-100">
          <table className="min-w-full table-fixed text-left text-xs font-mono sm:text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-200 uppercase tracking-wider">
                <th className="px-4 py-3">일자</th>
                <th className="px-4 py-3">시간</th>
                <th className="px-4 py-3">기온 (℃)</th>
                <th className="px-4 py-3">강수확률 (%)</th>
                <th className="px-4 py-3">강수형태</th>
                <th className="px-4 py-3">하늘상태</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row) => {
                const precipitationLabel =
                  PRECIPITATION_TYPE_LABELS[row.precipitationType] ?? '정보 없음';
                const skyLabel = SKY_CONDITION_LABELS[row.skyCondition] ?? '정보 없음';
                return (
                  <tr key={`${row.fcstDate}-${row.fcstTime}`} className="border-t border-slate-800/70">
                    <td className="px-4 py-2 align-top text-slate-200">{formatDateLabel(row.fcstDate)}</td>
                    <td className="px-4 py-2 align-top text-slate-200">{formatTimeLabel(row.fcstTime)}</td>
                    <td className="px-4 py-2 align-top text-slate-50">{row.temperature.toFixed(1)}</td>
                    <td className="px-4 py-2 align-top text-slate-50">{`${Math.round(row.precipitationProbability)}%`}</td>
                    <td className="px-4 py-2 align-top text-slate-50">{precipitationLabel}</td>
                    <td className="px-4 py-2 align-top text-slate-50">{skyLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ForecastTable;
