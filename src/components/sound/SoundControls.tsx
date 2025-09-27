import React from "react";

interface SoundControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  toneStateManager: any;
  onPlay: () => void;
  onStop: () => void;
  disabled: boolean;
  onInitialize?: () => Promise<void>;
}

const SoundControls: React.FC<SoundControlsProps> = ({
  isPlaying,
  isLooping,
  toneStateManager,
  onPlay,
  onStop,
  disabled,
  onInitialize,
}) => {
  // AudioContextの状態を取得
  const getAudioContextStatus = () => {
    if (!toneStateManager.isReady()) {
      return "未初期化";
    }
    return toneStateManager.getState();
  };

  const audioContextStatus = getAudioContextStatus();

  // 初期化処理（ユーザー操作を確実に検出）
  const handleInitialize = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log("User clicked initialize button, ensuring user interaction...");
    
    // ユーザー操作を確実に検出するため、少し待機
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (onInitialize) {
      await onInitialize();
    }
  };

  return (
    <div className="sound-controls">
      <div className="audio-status">
        <small>AudioContext: {audioContextStatus}</small>
      </div>
      <button
        onClick={!toneStateManager.isReady() ? handleInitialize : onPlay}
        disabled={disabled && toneStateManager.isReady()}
        className={`play-button ${isPlaying ? "playing" : ""} ${!toneStateManager.isReady() ? "initialize-button" : ""}`}
      >
        {!toneStateManager.isReady()
          ? "🎵 クリックして起動"
          : isPlaying
          ? "再生中..."
          : "再生"}
      </button>
      {isPlaying && (
        <button 
          onClick={onStop}
          className="stop-button"
        >
          停止
        </button>
      )}
    </div>
  );
};

export default SoundControls;
