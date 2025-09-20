import React from 'react';
import './TimerHistoryComponent.css';

interface TimerHistoryEntry {
  id: string;
  name: string;
  duration: number;
  type: 'custom' | 'preset' | 'egg';
  completedAt: Date;
}

interface TimerHistoryComponentProps {
  timerHistory: TimerHistoryEntry[];
  showTimerHistory: boolean;
  onToggle: () => void;
  onClose: () => void;
  formatTime: (seconds: number) => string;
}

const TimerHistoryComponent: React.FC<TimerHistoryComponentProps> = ({
  timerHistory,
  showTimerHistory,
  onToggle,
  onClose,
  formatTime,
}) => {
  return (
    <div className="timer-history-section">
      <div className="subsection-header">
        <h3>📊 タイマー履歴</h3>
        <div className="subsection-controls">
          {showTimerHistory ? (
            <button 
              onClick={onClose}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button 
              onClick={onToggle}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>
      
      {showTimerHistory && (
        <div className="subsection-content">
          {timerHistory.length > 0 ? (
            <div className="history-list">
              {timerHistory.slice(0, 10).map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-info">
                    <span className="history-name">{entry.name}</span>
                    <span className="history-duration">{formatTime(entry.duration)}</span>
                  </div>
                  <div className="history-meta">
                    <span className="history-type">
                      {entry.type === 'custom' ? '🎯' : entry.type === 'preset' ? '⚡' : '🥚'}
                    </span>
                    <span className="history-date">
                      {new Date(entry.completedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">まだタイマーの履歴がありません</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimerHistoryComponent;
