import React from "react";
import * as Tone from "tone";
import { ensureAudioContextReady } from "./AudioContextUtils";
import { initializeTone } from "./SoundEngine";

interface SoundControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  globalToneInitialized: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled: boolean;
  onInitialize?: () => Promise<void>;
}

const SoundControls: React.FC<SoundControlsProps> = ({
  isPlaying,
  isLooping,
  globalToneInitialized,
  onPlay,
  onStop,
  disabled,
  onInitialize,
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

  // 初期化処理
  const handleInitialize = async () => {
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
        onClick={!globalToneInitialized ? handleInitialize : onPlay}
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
