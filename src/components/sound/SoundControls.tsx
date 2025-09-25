import React from "react";
import * as Tone from "tone";

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
  // AudioContextの状態を取得
  const getAudioContextStatus = () => {
    if (!globalToneInitialized) {
      return "未初期化";
    }
    try {
      return Tone.context.state;
    } catch (error) {
      return "エラー";
    }
  };

  const audioContextStatus = getAudioContextStatus();

  return (
    <div className="sound-controls">
      <div className="audio-status">
        <small>AudioContext: {audioContextStatus}</small>
      </div>
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
