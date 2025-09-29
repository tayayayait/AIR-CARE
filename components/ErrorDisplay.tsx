import React from 'react';
import { ErrorIcon } from './Icons';

interface ErrorDisplayProps {
  message: string;
  lastUpdated?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, lastUpdated }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-danger-soft rounded-lg">
      <ErrorIcon className="h-12 w-12 text-danger mb-4" />
      <h2 className="text-xl font-semibold text-danger mb-2">앗! 문제가 발생했어요.</h2>
      <p className="text-ink-strong">{message}</p>
      {lastUpdated && <p className="text-sm text-ink-muted mt-4">{lastUpdated}</p>}
    </div>
  );
};

export default ErrorDisplay;