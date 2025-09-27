import React, { useState, useEffect, useRef, useCallback } from "react";
import "./SoundAppComponent.css";

// サブコンポーネントのインポート
import SoundAppLayout from "./sound/SoundAppLayout";
import { musicGenres } from "./sound/MusicGenres";
import { usePlaybackManager, PlaybackState, PlaybackCallbacks } from "./sound/PlaybackManager";
import { simpleAudioEngine, playSound, InstrumentType, WaveformType } from "./sound/SimpleAudioEngine";
import { generateMeiwaRhythm, generateMusic } from "./sound/SimpleAudioEngine";
import { createInitialMeal } from "./sound/MealLogic";
import { REPEAT_OPTIONS } from "./sound/constants";
import { MealRecord } from "./sound/MealRecording";
import { ScoreData } from "./sound/ScoreDisplay";
import ScoreDisplay from "./sound/ScoreDisplay";
import { MusicGenre } from "./sound/types";

/**
 * Props for the SoundAppComponent
 */
interface SoundAppComponentProps {
  /** Whether the sound app section is currently visible */
  showSoundApp: boolean;
  /** Function to toggle the visibility of the sound app section */
  setShowSoundApp: (show: boolean) => void;
  /** Function to close other features when this one is activated */
  closeOtherFeatures: (activeFeature: string) => void;
}

const SoundAppComponent: React.FC<SoundAppComponentProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures,
}) => {

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>("balanced");
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>(InstrumentType.MEIWA);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.THREE_TIMES);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>(createInitialMeal());
  const [viewMode, setViewMode] = useState<"input" | "score">("input");
  const [currentScore, setCurrentScore] = useState<ScoreData | null>(null);
  const [showScore, setShowScore] = useState<boolean>(true);
  const [savedScores, setSavedScores] = useState<any[]>([]);
  const [showScoreLibrary, setShowScoreLibrary] = useState<boolean>(false);
  // UI/UX関連の状態
  const [useDragDrop, setUseDragDrop] = useState<boolean>(true);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<any>(null);

  // 参照管理
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(""), duration);
  };


  // 音を再生する関数
  const playSoundCallback = useCallback(
    async (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => {
      // SimpleAudioEngineが初期化されていない場合は初期化
      if (!simpleAudioEngine.isReady()) {
        const initialized = await simpleAudioEngine.initialize();
        if (!initialized) {
          console.warn("Failed to initialize SimpleAudioEngine for sound playback");
          return;
        }
      }

      await playSound(
        categoryId,
        frequency,
        duration,
        volume,
        genre
      );
    },
    []
  );

  // 明和電機風リズム生成
  const generateMeiwaRhythmCallback = useCallback(async (beatDuration: number, categoryRatios: any[]) => {
    await generateMeiwaRhythm(beatDuration, categoryRatios, playSoundCallback);
  }, [playSoundCallback]);

  // 音楽を生成
  const generateMusicCallback = useCallback(
    async (categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      playTimeoutsRef.current = [];

      // 楽譜データを生成
      const scoreData = generateScoreData(categoryRatios, genre);
      console.log("Generated score data:", scoreData);
      setCurrentScore(scoreData);

      // 明和電機風の8bit音楽を生成
      await generateMusic(categoryRatios, balanceScore, genre.id, playSoundCallback, generateMeiwaRhythmCallback);
    },
    [playSoundCallback, generateMeiwaRhythmCallback]
  );

  // 楽譜データを生成する関数
  const generateScoreData = useCallback((categoryRatios: any[], genre: MusicGenre) => {
    const notes: any[] = [];
    let currentTime = 0;

    // アクティブなカテゴリから音符を生成
    categoryRatios
      .filter((cat) => cat.ratio > 0)
      .forEach((category, index) => {
        const noteMapping = category.noteMapping || "C/4";
        const soundDuration = category.sound?.duration || 0.5;
        const duration = getNoteDuration(soundDuration);

        notes.push({
          pitch: noteMapping,
          duration: duration,
          time: currentTime,
          instrument: category.instrument || "unknown",
        });

        currentTime += soundDuration;
      });

    return {
      notes,
      timeSignature: "4/4",
      tempo: genre.baseTempo || 120,
      key: genre.keySignature || "C",
      title: "Generated Music",
      composer: "AI Composer",
      measures: [],
      dynamics: [],
      articulations: []
    };
  }, []);

  // 音符の長さを取得する関数
  const getNoteDuration = (duration: number): string => {
    if (duration >= 2) return 'w';
    if (duration >= 1) return 'h';
    if (duration >= 0.5) return 'q';
    if (duration >= 0.25) return '8';
    if (duration >= 0.125) return '16';
    return '32';
  };

  // PlaybackManagerの使用
  const playbackState: PlaybackState = {
    isPlaying,
    isLooping,
    currentMeal,
    selectedGenre,
    selectedInstrument,
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


  // 初期化処理（ユーザージェスチャーが必要）
  const handleInitialize = async () => {
    try {
      showMessage("音アプリを初期化中...", 1000);
      
      // 少し待機してから初期化を開始
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialized = await simpleAudioEngine.initialize();
      if (!initialized) {
        showMessage("音声エンジンの初期化に失敗しました。もう一度お試しください。", 3000);
        return;
      }

      // 初期化が完了したことを確認
      if (simpleAudioEngine.isReady()) {
        showMessage("音アプリが起動しました！", 2000);
      } else {
        showMessage("初期化に失敗しました", 3000);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      showMessage("初期化中にエラーが発生しました。もう一度お試しください。", 3000);
    }
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
          selectedInstrument={selectedInstrument}
          setSelectedInstrument={setSelectedInstrument}
          currentMeal={currentMeal}
          onUpdateCategoryCount={handleUpdateCategoryCount}
          onResetMeal={handleResetMeal}
          isPlaying={isPlaying}
          isLooping={isLooping}
          toneStateManager={simpleAudioEngine}
          onPlay={() => playMealBalance(musicGenres)}
          onStop={stopPlayback}
          disabled={isPlaying}
          onInitialize={handleInitialize}
          currentScore={currentScore}
          showScore={showScore}
          onToggleScore={() => setShowScore(!showScore)}
          onExportScore={() => {
            showMessage("楽譜をダウンロードしました", 2000);
          }}
          onExportMIDI={() => {
            showMessage("MIDIファイルをダウンロードしました", 2000);
          }}
          onSaveScore={() => {
            showMessage("楽曲を保存しました", 2000);
          }}
          onShareScore={() => {
            showMessage("楽曲を共有しました", 2000);
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          userMessage={userMessage}
          useDragDrop={useDragDrop}
          showVisualizer={showVisualizer}
          showThemeCustomizer={showThemeCustomizer}
          onThemeChange={setCurrentTheme}
        />
      )}
    </div>
  );
};

export default SoundAppComponent;
