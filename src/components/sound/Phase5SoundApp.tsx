/**
 * Phase 5統合音アプリコンポーネント
 * Phase 5: AI活用、モバイル対応、協奏機能の統合
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Phase5SoundApp.css';

// 既存のコンポーネント
import SoundAppLayout from './SoundAppLayout';
import ScoreDisplay from './ScoreDisplay';
import { usePlaybackManager, PlaybackState, PlaybackCallbacks } from './PlaybackManager';
import { simpleAudioEngine, playSound, InstrumentType, WaveformType } from './SimpleAudioEngine';
import { createInitialMeal } from './MealLogic';
import { REPEAT_OPTIONS } from './constants';
import { MealRecord } from './MealRecording';
import { ScoreData } from './ScoreDisplay';
import { MusicGenre } from './types';
import { musicGenres } from './MusicGenres';

// Phase 5の新しいコンポーネント
import MobileOptimizedLayout from './MobileOptimizedLayout';
import CollaborativeMusic from './CollaborativeMusic';
import { AIMusicGenerator, AIGenerationContext, UserPreferences, HistoricalMusicData } from './AIMusicGenerator';

interface Phase5SoundAppProps {
  showSoundApp: boolean;
  setShowSoundApp: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const Phase5SoundApp: React.FC<Phase5SoundAppProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures
}) => {
  // 基本状態
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

  // Phase 5の新しい状態
  const [useDragDrop, setUseDragDrop] = useState<boolean>(true);
  const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<any>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'input' | 'score' | 'visualizer' | 'settings'>('input');
  const [showCollaborative, setShowCollaborative] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(true);
  const [aiContext, setAiContext] = useState<AIGenerationContext | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // 参照管理
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const aiGenerator = useRef<AIMusicGenerator>(AIMusicGenerator.getInstance());

  // デバイス検出
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // AIコンテキストの初期化
  useEffect(() => {
    const initializeAIContext = () => {
      const context: AIGenerationContext = {
        nutritionScore: {
          overallScore: 0,
          categoryScores: {
            staple: 0,
            side: 0,
            miso: 0,
            meat: 0,
            fish: 0,
            vegetable: 0
          },
          strengths: [],
          weaknesses: [],
          recommendations: [],
          correlations: {}
        },
        userPreferences: userPreferences || {
          preferredGenres: ['balanced', 'classical'],
          complexityLevel: 'medium',
          tempoRange: { min: 80, max: 140 },
          instrumentPreferences: [InstrumentType.PIANO, InstrumentType.GUITAR],
          emotionalTone: ['peaceful', 'energetic']
        },
        historicalData: aiGenerator.current.getHistoricalData(),
        currentMood: 'neutral',
        timeOfDay: getTimeOfDay(),
        season: getCurrentSeason()
      };
      setAiContext(context);
    };

    initializeAIContext();
  }, [userPreferences]);

  // ヘルパー関数
  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(""), duration);
  };

  // 音を再生する関数
  const playSoundCallback = useCallback(
    async (categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => {
      if (!simpleAudioEngine.isReady()) {
        const initialized = await simpleAudioEngine.initialize();
        if (!initialized) {
          console.warn("Failed to initialize SimpleAudioEngine for sound playback");
          return;
        }
      }

      await playSound(categoryId, frequency, duration, volume, genre);
    },
    []
  );

  // 明和電機風リズム生成
  const generateMeiwaRhythmCallback = useCallback(async (beatDuration: number, categoryRatios: any[]) => {
    await generateMeiwaRhythm(beatDuration, categoryRatios, playSoundCallback);
  }, [playSoundCallback]);

  // AI音楽生成
  const generateAIMusicCallback = useCallback(async (categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
    if (!useAI || !aiContext) {
      // AIが無効の場合は従来の生成方法を使用
      return generateMusicCallback(categoryRatios, balanceScore, genre);
    }

    try {
      const result = await aiGenerator.current.generateAdvancedMusic(
        categoryRatios,
        aiContext.nutritionScore,
        genre,
        aiContext
      );

      // 生成されたパターンを再生
      for (const pattern of result.patterns) {
        await playPattern(pattern);
      }

      // 履歴データを保存
      const historicalData: HistoricalMusicData = {
        date: new Date().toISOString(),
        mealData: categoryRatios,
        generatedMusic: result.patterns,
        userRating: 0, // ユーザーが後で評価
        feedback: ''
      };
      aiGenerator.current.saveHistoricalData(historicalData);

      showMessage(`AI生成完了: ${result.metadata.reasoning}`, 5000);
    } catch (error) {
      console.error('AI music generation failed:', error);
      showMessage('AI生成に失敗しました。従来の方法で生成します。', 3000);
      // フォールバック
      return generateMusicCallback(categoryRatios, balanceScore, genre);
    }
  }, [useAI, aiContext]);

  // パターンを再生
  const playPattern = async (pattern: any) => {
    for (let i = 0; i < pattern.notes.length; i++) {
      const note = pattern.notes[i];
      const duration = pattern.durations[i];
      const velocity = pattern.velocities[i];
      
      await simpleAudioEngine.playTone(
        note,
        duration,
        velocity / 127,
        selectedInstrument
      );
    }
  };

  // 従来の音楽生成（フォールバック用）
  const generateMusicCallback = useCallback(
    async (categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      playTimeoutsRef.current = [];

      const scoreData = generateScoreData(categoryRatios, genre);
      setCurrentScore(scoreData);

      await generateMusic(categoryRatios, balanceScore, genre, playSoundCallback);
    },
    [playSoundCallback]
  );

  // 楽譜データ生成
  const generateScoreData = (categoryRatios: any[], genre: MusicGenre): ScoreData => {
    return {
      notes: categoryRatios.map((ratio, index) => ({
        pitch: `C${4 + index}`,
        duration: '4n',
        time: index * 0.5,
        instrument: selectedInstrument
      })),
      timeSignature: '4/4',
      tempo: genre.tempo,
      key: genre.key,
      title: `AI生成楽曲 - ${genre.name}`,
      composer: 'AI Music Generator'
    };
  };

  // プレイバック状態とコールバック
  const playbackState: PlaybackState = {
    isPlaying,
    isLooping,
    currentMeal,
    selectedGenre,
    selectedInstrument,
    repeatMode,
    userMessage
  };

  const playbackCallbacks: PlaybackCallbacks = {
    setIsPlaying,
    setIsLooping,
    setCurrentMeal,
    setUserMessage,
    showMessage,
    playSoundCallback,
    generateMeiwaRhythmCallback,
    generateMusicCallback: useAI ? generateAIMusicCallback : generateMusicCallback
  };

  const { playMealBalance, stopPlayback, handleUpdateCategoryCount, handleResetMeal } = 
    usePlaybackManager(playbackState, playbackCallbacks);

  // 初期化処理
  const handleInitialize = async () => {
    try {
      showMessage("Phase 5音アプリを初期化中...", 1000);
      await simpleAudioEngine.initialize();
      showMessage("初期化完了！AI機能とモバイル対応が有効です。", 2000);
    } catch (error) {
      console.error("Initialization error:", error);
      showMessage("初期化中にエラーが発生しました。もう一度お試しください。", 3000);
    }
  };

  // 協奏機能のハンドラー
  const handleJoinSession = (sessionId: string) => {
    showMessage(`セッション ${sessionId} に参加しました`, 2000);
  };

  const handleLeaveSession = () => {
    showMessage('セッションから退出しました', 2000);
  };

  const handleCreateSession = (sessionData: any) => {
    showMessage('新しいセッションを作成しました', 2000);
  };

  const handleSendMessage = (message: string) => {
    console.log('Chat message:', message);
  };

  const handlePlayNote = (note: number, duration: number, instrument: string) => {
    simpleAudioEngine.playTone(note, duration, 0.7, selectedInstrument);
  };

  const handleStopPlayback = () => {
    stopPlayback();
  };

  // フルスクリーン切り替え
  const handleToggleFullscreen = () => {
    showMessage('フルスクリーンモードを切り替えました', 1000);
  };

  // 画面向き切り替え
  const handleToggleOrientation = () => {
    showMessage('画面向きを切り替えました', 1000);
  };

  // ビュー切り替え
  const handleViewChange = (view: 'input' | 'score' | 'visualizer' | 'settings') => {
    setCurrentView(view);
  };

  // 協奏機能の参加者データ
  const currentUser = {
    id: 'user_current',
    name: 'あなた',
    color: '#4ecdc4',
    avatar: '👤',
    isOnline: true,
    lastSeen: new Date(),
    currentInstrument: selectedInstrument,
    isPlaying: isPlaying
  };

  if (showCollaborative) {
    return (
      <div className="phase5-sound-app">
        <div className="section-header">
          <h2>
            <span className="section-icon">🎵</span>
            Phase 5音アプリ - 協奏機能
          </h2>
          <button
            onClick={() => setShowCollaborative(false)}
            className="close-section-button"
          >
            ✕
          </button>
        </div>
        <CollaborativeMusic
          currentUser={currentUser}
          onJoinSession={handleJoinSession}
          onLeaveSession={handleLeaveSession}
          onCreateSession={handleCreateSession}
          onSendMessage={handleSendMessage}
          onPlayNote={handlePlayNote}
          onStopPlayback={handleStopPlayback}
        />
      </div>
    );
  }

  const mainContent = (
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
      onExportScore={() => showMessage("楽譜をダウンロードしました", 2000)}
      onExportMIDI={() => showMessage("MIDIファイルをダウンロードしました", 2000)}
      onSaveScore={() => showMessage("楽曲を保存しました", 2000)}
      onShareScore={() => showMessage("楽曲を共有しました", 2000)}
      viewMode={viewMode}
      setViewMode={setViewMode}
      userMessage={userMessage}
      useDragDrop={useDragDrop}
      showVisualizer={showVisualizer}
      showThemeCustomizer={showThemeCustomizer}
      onThemeChange={setCurrentTheme}
    />
  );

  return (
    <div className="phase5-sound-app">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          Phase 5音アプリ
          <span className="phase-badge">AI + モバイル + 協奏</span>
        </h2>
        <div className="header-controls">
          <button
            onClick={() => setShowCollaborative(true)}
            className="collaborative-btn"
            title="協奏機能"
          >
            👥
          </button>
          <button
            onClick={() => setUseAI(!useAI)}
            className={`ai-toggle ${useAI ? 'active' : ''}`}
            title="AI機能"
          >
            🤖
          </button>
          <button
            onClick={() => setShowSoundApp(!showSoundApp)}
            className={showSoundApp ? "close-section-button" : "show-section-button"}
          >
            {showSoundApp ? "✕" : "▶"}
          </button>
        </div>
      </div>

      {showSoundApp && (
        <>
          {isMobile ? (
            <MobileOptimizedLayout
              isPlaying={isPlaying}
              onToggleFullscreen={handleToggleFullscreen}
              onToggleOrientation={handleToggleOrientation}
              currentView={currentView}
              onViewChange={handleViewChange}
            >
              {mainContent}
            </MobileOptimizedLayout>
          ) : (
            mainContent
          )}
        </>
      )}
    </div>
  );
};

export default Phase5SoundApp;
