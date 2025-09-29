
import React from 'react';

interface SignalIconProps {
  label: string;
  isOn: boolean;
  icon: React.ReactNode;
  onColor: string;
  offColor: string;
  recommendation: string;
}

const SignalIcon: React.FC<SignalIconProps> = ({ label, isOn, icon, onColor, offColor, recommendation }) => {
  const baseClasses =
    'relative flex flex-col items-center justify-center p-4 sm:p-6 aspect-square rounded-2xl shadow-md transition-transform duration-500 ease-out transform hover:scale-105 backdrop-blur-sm';
  const animationClasses = isOn ? 'animate-signal-float' : '';
  const colorClasses = isOn ? onColor : offColor;
  const iconWrapperClasses =
    'relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 transition-all duration-500 ease-out overflow-visible';
  const activeIconStyles =
    'bg-gradient-to-br from-brand-primary to-brand-secondary text-white badge-glow ring-2 ring-white/40';
  const inactiveIconStyles = `${colorClasses} shadow-[inset_0_4px_10px_rgba(255,255,255,0.2)] ring-1 ring-black/5`;

  return (
    <div className={`${baseClasses} ${animationClasses} ${isOn ? 'bg-white/95' : 'bg-white/80'}`}>
      <div className={`${iconWrapperClasses} ${isOn ? activeIconStyles : inactiveIconStyles}`}>
        <div
          className={`absolute inset-[18%] rounded-full bg-white/40 blur-lg transition-opacity duration-500 ease-out ${
            isOn ? 'opacity-80' : 'opacity-0'
          }`}
        />
        <div className="relative z-[1] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-xl font-bold text-dark-text">{label}</h3>
      <p
        className={`text-sm sm:text-base font-medium transition-transform transition-opacity duration-500 ease-out ${
          isOn
            ? 'text-dark-text opacity-100 translate-y-0'
            : 'text-medium-text opacity-80 -translate-y-1'
        }`}
      >
        {recommendation}
      </p>
    </div>
  );
};

export default SignalIcon;
