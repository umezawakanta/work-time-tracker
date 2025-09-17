import React from "react";
import type { TimeEntry } from "../types";

interface TimeTrackingSectionProps {
  showTimeTracking: boolean;
  setShowTimeTracking: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  isTracking: boolean;
  description: string;
  setDescription: (description: string) => void;
  currentTimeEntry: TimeEntry | null;
  elapsedTime: number;
  handleStartTracking: () => Promise<void>;
  handleStopTracking: () => Promise<void>;
  handleResetTracking: () => void;
  formatTime: (seconds: number) => string;
}

const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  showTimeTracking,
  setShowTimeTracking,
  closeOtherFeatures,
  isTracking,
  description,
  setDescription,
  currentTimeEntry,
  elapsedTime,
  handleStartTracking,
  handleStopTracking,
  handleResetTracking,
  formatTime,
}) => {
  return (
    <div key="time-tracking" className="time-tracking-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <div className="mini-character">
              <div className="mini-character-face">
                <div className="mini-character-eyes">
                  <div className="mini-eye left-mini-eye"></div>
                  <div className="mini-eye right-mini-eye"></div>
                </div>
                <div className="mini-character-mouth"></div>
              </div>
              <div className="mini-character-body"></div>
            </div>
          </span>
          時間記録
        </h2>
        <div className="section-controls">
          {showTimeTracking ? (
            <button
              onClick={() => setShowTimeTracking(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("time-tracking");
                setShowTimeTracking(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showTimeTracking && (
        <div className="section-content">
          {!isTracking ? (
            <div className="start-tracking">
              <div className="form-group">
                <label htmlFor="description">作業内容</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="作業内容を入力してください"
                />
              </div>
              <button onClick={handleStartTracking} className="start-button">
                ▶️ 記録開始
              </button>
            </div>
          ) : (
            <div className="tracking-active">
              <div className="current-entry">
                <h3>記録中: {currentTimeEntry?.description}</h3>
                <div className="elapsed-time">{formatTime(elapsedTime)}</div>
                <div className="tracking-buttons">
                  <button onClick={handleStopTracking} className="stop-button">
                    ⏹️ 記録停止
                  </button>
                  <button
                    onClick={handleResetTracking}
                    className="reset-button"
                  >
                    🔄 強制リセット
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeTrackingSection;
