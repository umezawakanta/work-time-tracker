import React from "react";
import { startCookingTimer } from "../utils/cookingTimer";
import { cookingRecipes, getRecipePhases } from "../constants/cookingRecipes";

interface CookingTimerSectionProps {
  showCookingTimer: boolean;
  setShowCookingTimer: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  selectedRecipe: string;
  setSelectedRecipe: (recipe: string) => void;
  selectedEggType: "soft" | "medium" | "hard" | undefined;
  setSelectedEggType: (type: "soft" | "medium" | "hard") => void;
  eggTimerActive: boolean;
  eggTimerPaused: boolean;
  eggTimerTime: number;
  eggTimerOriginalTime: number;
  eggTimerPhase: string;
  eggTimerPhaseTime: number;
  eggTimerPhaseName: string;
  eggTimerSound: string;
  setEggTimerSound: (sound: "bell" | "chime" | "beep" | "alarm") => void;
  setEggTimerTime: (time: number | ((prev: number) => number)) => void;
  setEggTimerOriginalTime: (time: number) => void;
  setEggTimerActive: (active: boolean) => void;
  setEggTimerPaused: (paused: boolean) => void;
  setEggTimerPhase: (phase: "heating" | "boiling" | "cooking") => void;
  setEggTimerPhaseTime: (time: number) => void;
  setEggTimerPhaseName: (name: string) => void;
  setEggTimerInterval: (interval: NodeJS.Timeout | null) => void;
  setMessage: (message: string) => void;
  sendNotification: (title: string, body: string, icon?: string) => void;
  startSoundLoop: (soundType: "bell" | "chime" | "beep" | "alarm") => void;
  addToTimerHistory: (
    name: string,
    duration: number,
    type: "custom" | "egg" | "preset"
  ) => void;
  playEggTimerSound: () => Promise<void>;
  pauseEggTimer: () => void;
  stopEggTimer: () => void;
  resetEggTimer: () => void;
  getEggTimerDuration: (type: "soft" | "medium" | "hard") => number;
  getTotalCookingTime: (
    recipeKey: string,
    eggType?: "soft" | "medium" | "hard"
  ) => number;
  formatTime: (seconds: number) => string;
  eggTimerType: "soft" | "medium" | "hard";
}

