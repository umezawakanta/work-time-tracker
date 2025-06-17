import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Minimize2,
  Maximize2,
  X,
  Timer,
} from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { PomodoroMode } from '@/types/pomodoro';

interface FloatingPomodoroTimerProps {
  onClose?: () => void;
}

export const FloatingPomodoroTimer: React.FC<FloatingPomodoroTimerProps> = ({ onClose }) => {
  console.log('🎯 FloatingPomodoroTimer: レンダリング開始');

  const pomodoro = usePomodoro();
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [applyImmediately, setApplyImmediately] = useState(false);
  const [taskInputValue, setTaskInputValue] = useState('');
  const dragOffset = useRef({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  console.log('🎯 FloatingPomodoroTimer: 状態取得完了', {
    isVisible: pomodoro.isVisible,
    status: pomodoro.status,
    currentTaskName: pomodoro.currentTaskName,
  });

  // ドラッグ機能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (timerRef.current) {
      const rect = timerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // 画面境界内に制限
      const maxX = window.innerWidth - 300;
      const maxY = window.innerHeight - 200;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      pomodoro.updatePosition({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // モードの色とアイコン
  const getModeColor = (mode: PomodoroMode) => {
    switch (mode) {
      case 'work':
        return 'bg-red-500 text-white';
      case 'shortBreak':
        return 'bg-green-500 text-white';
      case 'longBreak':
        return 'bg-blue-500 text-white';
    }
  };

  const getModeLabel = (mode: PomodoroMode) => {
    switch (mode) {
      case 'work':
        return '作業時間';
      case 'shortBreak':
        return '短休憩';
      case 'longBreak':
        return '長休憩';
    }
  };

  // 最小化された状態
  if (pomodoro.isMinimized) {
    return (
      <div
        ref={timerRef}
        className={`fixed z-50 cursor-move rounded-full p-3 shadow-lg ${getModeColor(pomodoro.currentMode)}`}
        style={{
          left: pomodoro.position.x,
          top: pomodoro.position.y,
        }}
        onMouseDown={handleMouseDown}
        onClick={() => pomodoro.toggleMinimized()}
      >
        <div className="flex items-center space-x-2">
          <Timer size={16} />
          <span className="text-sm font-mono">{pomodoro.formatTime(pomodoro.remainingTime)}</span>
          {pomodoro.status === 'running' && (
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* メインタイマー */}
      <div
        ref={timerRef}
        className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80"
        style={{
          left: pomodoro.position.x,
          top: pomodoro.position.y,
        }}
      >
        {/* ヘッダー */}
        <div
          className={`rounded-t-lg p-3 cursor-move ${getModeColor(pomodoro.currentMode)}`}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer size={16} />
              <span className="font-medium text-sm">
                {getModeLabel(pomodoro.currentMode)} - セッション {pomodoro.currentSession}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-white/20 rounded"
                title="設定"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={() => pomodoro.toggleMinimized()}
                className="p-1 hover:bg-white/20 rounded"
                title="最小化"
              >
                <Minimize2 size={14} />
              </button>
              {onClose && (
                <button
                  onClick={() => {
                    console.log('❌ FloatingPomodoroTimer: 閉じるボタンクリック - onClose実行');
                    onClose();
                  }}
                  className="p-1 hover:bg-white/20 rounded"
                  title="閉じる"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* タイマー表示 */}
        <div className="p-6">
          <div className="text-center">
            {/* 進捗バー */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full mb-4">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                  pomodoro.currentMode === 'work'
                    ? 'bg-red-500'
                    : pomodoro.currentMode === 'shortBreak'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${pomodoro.progress}%` }}
              />
            </div>

            {/* 時間表示 */}
            <div className="text-4xl font-mono font-bold text-gray-800 mb-4">
              {pomodoro.formatTime(pomodoro.remainingTime)}
            </div>

            {/* ステータス */}
            <div className="text-sm text-gray-600 mb-4">
              {pomodoro.status === 'running' && '実行中'}
              {pomodoro.status === 'paused' && '一時停止中'}
              {pomodoro.status === 'idle' && '待機中'}
              {pomodoro.status === 'completed' && '完了！'}
            </div>

            {/* タスク名入力（アイドル状態のみ表示） */}
            {pomodoro.status === 'idle' && (
              <div className="mb-4">
                <label htmlFor="task-input" className="block text-xs text-gray-600 mb-1">
                  作業内容（任意）
                </label>
                <input
                  id="task-input"
                  type="text"
                  value={taskInputValue}
                  onChange={(e) => setTaskInputValue(e.target.value)}
                  placeholder="例: メールの返信、資料作成など"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 現在のタスク名表示（実行中・一時停止中） */}
            {(pomodoro.status === 'running' || pomodoro.status === 'paused') &&
              pomodoro.currentTaskName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">現在の作業</div>
                  <div className="text-sm font-medium text-gray-800">
                    {pomodoro.currentTaskName}
                  </div>
                </div>
              )}

            {/* コントロールボタン */}
            <div className="flex justify-center space-x-2 mb-4">
              {pomodoro.status === 'running' ? (
                <button
                  onClick={pomodoro.pauseTimer}
                  className="flex items-center space-x-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Pause size={16} />
                  <span>一時停止</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const taskName = taskInputValue.trim();
                    pomodoro.startTimer(taskName || undefined);
                    // タスク名入力をクリア（次回のため）
                    if (taskName) setTaskInputValue('');
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play size={16} />
                  <span>開始</span>
                </button>
              )}

              <button
                onClick={pomodoro.resetTimer}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="リセット"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={pomodoro.skipSession}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="スキップ"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* モード切り替え */}
            <div className="flex justify-center space-x-1">
              {(['work', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => pomodoro.switchMode(mode)}
                  className={`px-3 py-1 text-xs rounded ${
                    pomodoro.currentMode === mode
                      ? getModeColor(mode)
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {getModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 今日の統計 */}
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-600 text-center">
            今日: {pomodoro.todayStats.completedPomodoros}🍅 | 集中時間:{' '}
            {Math.round(pomodoro.todayStats.totalFocusTime)}分
          </div>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-72 p-4"
          style={{
            left: pomodoro.position.x + 320,
            top: pomodoro.position.y,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">設定</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {/* 即座反映設定 */}
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="applyImmediately"
                  checked={applyImmediately}
                  onChange={(e) => setApplyImmediately(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="applyImmediately" className="text-xs text-gray-700">
                  設定変更を現在のタイマーに即座反映
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                チェックすると、実行中のタイマーにも設定が反映されます
              </p>
            </div>

            {/* 時間設定 */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">作業時間 (分)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoro.settings.workDuration}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (applyImmediately) {
                    pomodoro.updateSettingsImmediately({ workDuration: newValue });
                  } else {
                    pomodoro.updateSettings({ workDuration: newValue });
                  }
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">短休憩 (分)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={pomodoro.settings.shortBreakDuration}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (applyImmediately) {
                    pomodoro.updateSettingsImmediately({ shortBreakDuration: newValue });
                  } else {
                    pomodoro.updateSettings({ shortBreakDuration: newValue });
                  }
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">長休憩 (分)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoro.settings.longBreakDuration}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (applyImmediately) {
                    pomodoro.updateSettingsImmediately({ longBreakDuration: newValue });
                  } else {
                    pomodoro.updateSettings({ longBreakDuration: newValue });
                  }
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">長休憩間隔</label>
              <input
                type="number"
                min="2"
                max="10"
                value={pomodoro.settings.longBreakInterval}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (applyImmediately) {
                    pomodoro.updateSettingsImmediately({ longBreakInterval: newValue });
                  } else {
                    pomodoro.updateSettings({ longBreakInterval: newValue });
                  }
                }}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* 自動開始設定 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoStartBreaks"
                checked={pomodoro.settings.autoStartBreaks}
                onChange={(e) => pomodoro.updateSettings({ autoStartBreaks: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoStartBreaks" className="text-xs text-gray-600">
                休憩を自動開始
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoStartPomodoros"
                checked={pomodoro.settings.autoStartPomodoros}
                onChange={(e) => pomodoro.updateSettings({ autoStartPomodoros: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoStartPomodoros" className="text-xs text-gray-600">
                作業を自動開始
              </label>
            </div>

            {/* 通知設定 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notificationSound"
                checked={pomodoro.settings.notificationSound}
                onChange={(e) => pomodoro.updateSettings({ notificationSound: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="notificationSound" className="text-xs text-gray-600">
                通知音を有効化
              </label>
            </div>

            {pomodoro.settings.notificationSound && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  音量: {Math.round(pomodoro.settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={pomodoro.settings.volume}
                  onChange={(e) => pomodoro.updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
