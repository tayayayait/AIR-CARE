import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import SignalIcon from './SignalIcon';
import ErrorDisplay from './ErrorDisplay';

interface SignalTileDefinition {
  id: string;
  label: string;
  isOn: boolean;
  icon: ReactNode;
  onColor: string;
  offColor: string;
  recommendation: string;
}

interface SignalSheetProps {
  tiles: SignalTileDefinition[];
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  lastUpdatedLabel?: string;
}

const COLLAPSED_PEEK = 168;

const SignalSheet: React.FC<SignalSheetProps> = ({
  tiles,
  isLoading,
  error,
  emptyMessage,
  lastUpdatedLabel,
}) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const [isExpanded, setIsExpanded] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 640 : true));

  useEffect(() => {
    const updateIsMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) {
        setIsExpanded(true);
        setDragDelta(0);
      }
    };

    window.addEventListener('resize', updateIsMobile);
    updateIsMobile();

    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    if (!sheetRef.current) return;

    const updateHeight = () => {
      if (!sheetRef.current) return;
      setSheetHeight(sheetRef.current.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(sheetRef.current);

    return () => resizeObserver.disconnect();
  }, [tiles, isLoading, error, isMobile]);

  const collapsedOffset = useMemo(
    () => (isMobile ? Math.max(0, sheetHeight - COLLAPSED_PEEK) : 0),
    [isMobile, sheetHeight],
  );

  const translateY = useMemo(() => {
    if (!isMobile) return 0;

    const base = isExpanded ? 0 : collapsedOffset;
    const combined = base + dragDelta;
    return Math.min(collapsedOffset, Math.max(0, combined));
  }, [collapsedOffset, dragDelta, isExpanded, isMobile]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isMobile) return;

    setIsDragging(true);
    startYRef.current = event.clientY;
    setDragDelta(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isMobile || !isDragging) return;
    setDragDelta(event.clientY - startYRef.current);
  };

  const finishInteraction = () => {
    if (!isMobile) return;

    const delta = dragDelta;

    if (Math.abs(delta) < 12) {
      setIsExpanded((prev) => !prev);
    } else if (delta < 0) {
      setIsExpanded(true);
    } else if (delta > 0) {
      setIsExpanded(false);
    }

    setDragDelta(0);
    setIsDragging(false);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!isMobile || !isDragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    finishInteraction();
  };

  const handlePointerCancel = () => {
    if (!isMobile || !isDragging) return;
    setDragDelta(0);
    setIsDragging(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <p className="text-base text-medium-text text-center">전국 데이터를 불러오는 중입니다…</p>
      );
    }

    if (error) {
      return <ErrorDisplay message={error} lastUpdated={lastUpdatedLabel} />;
    }

    if (tiles.length > 0) {
      return (
        <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory">
          {tiles.map((tile) => (
            <div key={tile.id} className="snap-center sm:snap-none min-w-[200px] sm:min-w-0">
              <SignalIcon
                label={tile.label}
                isOn={tile.isOn}
                icon={tile.icon}
                onColor={tile.onColor}
                offColor={tile.offColor}
                recommendation={tile.recommendation}
              />
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-base text-medium-text text-center">{emptyMessage}</p>;
  };

  const wrapperClasses = isMobile
    ? 'fixed inset-x-0 bottom-0 z-40 px-4 pb-6'
    : 'relative w-full flex justify-center sm:mt-6';

  const sheetClasses = [
    'pointer-events-auto mx-auto w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border border-white/40',
    'bg-gradient-to-tr from-brand-blue/10 via-white/95 to-brand-green/10 backdrop-blur-xl shadow-[0_-12px_32px_rgba(52,152,219,0.2)]',
    'transition-transform duration-300 ease-out',
  ].join(' ');

  return (
    <div className={wrapperClasses} style={isMobile ? { paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' } : undefined}>
      <div
        ref={sheetRef}
        className={sheetClasses}
        style={{
          transform: isMobile ? `translateY(${translateY}px)` : undefined,
          transition: isMobile && isDragging ? 'none' : undefined,
        }}
      >
        <div className="flex flex-col gap-6 px-5 sm:px-8 pt-4 pb-6 sm:py-8">
          <button
            type="button"
            className="mx-auto flex h-8 w-20 items-center justify-center rounded-full bg-dark-text/10 hover:bg-dark-text/20 transition-colors"
            aria-label={isExpanded ? '신호 패널 축소' : '신호 패널 확장'}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            <span className="sr-only">{isExpanded ? '신호 패널 축소' : '신호 패널 확장'}</span>
            <div className="h-1.5 w-12 rounded-full bg-dark-text/40" />
          </button>
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-dark-text">오늘의 공기질 신호</h2>
            <p className="text-sm text-medium-text sm:text-base">건강을 위한 맞춤 행동을 확인해보세요.</p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export type { SignalTileDefinition };
export default SignalSheet;
