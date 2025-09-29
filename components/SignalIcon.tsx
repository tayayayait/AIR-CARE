
import React from 'react';

interface SignalIconProps {
  label: string;
  isOn: boolean;
  icon: React.ReactNode;
  onColor: string;
  offColor: string;
  recommendation: string;
}

const extractPrefixedClasses = (classNames: string, prefix: string) =>
  classNames
    .split(' ')
    .filter((cls) => cls.startsWith(prefix))
    .join(' ');

const SignalIcon: React.FC<SignalIconProps> = ({ label, isOn, icon, onColor, offColor, recommendation }) => {
  const baseClasses =
    'relative flex flex-col items-center justify-center p-4 sm:p-6 aspect-square rounded-2xl transition-all duration-300 transform hover:scale-105';
  const containerStateClasses = isOn ? 'bg-white/95 shadow-xl animate-signal-active' : 'bg-white shadow-sm';

  const offBackgroundClasses = extractPrefixedClasses(offColor, 'bg-');
  const activeTextClasses = extractPrefixedClasses(onColor, 'text-');
  const inactiveTextClasses = extractPrefixedClasses(offColor, 'text-');
  const iconTextClasses = isOn ? activeTextClasses : inactiveTextClasses;

  const iconWrapperBaseClasses =
    'relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 transition-all duration-500 overflow-hidden';
  const iconWrapperStateClasses = isOn
    ? 'bg-gradient-to-br from-brand-primary to-brand-secondary signal-badge-glow'
    : `${offBackgroundClasses} shadow-inner`;

  return (
    <div className={`${baseClasses} ${containerStateClasses}`}>
      <div className={`${iconWrapperBaseClasses} ${iconWrapperStateClasses}`}>
        {isOn && (
          <div className="absolute inset-[-10%] rounded-full bg-brand-primary/20 blur-2xl opacity-80" aria-hidden />
        )}
        {isOn && (
          <div className="absolute inset-0 rounded-full bg-white/15 mix-blend-soft-light" aria-hidden />
        )}
        <div className={`relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 ${iconTextClasses}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-xl font-bold text-ink-strong">{label}</h3>
      <p
        className={`text-sm sm:text-base font-medium transition-transform transition-opacity duration-500 ease-out transform ${
          isOn ? 'text-ink-strong opacity-100 translate-y-0' : 'text-ink-muted opacity-80 translate-y-1'
        }`}
      >
        {recommendation}
      </p>
    </div>
  );
};

export default SignalIcon;
