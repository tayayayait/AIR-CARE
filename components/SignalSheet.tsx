import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SignalIcon from './SignalIcon';

export interface SignalSheetItem {
  key: string;
  label: string;
  isOn: boolean;
  icon: React.ReactNode;
  onColor: string;
  offColor: string;
  recommendation: string;
}

interface SignalSheetProps {
  title?: string;
  description?: string;
  signalItems: SignalSheetItem[];
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
}

const MOBILE_COLLAPSED_HEIGHT = 132;

const SignalSheet: React.FC<SignalSheetProps> = ({
  title = '실내 케어 신호',
  description,
  signalItems,
  isLoading = false,
  errorMessage,
  emptyMessage = '전국 대기질 정보를 불러오면 신호가 표시됩니다.',
}) => {
  const hasSignals = signalItems.length > 0 && !isLoading && !errorMessage;

  const message = useMemo(() => {
    if (isLoading) {
      return '전국 데이터를 불러오는 중입니다...';
    }
    if (errorMessage) {
      return errorMessage;
    }
    return emptyMessage;
  }, [emptyMessage, errorMessage, isLoading]);

  const messageTone = errorMessage ? 'text-danger' : 'text-ink-muted';

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef(0);
  const startTranslateRef = useRef(0);
  const latestTranslateRef = useRef(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  latestTranslateRef.current = translateY;

  const updateMetrics = useCallback(() => {
    if (!sheetRef.current) return;
    const fullHeight = sheetRef.current.scrollHeight;
    const collapsedOffset = Math.max(fullHeight - MOBILE_COLLAPSED_HEIGHT, 0);
    setMaxTranslate(collapsedOffset);
    if (!isExpanded && !isDragging) {
      setTranslateY(collapsedOffset);
      latestTranslateRef.current = collapsedOffset;
    }
  }, [isDragging, isExpanded]);

  useEffect(() => {
    updateMetrics();
  }, [updateMetrics, signalItems, isLoading, errorMessage, emptyMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => updateMetrics();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateMetrics]);

  useEffect(() => {
    if (isDragging) return;
    const target = isExpanded ? 0 : maxTranslate;
    setTranslateY(target);
    latestTranslateRef.current = target;
  }, [isDragging, isExpanded, maxTranslate]);

  const beginDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) ||
        maxTranslate <= 0
      ) {
        return;
      }
      event.preventDefault();
      setIsDragging(true);
      startYRef.current = event.clientY;
      startTranslateRef.current = latestTranslateRef.current;
    },
    [maxTranslate],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => {
      const diff = event.clientY - startYRef.current;
      const next = Math.min(Math.max(startTranslateRef.current + diff, 0), maxTranslate);
      setTranslateY(next);
      latestTranslateRef.current = next;
    };

    const handleRelease = () => {
      setIsDragging(false);
      const shouldExpand = latestTranslateRef.current < maxTranslate / 2;
      setIsExpanded(shouldExpand);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleRelease);
    window.addEventListener('pointercancel', handleRelease);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleRelease);
      window.removeEventListener('pointercancel', handleRelease);
    };
  }, [isDragging, maxTranslate]);

  const toggleExpansion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const desktopContent = hasSignals ? (
    <div className="grid grid-cols-3 gap-6">
      {signalItems.map((item) => (
        <SignalIcon key={item.key} {...item} />
      ))}
    </div>
  ) : (
    <p className={`text-sm ${messageTone} text-center py-6`}>{message}</p>
  );

  const mobileContent = hasSignals ? (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-1 px-1">
      {signalItems.map((item) => (
        <div key={item.key} className="snap-center shrink-0 w-56">
          <SignalIcon {...item} />
        </div>
      ))}
    </div>
  ) : (
    <p className={`text-sm ${messageTone} text-center py-4`}>{message}</p>
  );

  return (
    <>
      <div className="hidden sm:flex w-full justify-center">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-background/80 backdrop-blur px-8 py-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink-strong">{title}</h2>
              {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
            </div>
          </div>
          <div className="mt-6">{desktopContent}</div>
        </div>
      </div>

      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
        <div
          ref={sheetRef}
          className={`rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-500 ${
            isDragging ? 'duration-0' : ''
          }`}
          style={{ transform: `translateY(${translateY}px)` }}
        >
          <div className="flex flex-col">
            <div
              className="flex flex-col items-center gap-2 pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={beginDrag}
            >
              <span className="h-1.5 w-16 rounded-full bg-white/40" />
              <button
                type="button"
                onClick={toggleExpansion}
                className="text-xs font-semibold text-ink-muted"
                aria-label={isExpanded ? '신호 패널 접기' : '신호 패널 펼치기'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? '아래로 내리기' : '위로 올리기'}
              </button>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-ink-strong">{title}</h2>
                {description && <span className="text-xs text-ink-muted">{description}</span>}
              </div>
              <div className="mt-3">{mobileContent}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignalSheet;
