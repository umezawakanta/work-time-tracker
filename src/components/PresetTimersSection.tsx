import React from "react";

interface TimerPreset {
  id: number;
  name: string;
  minutes: number;
  seconds: number;
  color: string;
}

interface PresetTimersSectionProps {
  showPresetTimers: boolean;
  setShowPresetTimers: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  timerPresets: TimerPreset[];
  customTimerActive: boolean;
  startPresetTimer: (preset: TimerPreset) => void;
}

const PresetTimersSection: React.FC<PresetTimersSectionProps> = ({
  showPresetTimers,
  setShowPresetTimers,
  closeOtherFeatures,
  timerPresets,
  customTimerActive,
  startPresetTimer,
}) => {
  return (
    <div className="preset-timers-section">
      <div className="subsection-header">
        <h3>⚡ プリセットタイマー</h3>
        <div className="subsection-controls">
          {showPresetTimers ? (
            <button
              onClick={() => setShowPresetTimers(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("preset-timers");
                setShowPresetTimers(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showPresetTimers && (
        <div className="subsection-content">
          <div className="preset-grid">
            {timerPresets.map((preset) => (
              <div
                key={preset.id}
                className="preset-item"
                style={{ borderColor: preset.color }}
              >
                <div className="preset-header">
                  <h4 style={{ color: preset.color }}>{preset.name}</h4>
                  <span className="preset-time">
                    {preset.minutes}:
                    {preset.seconds.toString().padStart(2, "0")}
                  </span>
                </div>
                <button
                  onClick={() => startPresetTimer(preset)}
                  disabled={customTimerActive}
                  className="preset-start-btn"
                  style={{ backgroundColor: preset.color }}
                >
                  ▶️ スタート
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetTimersSection;
