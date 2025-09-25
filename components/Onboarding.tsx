import React, { useState } from 'react';
import { LogoIcon } from './Icons';

interface OnboardingProps {
  onSubmit: (location: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSubmit }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSubmit(location.trim());
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <LogoIcon className="h-16 w-16 text-brand-blue" />
          <h1 className="text-5xl font-bold text-dark-text">에어케어</h1>
        </div>
        <p className="text-medium-text text-lg mb-8">
          내 주변 공기 상태를 위한 간단한 신호를 받아보세요.
        </p>
        <p className="text-dark-text font-medium mb-4">
          시작하려면 도시 이름을 입력하세요.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 서울특별시"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none transition"
            aria-label="위치 입력"
          />
          <button
            type="submit"
            className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-400"
            disabled={!location.trim()}
          >
            신호 받기
          </button>
        </form>
         <p className="text-xs text-gray-400 mt-8">
            에어케어는 현재 위치의 정확한 대기 정보를 제공하기 위해 위치 정보가 필요합니다. 이 정보는 데이터 조회에만 사용되며 절대 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;