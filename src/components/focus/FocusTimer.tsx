import React from 'react';

interface FocusTimerProps {
  remainingMs: number;
  durationMs: number;
  state: 'idle' | 'running' | 'paused' | 'finished';
  className?: string;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  remainingMs,
  durationMs,
  state,
  className = '',
}) => {
  const progress = durationMs > 0 ? (durationMs - remainingMs) / durationMs : 0;
  const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
  const totalMinutes = Math.ceil(durationMs / (60 * 1000));

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (state) {
      case 'running':
        return 'text-green-600';
      case 'paused':
        return 'text-amber-600';
      case 'finished':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'running':
        return '集中中';
      case 'paused':
        return '一時停止中';
      case 'finished':
        return '完了';
      default:
        return '待機中';
    }
  };

  return (
    <div className={`text-center ${className}`}>
      {/* 進捗リング */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
          aria-label={`進捗: ${Math.round(progress * 100)}%`}
        >
          {/* 背景円 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          {/* 進捗円 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={state === 'running' ? 'text-green-500' : 'text-blue-500'}
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
        </svg>

        {/* 中央の時間表示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold ${getStateColor()}`}>{formatTime(remainingMs)}</div>
          <div className="text-sm text-gray-500 mt-1">{getStateText()}</div>
          <div className="text-xs text-gray-400 mt-1">
            {remainingMinutes} / {totalMinutes} 分
          </div>
        </div>
      </div>

      {/* 進捗バー（モバイル用） */}
      <div className="w-full max-w-xs mx-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0分</span>
          <span>{totalMinutes}分</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              state === 'running' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
