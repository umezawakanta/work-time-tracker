import React, { useState, useEffect } from 'react';
import './TimersComponent.css';
import type { TimerPreset } from '../types';

interface TimersComponentProps {
  showTimers: boolean;
  setShowTimers: (show: boolean) => void;
  customTimerTime: number;
  setCustomTimerTime: (time: number) => void;
  customTimerActive: boolean;
  setCustomTimerActive: (active: boolean) => void;
  customTimerPaused: boolean;
  setCustomTimerPaused: (paused: boolean) => void;
  customTimerTimeLeft: number;
  setCustomTimerTimeLeft: (time: number) => void;
  customTimerInterval: NodeJS.Timeout | null;
  setCustomTimerInterval: (interval: NodeJS.Timeout | null) => void;
  customTimerSound: string;
  setCustomTimerSound: (sound: "bell" | "chime" | "beep" | "alarm") => void;
  timerHistory: any[];
  timerSettings: any;
  startCustomTimer: () => void;
  pauseCustomTimer: () => void;
  stopCustomTimer: () => void;
  resetCustomTimer: () => void;
  playCustomTimerSound: () => void;
  addToTimerHistory: (name: string, duration: number, type: "custom" | "egg" | "preset") => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const TimersComponent: React.FC<TimersComponentProps> = ({
  showTimers,
  setShowTimers,
  customTimerTime,
  setCustomTimerTime,
  customTimerActive,
  setCustomTimerActive,
  customTimerPaused,
  setCustomTimerPaused,
  customTimerTimeLeft,
  setCustomTimerTimeLeft,
  customTimerInterval,
  setCustomTimerInterval,
  customTimerSound,
  setCustomTimerSound,
  timerHistory,
  timerSettings,
  startCustomTimer,
  pauseCustomTimer,
  stopCustomTimer,
  resetCustomTimer,
  playCustomTimerSound,
  addToTimerHistory,
  closeOtherFeatures,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // プリセットタイマーの定義
  const timerPresets: TimerPreset[] = [
    { id: 'pomodoro', name: 'ポモドーロ', duration: 25 * 60, color: '#e74c3c' },
    { id: 'short-break', name: '短い休憩', duration: 5 * 60, color: '#27ae60' },
    { id: 'long-break', name: '長い休憩', duration: 15 * 60, color: '#3498db' },
    { id: 'focus', name: '集中タイマー', duration: 45 * 60, color: '#9b59b6' },
    { id: 'study', name: '学習タイマー', duration: 30 * 60, color: '#f39c12' },
    { id: 'workout', name: '運動タイマー', duration: 20 * 60, color: '#e67e22' },
  ];

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // プリセットタイマーを開始
  const startPresetTimer = (preset: TimerPreset) => {
    setCustomTimerTime(preset.duration);
    setCustomTimerTimeLeft(preset.duration);
    setCustomTimerActive(true);
    setCustomTimerPaused(false);
    setSelectedPreset(preset.id);
    
    // 既存のインターバルをクリア
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
    }
    
    // 新しいインターバルを開始
    const interval = setInterval(() => {
      setCustomTimerTimeLeft((prev) => {
        if (prev <= 1) {
          setCustomTimerActive(false);
          setCustomTimerPaused(false);
          playCustomTimerSound();
          addToTimerHistory(preset.name, preset.duration, 'preset');
          clearInterval(interval);
          setCustomTimerInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCustomTimerInterval(interval);
  };

  // カスタムタイマーの時間を設定
  const handleTimeChange = (type: 'hours' | 'minutes' | 'seconds', value: number) => {
    const newTime = { ...customTimerTime };
    
    switch (type) {
      case 'hours':
        newTime.hours = Math.max(0, Math.min(23, value));
        break;
      case 'minutes':
        newTime.minutes = Math.max(0, Math.min(59, value));
        break;
      case 'seconds':
        newTime.seconds = Math.max(0, Math.min(59, value));
        break;
    }
    
    const totalSeconds = newTime.hours * 3600 + newTime.minutes * 60 + newTime.seconds;
    setCustomTimerTime(totalSeconds);
    
    if (!customTimerActive) {
      setCustomTimerTimeLeft(totalSeconds);
    }
  };

  // タイマーの進行状況を計算
  const getProgress = () => {
    if (customTimerTime === 0) return 0;
    return ((customTimerTime - customTimerTimeLeft) / customTimerTime) * 100;
  };

  // タイマーの状態を取得
  const getTimerStatus = () => {
    if (customTimerActive && !customTimerPaused) {
      return 'running';
    } else if (customTimerPaused) {
      return 'paused';
    } else {
      return 'stopped';
    }
  };

  // 最近のタイマー履歴を取得
  const getRecentHistory = () => {
    return timerHistory.slice(0, 5);
  };

  return (
    <div className="timers-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">⏱️</span>
          タイマー
        </h2>
        <div className="section-controls">
          {showTimers ? (
            <button
              onClick={() => setShowTimers(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("timers");
                setShowTimers(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showTimers && (
        <div className="timers-content">
          <div className="timers-header">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="settings-button"
              title="タイマー設定"
            >
              ⚙️
            </button>
          </div>

          {/* メインタイマー表示 */}
          <div className="main-timer">
            <div className="timer-display">
              <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 100 100">
                  <circle
                    className="timer-background"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e9ecef"
                    strokeWidth="8"
                  />
                  <circle
                    className="timer-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#007bff"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="timer-text">
                  <div className="timer-time">{formatTime(customTimerTimeLeft)}</div>
                  <div className="timer-status">
                    {getTimerStatus() === 'running' && '⏱️ 実行中'}
                    {getTimerStatus() === 'paused' && '⏸️ 一時停止'}
                    {getTimerStatus() === 'stopped' && '⏹️ 停止中'}
                  </div>
                </div>
              </div>
            </div>

            <div className="timer-controls">
              {!customTimerActive ? (
                <button
                  onClick={startCustomTimer}
                  className="start-button"
                  disabled={customTimerTime === 0}
                >
                  ▶️ 開始
                </button>
              ) : (
                <div className="active-controls">
                  {!customTimerPaused ? (
                    <button onClick={pauseCustomTimer} className="pause-button">
                      ⏸️ 一時停止
                    </button>
                  ) : (
                    <button onClick={startCustomTimer} className="resume-button">
                      ▶️ 再開
                    </button>
                  )}
                  <button onClick={stopCustomTimer} className="stop-button">
                    ⏹️ 停止
                  </button>
                </div>
              )}
              
              <button
                onClick={resetCustomTimer}
                className="reset-button"
                disabled={customTimerActive}
              >
                🔄 リセット
              </button>
            </div>
          </div>

          {/* プリセットタイマー */}
          <div className="preset-timers">
            <h3>📋 プリセットタイマー</h3>
            <div className="preset-grid">
              {timerPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => startPresetTimer(preset)}
                  className={`preset-button ${selectedPreset === preset.id ? 'active' : ''}`}
                  style={{ '--preset-color': preset.color } as React.CSSProperties}
                  disabled={customTimerActive}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-duration">{formatTime(preset.duration)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* カスタムタイマー設定 */}
          <div className="custom-timer">
            <h3>⚙️ カスタムタイマー</h3>
            <div className="time-inputs">
              <div className="time-input-group">
                <label>時間</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={Math.floor(customTimerTime / 3600)}
                  onChange={(e) => handleTimeChange('hours', parseInt(e.target.value) || 0)}
                  disabled={customTimerActive}
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label>分</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={Math.floor((customTimerTime % 3600) / 60)}
                  onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                  disabled={customTimerActive}
                  className="time-input"
                />
              </div>
              <div className="time-input-group">
                <label>秒</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customTimerTime % 60}
                  onChange={(e) => handleTimeChange('seconds', parseInt(e.target.value) || 0)}
                  disabled={customTimerActive}
                  className="time-input"
                />
              </div>
            </div>
          </div>

          {/* 設定パネル */}
          {showSettings && (
            <div className="timer-settings">
              <h3>🔊 音設定</h3>
              <div className="sound-options">
                {['bell', 'chime', 'beep', 'alarm'].map((sound) => (
                  <label key={sound} className="sound-option">
                    <input
                      type="radio"
                      name="timerSound"
                      value={sound}
                      checked={customTimerSound === sound}
                      onChange={(e) => setCustomTimerSound(e.target.value)}
                    />
                    <span className="sound-label">
                      {sound === 'bell' && '🔔 ベル'}
                      {sound === 'chime' && '🎵 チャイム'}
                      {sound === 'beep' && '📢 ビープ'}
                      {sound === 'alarm' && '🚨 アラーム'}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={playCustomTimerSound}
                className="test-sound-button"
              >
                🔊 音をテスト
              </button>
            </div>
          )}

          {/* タイマー履歴 */}
          <div className="timer-history">
            <div className="history-header">
              <h3>📊 タイマー履歴</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="toggle-history-button"
              >
                {showHistory ? '隠す' : '表示'}
              </button>
            </div>

            {showHistory && (
              <div className="history-list">
                {getRecentHistory().length === 0 ? (
                  <p className="no-history">タイマー履歴がありません</p>
                ) : (
                  getRecentHistory().map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-info">
                        <div className="history-name">{entry.name}</div>
                        <div className="history-type">{entry.type}</div>
                      </div>
                      <div className="history-duration">{formatTime(entry.duration)}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimersComponent;
