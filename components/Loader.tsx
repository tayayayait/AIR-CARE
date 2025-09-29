import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-blue"></div>
      <p className="text-lg text-medium-text">대기질 데이터를 가져오는 중...</p>
    </div>
  );
};

export default Loader;