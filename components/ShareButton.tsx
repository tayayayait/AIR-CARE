import React from 'react';
import { ShareIcon } from './Icons';

const ShareButton: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: '에어케어 앱',
      text: "에어케어를 사용해서 간단한 대기질 신호를 받고 있어요. 마스크 착용, 환기, 가습이 필요한 때를 알려줘요. 한번 사용해보세요!",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        alert('사용 중인 브라우저에서는 공유 기능을 지원하지 않습니다.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 text-medium-text hover:text-dark-text transition-colors"
      aria-label="이 앱 공유하기"
    >
      <ShareIcon className="h-6 w-6" />
    </button>
  );
};

export default ShareButton;