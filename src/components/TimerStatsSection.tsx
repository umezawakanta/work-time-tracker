import React from 'react';

interface TimerStatsSectionProps {
  showTimerStats: boolean;
  setShowTimerStats: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  timerHistory: Array<{
    id: string;
    name: string;
    duration: number;
    type: 'custom' | 'egg' | 'preset';
    completedAt: string;
  }>;
  formatTime: (seconds: number) => string;
}

const TimerStatsSection: React.FC<TimerStatsSectionProps> = ({
  showTimerStats,
  setShowTimerStats,
  closeOtherFeatures,
  timerHistory,
  formatTime
}) => {
  return (
    <div className="timer-stats-section">
      <div className="subsection-header">
        <h3>📈 タイマー統計</h3>
        <div className="subsection-controls">
          {showTimerStats ? (
            <button 
              onClick={() => setShowTimerStats(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button 
              onClick={() => {
                closeOtherFeatures('timer-stats');
                setShowTimerStats(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>
      
      {showTimerStats && (
        <div className="subsection-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{timerHistory.length}</div>
              <div className="stat-label">総実行回数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {formatTime(timerHistory.reduce((total, entry) => total + entry.duration, 0))}
              </div>
              <div className="stat-label">総実行時間</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {timerHistory.filter(entry => entry.type === 'custom').length}
              </div>
              <div className="stat-label">カスタムタイマー</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {timerHistory.filter(entry => entry.type === 'preset').length}
              </div>
              <div className="stat-label">プリセットタイマー</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {timerHistory.filter(entry => entry.type === 'egg').length}
              </div>
              <div className="stat-label">ゆでたまごタイマー</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {timerHistory.length > 0 ? 
                  formatTime(Math.round(timerHistory.reduce((total, entry) => total + entry.duration, 0) / timerHistory.length)) : 
                  '00:00:00'
                }
              </div>
              <div className="stat-label">平均実行時間</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerStatsSection;