const CookingTimerSection: React.FC<CookingTimerSectionProps> = ({
  showCookingTimer,
  setShowCookingTimer,
  closeOtherFeatures,
  selectedRecipe,
  setSelectedRecipe,
  selectedEggType,
  setSelectedEggType,
  eggTimerActive,
  eggTimerPaused,
  eggTimerTime,
  eggTimerOriginalTime,
  eggTimerPhase,
  eggTimerPhaseTime,
  eggTimerPhaseName,
  eggTimerSound,
  setEggTimerSound,
  setEggTimerTime,
  setEggTimerOriginalTime,
  setEggTimerActive,
  setEggTimerPaused,
  setEggTimerPhase,
  setEggTimerPhaseTime,
  setEggTimerPhaseName,
  setEggTimerInterval,
  setMessage,
  sendNotification,
  startSoundLoop,
  addToTimerHistory,
  playEggTimerSound,
  pauseEggTimer,
  stopEggTimer,
  resetEggTimer,
  getEggTimerDuration,
  getTotalCookingTime,
  formatTime,
  eggTimerType,
}) => {
  const handleStartCookingTimer = () => {
    const state = {
      eggTimerActive,
      eggTimerPaused,
      eggTimerTime,
      eggTimerOriginalTime,
      eggTimerPhase,
      eggTimerPhaseTime,
      eggTimerPhaseName,
      eggTimerSound,
      selectedRecipe,
      selectedEggType,
    };

    const setters = {
      setEggTimerTime,
      setEggTimerOriginalTime,
      setEggTimerActive,
      setEggTimerPaused,
      setEggTimerPhase,
      setEggTimerPhaseTime,
      setEggTimerPhaseName,
      setEggTimerInterval,
      setMessage,
      sendNotification,
      startSoundLoop,
      addToTimerHistory,
    };

    startCookingTimer(
      state,
      setters,
      cookingRecipes,
      getRecipePhases,
      getTotalCookingTime
    );
  };

  return (
    <div key="cooking-timer" className="cooking-timer-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <div className="mini-character">
              <div className="mini-character-halo"></div>
              <div className="mini-character-wings">
                <div className="mini-wing left-mini-wing"></div>
                <div className="mini-wing right-mini-wing"></div>
              </div>
              <div className="mini-character-face">
                <div className="mini-character-eyes">
                  <div className="mini-eye left-mini-eye"></div>
                  <div className="mini-eye right-mini-eye"></div>
                </div>
                <div className="mini-character-mouth"></div>
              </div>
              <div className="mini-character-body"></div>
              <div className="mini-sparkles">
                <div className="mini-sparkle mini-sparkle-1"></div>
                <div className="mini-sparkle mini-sparkle-2"></div>
              </div>
            </div>
          </span>
          料理タイマー
        </h2>
        <div className="section-controls">
          {showCookingTimer ? (
            <button
              onClick={() => setShowCookingTimer(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("cooking-timer");
                setShowCookingTimer(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showCookingTimer && (
        <div className="section-content">
          <div className="cooking-timer-container">
            <h3>🍳 料理タイマー</h3>

            <div className="recipe-selector">
              <h4>📋 料理を選択</h4>
              <div className="recipe-options">
                {Object.entries(cookingRecipes).map(([key, recipe]) => (
                  <label key={key} className="recipe-option">
                    <input
                      type="radio"
                      name="recipe"
                      value={key}
                      checked={selectedRecipe === key}
                      onChange={(e) => setSelectedRecipe(e.target.value)}
                      disabled={eggTimerActive}
                    />
                    <span className="recipe-name">{recipe.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRecipe === "egg" && (
              <div className="egg-type-selector">
                <h4>🥚 ゆで加減を選択</h4>
                <div className="egg-type-options">
                  <label>
                    <input
                      type="radio"
                      name="eggType"
                      value="soft"
                      checked={selectedEggType === "soft"}
                      onChange={(e) =>
                        setSelectedEggType(
                          e.target.value as "soft" | "medium" | "hard"
                        )
                      }
                      disabled={eggTimerActive}
                    />
                    <span>🥚 半熟</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="eggType"
                      value="medium"
                      checked={selectedEggType === "medium"}
                      onChange={(e) =>
                        setSelectedEggType(
                          e.target.value as "soft" | "medium" | "hard"
                        )
                      }
                      disabled={eggTimerActive}
                    />
                    <span>🥚 中半熟</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="eggType"
                      value="hard"
                      checked={selectedEggType === "hard"}
                      onChange={(e) =>
                        setSelectedEggType(
                          e.target.value as "soft" | "medium" | "hard"
                        )
                      }
                      disabled={eggTimerActive}
                    />
                    <span>🥚 固ゆで</span>
                  </label>
                </div>
              </div>
            )}

            <div className="cooking-phases">
              <h4>📝 調理手順</h4>
              <div className="phases-list">
                {getRecipePhases(
                  selectedRecipe,
                  selectedRecipe === "egg" ? selectedEggType : undefined
                ).map((phase, index) => (
                  <div
                    key={index}
                    className={`phase-item ${
                      eggTimerPhase ===
                      (index === 0
                        ? "heating"
                        : index ===
                          getRecipePhases(
                            selectedRecipe,
                            selectedRecipe === "egg"
                              ? selectedEggType
                              : undefined
                          ).length -
                            1
                        ? "cooking"
                        : "boiling")
                        ? "active"
                        : ""
                    }`}
                  >
                    <div className="phase-number">{index + 1}</div>
                    <div className="phase-content">
                      <div className="phase-name">{phase.name}</div>
                      <div className="phase-duration">
                        {formatTime(phase.duration)}
                      </div>
                      <div className="phase-description">
                        {phase.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="egg-timer-sound-selector">
              <label>🔊 通知音:</label>
              <div className="sound-options">
                <label>
                  <input
                    type="radio"
                    name="eggTimerSound"
                    value="bell"
                    checked={eggTimerSound === "bell"}
                    onChange={(e) =>
                      setEggTimerSound(
                        e.target.value as "bell" | "chime" | "beep" | "alarm"
                      )
                    }
                  />
                  🔔 鐘
                </label>
                <label>
                  <input
                    type="radio"
                    name="eggTimerSound"
                    value="chime"
                    checked={eggTimerSound === "chime"}
                    onChange={(e) =>
                      setEggTimerSound(
                        e.target.value as "bell" | "chime" | "beep" | "alarm"
                      )
                    }
                  />
                  🎵 チャイム
                </label>
                <label>
                  <input
                    type="radio"
                    name="eggTimerSound"
                    value="beep"
                    checked={eggTimerSound === "beep"}
                    onChange={(e) =>
                      setEggTimerSound(
                        e.target.value as "bell" | "chime" | "beep" | "alarm"
                      )
                    }
                  />
                  📢 ビープ
                </label>
                <label>
                  <input
                    type="radio"
                    name="eggTimerSound"
                    value="alarm"
                    checked={eggTimerSound === "alarm"}
                    onChange={(e) =>
                      setEggTimerSound(
                        e.target.value as "bell" | "chime" | "beep" | "alarm"
                      )
                    }
                  />
                  🚨 アラーム
                </label>
              </div>
              <button
                onClick={async () => {
                  try {
                    await playEggTimerSound();
                  } catch (error) {
                    console.error("音声テストエラー:", error);
                    setMessage(
                      "音声の再生に失敗しました。ブラウザの設定を確認してください。"
                    );
                  }
                }}
                className="test-sound-btn"
                disabled={eggTimerActive}
              >
                🔊 音を試す
              </button>
            </div>

            <div className="cooking-timer-display">
              <div className="timer-time">{formatTime(eggTimerTime)}</div>
              <div className="timer-status">
                {eggTimerActive ? `🍳 ${eggTimerPhaseName}中...` : "🍳 待機中"}
              </div>
              {eggTimerActive && (
                <div className="phase-progress">
                  <div className="current-phase">
                    現在の段階: {eggTimerPhaseName}
                  </div>
                  <div className="phase-time">
                    残り時間: {formatTime(eggTimerPhaseTime)}
                  </div>
                </div>
              )}
            </div>

            <div className="cooking-timer-buttons">
              {!eggTimerActive ? (
                <button
                  onClick={handleStartCookingTimer}
                  className="cooking-timer-start-btn"
                >
                  ▶️ タイマー開始
                </button>
              ) : (
                <div className="timer-controls">
                  {!eggTimerPaused ? (
                    <button
                      onClick={pauseEggTimer}
                      className="cooking-timer-pause-btn"
                    >
                      ⏸️ 一時停止
                    </button>
                  ) : (
                    <button
                      onClick={handleStartCookingTimer}
                      className="cooking-timer-resume-btn"
                    >
                      ▶️ 再開
                    </button>
                  )}
                  <button
                    onClick={stopEggTimer}
                    className="cooking-timer-stop-btn"
                  >
                    ⏹️ 停止
                  </button>
                  <button
                    onClick={resetEggTimer}
                    className="cooking-timer-reset-btn"
                  >
                    🔄 リセット
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingTimerSection;
