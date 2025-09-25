import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import "./SoundAppComponent.css";

// サブコンポーネントのインポート
import SoundAppLayout from "./sound/SoundAppLayout";
import { musicGenres } from "./sound/MusicGenres";
import { createInstrumentForCategory } from "./sound/InstrumentFactory";
import { usePlaybackManager, PlaybackState, PlaybackCallbacks } from "./sound/PlaybackManager";
import { initializeTone, createMeiwaInstrument, playSound, globalToneInitialized } from "./sound/SoundEngine";
import { generateMeiwaRhythm } from "./sound/MeiwaSoundGenerator";
import { generateMusic } from "./sound/MusicGenerator";
import { createInitialMeal } from "./sound/MealLogic";
import { REPEAT_OPTIONS } from "./sound/constants";
import { MealRecord } from "./sound/MealRecording";
import { ScoreData } from "./sound/ScoreDisplay";
import { MusicGenre } from "./sound/GenreSelector";
import { ensureAudioContextReady } from "./sound/AudioContextUtils";

interface SoundAppComponentProps {
  showSoundApp: boolean;
  setShowSoundApp: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const SoundAppComponent: React.FC<SoundAppComponentProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures,
}) => {

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>("balanced");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.THREE_TIMES);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>(createInitialMeal());
  const [viewMode, setViewMode] = useState<"input" | "score">("input");
  const [currentScore, setCurrentScore] = useState<ScoreData | null>(null);
  const [showScore, setShowScore] = useState<boolean>(true);

  // 参照管理
  const instrumentsRef = useRef<{ [key: string]: any }>({});
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(""), duration);
  };

  // 楽器の作成（InstrumentFactoryを使用）
  const getOrCreateInstrument = useCallback(async (categoryId: string) => {
    // AudioContextが準備できているか確認
    const isReady = await ensureAudioContextReady();
    if (!isReady) {
      console.warn("AudioContext is not ready, cannot create instrument");
      return null;
    }

    if (!globalToneInitialized) {
      // Tone.jsを初期化
      const initialized = await initializeTone();
      if (!initialized) {
        console.warn("Failed to initialize Tone.js");
        return null;
      }
    }

    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

    const instrument = await createInstrumentForCategory(categoryId);
    if (instrument) {
      instrumentsRef.current[categoryId] = instrument;
    }

    return instrument;
  }, []);

  // 音を再生する関数
  const playSoundCallback = useCallback(
    async (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => {
      // AudioContextの状態を確認
      const isReady = await ensureAudioContextReady();
      if (!isReady) {
        console.warn("AudioContext is not ready, skipping sound playback");
        return;
      }

      // Tone.jsが初期化されていない場合は初期化
      if (!globalToneInitialized) {
        const initialized = await initializeTone();
        if (!initialized) {
          console.warn("Failed to initialize Tone.js for sound playback");
          return;
        }
      }

      await playSound(
        categoryId,
        frequency,
        duration,
        volume,
        genre,
        instrumentsRef.current,
        createMeiwaInstrument,
        getOrCreateInstrument
      );
    },
    [getOrCreateInstrument]
  );

  // 明和電機風リズム生成
  const generateMeiwaRhythmCallback = useCallback((beatDuration: number, categoryRatios: any[]) => {
    generateMeiwaRhythm(beatDuration, categoryRatios, playSoundCallback);
  }, [playSoundCallback]);

  // 音楽を生成
  const generateMusicCallback = useCallback(
    async (categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      playTimeoutsRef.current = [];

      // 楽譜データを生成（明和電機風の場合はスキップ）
      setCurrentScore(null);

      // 明和電機風の8bit音楽を生成
      await generateMusic(categoryRatios, balanceScore, genre, playSoundCallback, generateMeiwaRhythmCallback);
    },
    [playSoundCallback, generateMeiwaRhythmCallback]
  );

  // PlaybackManagerの使用
  const playbackState: PlaybackState = {
    isPlaying,
    isLooping,
    currentMeal,
    selectedGenre,
    repeatMode,
    userMessage,
  };

  const playbackCallbacks: PlaybackCallbacks = {
    setIsPlaying,
    setIsLooping,
    setCurrentMeal,
    setUserMessage,
    showMessage,
    playSoundCallback,
    generateMeiwaRhythmCallback,
    generateMusicCallback,
  };

  const { playMealBalance, stopPlayback, handleUpdateCategoryCount, handleResetMeal } = 
    usePlaybackManager(playbackState, playbackCallbacks);

  // 初期化処理
  const handleInitialize = async () => {
    const isReady = await ensureAudioContextReady();
    if (!isReady) {
      showMessage("AudioContextの初期化に失敗しました", 3000);
      return;
    }

    const initialized = await initializeTone();
    if (!initialized) {
      showMessage("Tone.jsの初期化に失敗しました", 3000);
      return;
    }

    showMessage("音アプリが起動しました！", 2000);
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ（楽譜表示版）
        </h2>
        <button
          onClick={() => setShowSoundApp(!showSoundApp)}
          className={
            showSoundApp ? "close-section-button" : "show-section-button"
          }
        >
          {showSoundApp ? "✕" : "▶"}
        </button>
      </div>

      {showSoundApp && (
        <SoundAppLayout
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          currentMeal={currentMeal}
          onUpdateCategoryCount={handleUpdateCategoryCount}
          onResetMeal={handleResetMeal}
          isPlaying={isPlaying}
          isLooping={isLooping}
          globalToneInitialized={globalToneInitialized}
          onPlay={() => playMealBalance(musicGenres)}
          onStop={stopPlayback}
          disabled={
            isPlaying ||
            Object.values(currentMeal.categories).every((c) => c === 0)
          }
          onInitialize={handleInitialize}
          currentScore={currentScore}
          showScore={showScore}
          onToggleScore={() => setShowScore(!showScore)}
          onExportScore={() => {
            showMessage("楽譜をダウンロードしました", 2000);
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          userMessage={userMessage}
        />
      )}
    </div>
  );
};

export default SoundAppComponent;
