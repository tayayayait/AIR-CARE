
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
  const baseClasses = 'flex flex-col items-center justify-center p-4 sm:p-6 aspect-square rounded-2xl shadow-sm transition-all duration-300 transform hover:scale-105';
  const colorClasses = isOn ? onColor : offColor;
  const iconWrapperClasses = 'flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 transition-colors duration-300';

  return (
    <div className={`${baseClasses} ${isOn ? 'bg-white' : 'bg-white'}`}>
       <div className={`${iconWrapperClasses} ${colorClasses}`}>
        <div className="w-10 h-10 sm:w-12 sm:h-12">
            {icon}
        </div>
      </div>
      <h3 className="text-base sm:text-xl font-bold text-dark-text">{label}</h3>
      <p className={`text-sm sm:text-base font-medium ${isOn ? 'text-dark-text' : 'text-medium-text'}`}>{recommendation}</p>
    </div>
  );
};

export default SignalIcon;
