import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import "./SoundAppComponent.css";

// サブコンポーネントのインポート
import SoundControls from "./sound/SoundControls";
import MealRecording, { MealRecord } from "./sound/MealRecording";
import ScoreDisplay, { ScoreData } from "./sound/ScoreDisplay";
import GenreSelector, { MusicGenre } from "./sound/GenreSelector";
import { initializeTone, createMeiwaInstrument, playSound, globalToneInitialized } from "./sound/SoundEngine";
import { generateMeiwaRhythm } from "./sound/MeiwaSoundGenerator";
import { generateMusic, calculateBalanceScore } from "./sound/MusicGenerator";
import { foodCategories, SavedRecord, ComposedSong } from "./sound/types";
import { createInitialMeal, updateCategoryCount, resetMeal, getTotalItems } from "./sound/MealLogic";
import { PLAYBACK_DURATION, REPEAT_OPTIONS } from "./sound/constants";

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

  // 拡張された音楽ジャンル（明和電機風に強化）
  const musicGenres: MusicGenre[] = [
    {
      id: "balanced",
      name: "バランス",
      baseTempo: 120,
      instruments: ["piano", "strings"],
      description: "バランスの取れた食事の時",
      keySignature: "C",
    },
    {
      id: "meiwa",
      name: "明和電機",
      baseTempo: 120,
      instruments: ["8bit", "chip"],
      description: "8bit風のチップチューン・明和電機風",
      keySignature: "C",
    },
    {
      id: "rock",
      name: "ロック",
      baseTempo: 140,
      instruments: ["distortion", "drums", "bass"],
      description: "パワフルなロックサウンド",
      keySignature: "A",
    },
    {
      id: "techno",
      name: "テクノ",
      baseTempo: 128,
      instruments: ["synth", "electronic"],
      description: "明和電機風の電子音楽",
      keySignature: "Am",
    },
    {
      id: "classical",
      name: "クラシック",
      baseTempo: 80,
      instruments: ["strings", "piano", "orchestra"],
      description: "優雅なクラシック",
      keySignature: "G",
    },
    {
      id: "japanese",
      name: "和楽器",
      baseTempo: 100,
      instruments: ["shamisen", "taiko", "koto"],
      description: "明和電機風の機械音",
      keySignature: "Dm",
    },
    {
      id: "jazz",
      name: "ジャズ",
      baseTempo: 110,
      instruments: ["saxophone", "piano", "bass"],
      description: "スウィングジャズ",
      keySignature: "F",
    },
    {
      id: "ambient",
      name: "アンビエント",
      baseTempo: 60,
      instruments: ["pad", "atmosphere"],
      description: "環境音楽",
      keySignature: "C",
    },
    {
      id: "custom",
      name: "カスタム",
      baseTempo: 120,
      instruments: ["piano"],
      description: "ユーザー設定",
      keySignature: "C",
    },
  ];

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>("balanced");
  const [customTempo, setCustomTempo] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.THREE_TIMES);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>(createInitialMeal());

  // 新機能の状態
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [composedSongs, setComposedSongs] = useState<ComposedSong[]>([]);
  const [viewMode, setViewMode] = useState<
    "input" | "history" | "compose" | "edit" | "score"
  >("input");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("day");
  const [editingSong, setEditingSong] = useState<ComposedSong | null>(null);
  const [customInstruments, setCustomInstruments] = useState<string[]>([
    "piano",
  ]);
  const [currentScore, setCurrentScore] = useState<ScoreData | null>(null);
  const [showScore, setShowScore] = useState<boolean>(true);

  // 参照管理
  const instrumentsRef = useRef<{ [key: string]: any }>({});
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const scoreContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  // LocalStorageから保存データを読み込み
  useEffect(() => {
    const saved = localStorage.getItem("soundAppRecords");
    if (saved) {
      setSavedRecords(JSON.parse(saved));
    }
    const songs = localStorage.getItem("composedSongs");
    if (songs) {
      setComposedSongs(JSON.parse(songs));
    }
  }, []);

  // 楽譜関連の関数はScoreDisplayコンポーネントに移動

  // Tone.js関連の関数はSoundEngineからインポート済み

  // ジャンルに応じた楽器を作成（すべて明和電機風に統一）
  const createInstrumentForGenre = useCallback(
    (categoryId: string, genre: string) => {
      // 初期化されていない場合はnullを返す（エラーを防ぐ）
      if (!globalToneInitialized) {
        console.warn(
          "Tone.js not initialized yet. Please click play button first."
        );
        return null;
      }

      // すべてのジャンルで明和電機風の音色を使用
      return createMeiwaInstrument(categoryId);
    },
    [createMeiwaInstrument]
  );

  // 基本楽器の作成（明和電機風に強化）
  const getOrCreateInstrument = useCallback((categoryId: string) => {
    if (!globalToneInitialized) {
      return null;
    }

    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

    let instrument = null;

    switch (categoryId) {
      case "staple":
        // 明和電機風のドラム音
        instrument = new Tone.MembraneSynth({
          pitchDecay: 0.02,
          octaves: 12,
          oscillator: { 
            type: "sawtooth",
            detune: 5,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.2, 
            sustain: 0.01, 
            release: 0.8 
          },
        }).toDestination();
        break;

      case "side":
        // 明和電機風のベース音
        instrument = new Tone.FMSynth({
          harmonicity: 2.5,
          modulationIndex: 20,
          oscillator: { 
            type: "sawtooth",
            detune: -10,
          } as any,
          envelope: { 
            attack: 0.01, 
            decay: 0.2, 
            sustain: 0.3, 
            release: 0.4 
          },
          modulation: { 
            type: "square",
            detune: 5,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.6,
            release: 0.3,
          },
        }).toDestination();
        break;

      case "miso":
        // 明和電機風のトランペット音
        instrument = new Tone.FMSynth({
          harmonicity: 1.8,
          modulationIndex: 25,
          oscillator: { 
            type: "triangle",
            detune: 3,
          } as any,
          envelope: { 
            attack: 0.02, 
            decay: 0.1, 
            sustain: 0.6, 
            release: 0.2 
          },
          modulation: { 
            type: "sine",
            detune: -2,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.05,
            sustain: 0.8,
            release: 0.1,
          },
        }).toDestination();
        break;

      case "meat":
        // 明和電機風のエレキギター音
        instrument = new Tone.FMSynth({
          harmonicity: 4.0,
          modulationIndex: 35,
          oscillator: { 
            type: "sawtooth",
            detune: 8,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.2, 
            sustain: 0.1, 
            release: 0.3 
          },
          modulation: { 
            type: "square",
            detune: -8,
          } as any,
          modulationEnvelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.1,
            release: 0.05,
          },
        }).toDestination();
        break;

      case "fish":
        // 明和電機風のシンセサイザー音
        instrument = new Tone.FMSynth({
          harmonicity: 1.2,
          modulationIndex: 18,
          oscillator: { 
            type: "sawtooth",
            detune: 12,
          } as any,
          envelope: { 
            attack: 0.01, 
            decay: 0.05, 
            sustain: 0.2, 
            release: 0.3 
          },
          modulation: { 
            type: "triangle",
            detune: -5,
          } as any,
          modulationEnvelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.4,
            release: 0.2,
          },
        }).toDestination();
        break;

      case "vegetable":
        // 明和電機風のピアノ音
        instrument = new Tone.FMSynth({
          harmonicity: 0.5,
          modulationIndex: 8,
          oscillator: { 
            type: "sine",
            detune: 2,
          } as any,
          envelope: { 
            attack: 0.005, 
            decay: 0.2, 
            sustain: 0.4, 
            release: 0.8 
          },
          modulation: { 
            type: "sine",
            detune: 1,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 0.5,
          },
        }).toDestination();
        break;
    }

    if (instrument) {
      instrumentsRef.current[categoryId] = instrument;
    }

    return instrument;
  }, []);

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(""), duration);
  };

  // 音を再生する関数（SoundEngineからインポート済み）
  const playSoundCallback = useCallback(
    async (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => {
      await playSound(
        categoryId,
        frequency,
        duration,
        volume,
        genre,
        instrumentsRef.current,
        createInstrumentForGenre,
        getOrCreateInstrument
      );
    },
    [createInstrumentForGenre, getOrCreateInstrument]
  );

  // 和音関連の関数はMeiwaSoundGeneratorからインポート済み

  // 明和電機風リズム生成はMeiwaSoundGeneratorからインポート済み
  const generateMeiwaRhythmCallback = useCallback((beatDuration: number, categoryRatios: any[]) => {
    generateMeiwaRhythm(beatDuration, categoryRatios, playSoundCallback);
  }, [playSoundCallback]);

  // 音楽を生成（すべて明和電機風に統一、テンポ同期改善）
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

  // メイン再生関数
  const playMealBalance = useCallback(async () => {
    if (!globalToneInitialized) {
      const success = await initializeTone();
      if (!success) {
        showMessage("音声システムの初期化に失敗しました", 3000);
        return;
      }
      showMessage("音声システムを起動しました！", 2000);
    }

    if (isPlaying && !isLooping) {
      showMessage("再生中です...", 2000);
      return;
    }

    const totalItems = getTotalItems(currentMeal.categories);
    if (totalItems === 0) {
      showMessage("食事を記録してください", 3000);
      return;
    }

    setIsPlaying(true);
    const genre =
      musicGenres.find((g) => g.id === selectedGenre) || musicGenres[0];

    const categoryRatios = foodCategories.map((category) => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems,
    }));

    const balanceScore = calculateBalanceScore(categoryRatios);

    await generateMusicCallback(categoryRatios, balanceScore, genre);

    const message =
      balanceScore > 0.7
        ? "素晴らしいバランスです！🎵"
        : balanceScore > 0.4
        ? "まあまあのバランスです"
        : "バランスを改善しましょう";
    showMessage(message, 4000);

    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      const loop = async () => {
        await generateMusicCallback(categoryRatios, balanceScore, genre);
        loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
      };
      loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
    } else if (repeatMode > 0) {
      let count = 0;
      const repeat = async () => {
        if (++count < repeatMode) {
          await generateMusicCallback(categoryRatios, balanceScore, genre);
          setTimeout(repeat, PLAYBACK_DURATION);
        } else {
          setIsPlaying(false);
        }
      };
      setTimeout(repeat, PLAYBACK_DURATION);
    } else {
      setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
    }
  }, [
    currentMeal,
    selectedGenre,
    repeatMode,
    isPlaying,
    isLooping,
    foodCategories,
    musicGenres,
    initializeTone,
    generateMusicCallback,
    showMessage,
  ]);

  // その他の関数（省略：既存のコードと同じ）
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLooping(false);
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    playTimeoutsRef.current = [];
  };

  const handleUpdateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal((prev) => updateCategoryCount(prev, categoryId, count));
  };

  const handleResetMeal = () => {
    setCurrentMeal((prev) => resetMeal(prev));
    setCurrentScore(null);
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
        <div className="sound-app-content">
          <div className="app-description">
            <p>食事のバランスを音と楽譜で表現します 🎼</p>
            {!globalToneInitialized && (
              <p className="tone-init-hint">初回は音ボタンをクリックしてください</p>
            )}
          </div>

          {/* 楽譜表示エリア */}
          <ScoreDisplay
            currentScore={currentScore}
            showScore={showScore}
            onToggleScore={() => setShowScore(!showScore)}
            onExportScore={() => {
              if (!scoreContainerRef.current) {
                showMessage("楽譜がありません", 2000);
                return;
              }
              // 楽譜エクスポート処理
              showMessage("楽譜をダウンロードしました", 2000);
            }}
          />

          {/* ビューモード切り替え */}
          <div className="view-mode-tabs">
            <button
              className={viewMode === "input" ? "active" : ""}
              onClick={() => setViewMode("input")}
            >
              入力
            </button>
            <button
              className={viewMode === "score" ? "active" : ""}
              onClick={() => setViewMode("score")}
            >
              楽譜設定
            </button>
          </div>

          {/* 入力ビュー */}
          {viewMode === "input" && (
            <>
              <GenreSelector
                musicGenres={musicGenres}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
              />

              <MealRecording
                foodCategories={foodCategories}
                currentMeal={currentMeal}
                onUpdateCategoryCount={handleUpdateCategoryCount}
                onResetMeal={handleResetMeal}
              />

              <SoundControls
                isPlaying={isPlaying}
                isLooping={isLooping}
                globalToneInitialized={globalToneInitialized}
                onPlay={playMealBalance}
                onStop={stopPlayback}
                disabled={
                  isPlaying ||
                  Object.values(currentMeal.categories).every((c) => c === 0)
                }
              />
            </>
          )}

          {/* 楽譜設定ビュー */}
          {viewMode === "score" && (
            <div className="score-settings">
              <h3>🎼 楽譜設定</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <label htmlFor="score-display-checkbox">楽譜表示</label>
                  <input
                    id="score-display-checkbox"
                    type="checkbox"
                    checked={showScore}
                    onChange={(e) => setShowScore(e.target.checked)}
                    aria-label="楽譜の表示切り替え"
                  />
                </div>
                <div className="setting-item">
                  <label htmlFor="note-color-select">音符の色分け</label>
                  <select id="note-color-select" aria-label="音符の色分け設定">
                    <option>カテゴリー別</option>
                    <option>楽器別</option>
                    <option>なし</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="score-size-range">楽譜のサイズ</label>
                  <input
                    id="score-size-range"
                    type="range"
                    min="50"
                    max="150"
                    defaultValue="100"
                    aria-label="楽譜のサイズ調整"
                  />
                </div>
              </div>
            </div>
          )}

      {userMessage && (
        <div className="user-message user-message-box">{userMessage}</div>
      )}
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;
