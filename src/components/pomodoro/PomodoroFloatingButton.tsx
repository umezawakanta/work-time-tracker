import React from 'react';
import { Timer } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';

export const PomodoroFloatingButton: React.FC = () => {
  const pomodoro = usePomodoro();

  if (pomodoro.isVisible) {
    return null;
  }

  return (
    <button
      onClick={() => pomodoro.toggleVisibility()}
      className={`
        fixed bottom-6 right-6 z-40 
        w-14 h-14 rounded-full shadow-lg 
        flex items-center justify-center
        transition-all duration-300 hover:scale-110
        ${
          pomodoro.status === 'running'
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : pomodoro.status === 'paused'
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white
      `}
      title={`ポモドーロタイマー ${pomodoro.status === 'running' ? '実行中' : ''}`}
    >
      <Timer size={24} />

      {/* ステータスインジケーター */}
      {pomodoro.status === 'running' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}

      {pomodoro.status === 'paused' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
      )}

      {/* 今日完了したポモドーロ数 */}
      {pomodoro.todayStats.completedPomodoros > 0 && (
        <div className="absolute -bottom-1 -left-1 min-w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
          {pomodoro.todayStats.completedPomodoros}
        </div>
      )}
    </button>
  );
};
