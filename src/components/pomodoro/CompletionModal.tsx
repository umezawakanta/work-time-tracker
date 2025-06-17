import React, { useEffect, useState } from 'react';
import { CheckCircle, Coffee, Play, VolumeX, Timer } from 'lucide-react';
import { PomodoroMode } from '@/types/pomodoro';
import { usePomodoroContext } from '@/context/PomodoroContext';

export const CompletionModal: React.FC = () => {
  const { pomodoro } = usePomodoroContext();
  const [isFlashing, setIsFlashing] = useState(true);

  useEffect(() => {
    if (pomodoro.showCompletionModal) {
      setIsFlashing(true);
      // 10秒後に点滅を停止
      const timer = setTimeout(() => setIsFlashing(false), 10000);

      // 通知許可を要求（まだ許可されていない場合）
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => clearTimeout(timer);
    }
  }, [pomodoro.showCompletionModal]);

  if (!pomodoro.showCompletionModal) return null;

  // 次のモードを計算
  const getNextMode = (): PomodoroMode => {
    if (pomodoro.currentMode === 'work') {
      const shouldTakeLongBreak =
        pomodoro.currentSession % pomodoro.settings.longBreakInterval === 0;
      return shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
    } else {
      return 'work';
    }
  };

  const nextMode = getNextMode();

  const getModeInfo = (mode: PomodoroMode) => {
    switch (mode) {
      case 'work':
        return {
          title: pomodoro.currentTaskName
            ? `「${pomodoro.currentTaskName}」完了！`
            : '作業時間完了！',
          subtitle: pomodoro.currentTaskName
            ? `「${pomodoro.currentTaskName}」お疲れ様でした！`
            : 'お疲れ様でした！',
          icon: <CheckCircle size={64} className="text-green-500" />,
          bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
          nextAction: '休憩を開始',
        };
      case 'shortBreak':
        return {
          title: '短い休憩完了！',
          subtitle: 'リフレッシュできましたか？',
          icon: <Coffee size={64} className="text-blue-500" />,
          bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
          nextAction: '作業を再開',
        };
      case 'longBreak':
        return {
          title: '長い休憩完了！',
          subtitle: 'しっかり休めましたね！',
          icon: <Coffee size={64} className="text-purple-500" />,
          bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
          nextAction: '作業を再開',
        };
    }
  };

  const currentInfo = getModeInfo(pomodoro.currentMode);
  const nextInfo = getModeInfo(nextMode);

  const handleStartNext = () => {
    pomodoro.switchMode(nextMode);
    pomodoro.startTimer();
    pomodoro.closeCompletionModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景オーバーレイ */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          isFlashing ? 'animate-pulse' : ''
        }`}
      />

      {/* モーダルコンテンツ */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full transform transition-all duration-500 ${
          isFlashing ? 'animate-bounce scale-105' : 'scale-100'
        }`}
      >
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">{currentInfo.icon}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentInfo.title}</h1>
          <p className="text-lg text-gray-600">{currentInfo.subtitle}</p>
          <div className="mt-2 text-sm text-gray-500">
            セッション #{pomodoro.currentSession} 完了
          </div>
        </div>

        {/* 次のアクション */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Timer size={24} className="text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">次は: {nextInfo.nextAction}</span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={handleStartNext}
            className={`w-full py-3 px-4 ${nextInfo.bgColor} text-white rounded-lg font-medium text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
          >
            <Play size={20} />
            <span>{nextInfo.nextAction}する</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={pomodoro.stopSound}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
            >
              <VolumeX size={16} />
              <span>音を停止</span>
            </button>

            <button
              onClick={pomodoro.closeCompletionModal}
              className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            今日の完了セッション: {pomodoro.currentSession}
          </div>
          <div className="mt-2 flex justify-center space-x-1">
            {Array.from({ length: Math.min(pomodoro.currentSession, 8) }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-green-500 rounded-full" />
            ))}
            {pomodoro.currentSession > 8 && (
              <span className="text-xs text-gray-500 ml-1">+{pomodoro.currentSession - 8}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
