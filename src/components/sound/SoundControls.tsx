import React from "react";

interface SoundControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  globalToneInitialized: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled: boolean;
}

const SoundControls: React.FC<SoundControlsProps> = ({
  isPlaying,
  isLooping,
  globalToneInitialized,
  onPlay,
  onStop,
  disabled,
}) => {
  return (
    <div className="sound-controls">
      <button
        onClick={onPlay}
        disabled={disabled}
        className={`play-button ${isPlaying ? "playing" : ""}`}
      >
        {!globalToneInitialized
          ? "🎵 クリックして起動"
          : isPlaying
          ? "再生中..."
          : "再生"}
      </button>
      {isLooping && <button onClick={onStop}>停止</button>}
    </div>
  );
};

export default SoundControls;
