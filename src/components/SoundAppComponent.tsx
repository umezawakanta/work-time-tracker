import React, { useState, useEffect, useRef } from 'react';
import './SoundAppComponent.css';

// Web Audio APIの型定義を拡張
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// 食事カテゴリの定義
export interface FoodCategory {
  id: string;
  name: string;
  sound: {
    frequency: number;
    duration: number;
    volume: number;
  };
  color: string;
  instrument: string;
  // MP3ファイルのパスを追加
  soundFiles?: {
    low?: string;
    mid?: string;
    high?: string;
  };
}

// サウンドバッファの型
interface SoundBuffers {
  [key: string]: {
    [pitch: string]: AudioBuffer;
  };
}

// 定数定義（既存のものは省略）
const IDEAL_BALANCE_RATIOS = {
  staple: 0.4,
  side: 0.3,
  miso: 0.1,
  meat: 0.1,
  fish: 0.05,
  vegetable: 0.05
} as const;

const PLAYBACK_DURATION = 5000;

const TEMPO_RANGE = {
  MIN: 60,
  MAX: 200
} as const;

const REPEAT_OPTIONS = {
  NONE: 0,
  ONCE: 1,
  TWICE: 2,
  THREE_TIMES: 3,
  LOOP: -1
} as const;

// 音楽ジャンルの定義
export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
}

// 食事記録の型定義
export interface MealRecord {
  id: string;
  date: string;
  categories: {
    [key: string]: number;
  };
  notes?: string;
}

interface SoundAppComponentProps {
  showSoundApp: boolean;
  setShowSoundApp: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  useRealSounds?: boolean; // 実際の楽器音を使用するかのフラグ
}

const SoundAppComponent: React.FC<SoundAppComponentProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures,
  useRealSounds = false, // デフォルトはfalse（オシレーター使用）
}) => {
  // 食事カテゴリの定義（MP3ファイルパスを追加）
  const foodCategories: FoodCategory[] = [
    { 
      id: 'staple', 
      name: '主食', 
      sound: { frequency: 220, duration: 0.5, volume: 0.7 }, 
      color: '#8B4513', 
      instrument: '🥁 ドラム',
      soundFiles: {
        low: '/sounds/drums/kick.mp3',
        mid: '/sounds/drums/tom.mp3',
        high: '/sounds/drums/snare.mp3'
      }
    },
    { 
      id: 'side', 
      name: '副菜', 
      sound: { frequency: 330, duration: 0.4, volume: 0.6 }, 
      color: '#228B22', 
      instrument: '🎸 ベース',
      soundFiles: {
        low: '/sounds/bass/bass-c2.mp3',
        mid: '/sounds/bass/bass-e2.mp3',
        high: '/sounds/bass/bass-g2.mp3'
      }
    },
    { 
      id: 'miso', 
      name: '味噌', 
      sound: { frequency: 440, duration: 0.3, volume: 0.5 }, 
      color: '#D2691E', 
      instrument: '🎺 トランペット',
      soundFiles: {
        low: '/sounds/trumpet/trumpet-c3.mp3',
        mid: '/sounds/trumpet/trumpet-e3.mp3',
        high: '/sounds/trumpet/trumpet-g3.mp3'
      }
    },
    { 
      id: 'meat', 
      name: '肉', 
      sound: { frequency: 110, duration: 0.8, volume: 0.9 }, 
      color: '#DC143C', 
      instrument: '🎸 エレキギター',
      soundFiles: {
        low: '/sounds/guitar/guitar-e2.mp3',
        mid: '/sounds/guitar/guitar-a2.mp3',
        high: '/sounds/guitar/guitar-d3.mp3'
      }
    },
    { 
      id: 'fish', 
      name: '魚', 
      sound: { frequency: 880, duration: 0.6, volume: 0.8 }, 
      color: '#4169E1', 
      instrument: '🎹 シンセサイザー',
      soundFiles: {
        low: '/sounds/synth/synth-c3.mp3',
        mid: '/sounds/synth/synth-f3.mp3',
        high: '/sounds/synth/synth-a3.mp3'
      }
    },
    { 
      id: 'vegetable', 
      name: '野菜', 
      sound: { frequency: 660, duration: 0.4, volume: 0.7 }, 
      color: '#32CD32', 
      instrument: '🎹 ピアノ',
      soundFiles: {
        low: '/sounds/piano/piano-c3.mp3',
        mid: '/sounds/piano/piano-e3.mp3',
        high: '/sounds/piano/piano-g3.mp3'
      }
    },
  ];

  // 音楽ジャンルの定義
  const musicGenres: MusicGenre[] = [
    { id: 'balanced', name: 'バランス', baseTempo: 120, instruments: ['piano', 'strings'], description: 'バランスの取れた食事の時' },
    { id: 'vegetarian', name: 'ベジタリアン', baseTempo: 90, instruments: ['flute', 'harp'], description: 'ロハス的な音楽' },
    { id: 'meat-heavy', name: '肉多め', baseTempo: 160, instruments: ['drums', 'bass'], description: '暴力的な音楽' },
    { id: 'fish', name: '魚', baseTempo: 100, instruments: ['xylophone', 'bells'], description: 'お魚のうた風' },
    { id: 'custom', name: 'カスタム', baseTempo: 120, instruments: ['piano'], description: 'ユーザー設定' },
  ];

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>('balanced');
  const [customTempo, setCustomTempo] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.ONCE);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    categories: {}
  });

  // Web Audio API関連
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundBuffersRef = useRef<SoundBuffers>({});
  const audioPoolRef = useRef<{ [key: string]: HTMLAudioElement[] }>({});

  // オーディオコンテキストの初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }

      // 実際の楽器音を使用する場合、サウンドファイルをプリロード
      if (useRealSounds) {
        preloadSounds();
      }
    }
  }, [useRealSounds]);

  // サウンドファイルのプリロード（Web Audio API版）
  const preloadSounds = async () => {
    if (!audioContextRef.current) return;

    const totalFiles = foodCategories.reduce((count, category) => {
      if (category.soundFiles) {
        return count + Object.keys(category.soundFiles).length;
      }
      return count;
    }, 0);

    let loadedFiles = 0;

    try {
      for (const category of foodCategories) {
        if (!category.soundFiles) continue;

        soundBuffersRef.current[category.id] = {};
        
        for (const [pitch, path] of Object.entries(category.soundFiles)) {
          try {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            
            soundBuffersRef.current[category.id][pitch] = audioBuffer;
            loadedFiles++;
            setLoadingProgress((loadedFiles / totalFiles) * 100);
          } catch (error) {
            console.warn(`Failed to load sound: ${path}`, error);
            // フォールバック用のAudio要素を作成
            if (!audioPoolRef.current[category.id]) {
              audioPoolRef.current[category.id] = [];
            }
            const audio = new Audio(path);
            audio.preload = 'auto';
            audioPoolRef.current[category.id].push(audio);
          }
        }
      }
      
      setSoundsLoaded(true);
      showMessage('楽器音のロードが完了しました！', 2000);
    } catch (error) {
      console.error('Sound loading error:', error);
      showMessage('一部の楽器音のロードに失敗しました。オシレーターモードで動作します。', 4000);
    }
  };

  // ユーザーメッセージを表示する関数
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(''), duration);
  };

  // 実際の楽器音を再生する関数（Web Audio API版）
  const playRealInstrumentSound = (categoryId: string, pitch: 'low' | 'mid' | 'high', volume: number, startTime: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const buffer = soundBuffersRef.current[categoryId]?.[pitch];
    if (buffer) {
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(gainNodeRef.current);
      
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 2);
      
      source.start(startTime);
    } else {
      // フォールバック: Audio要素を使用
      const audioPool = audioPoolRef.current[categoryId];
      if (audioPool && audioPool.length > 0) {
        const audio = audioPool[0].cloneNode() as HTMLAudioElement;
        audio.volume = volume;
        audio.play();
      }
    }
  };

  // 音を生成する関数（オシレーター版とMP3版の切り替え）
  const playSound = (frequency: number, duration: number, volume: number, instrument: string, categoryId?: string) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    const { currentTime } = audioContextRef.current;

    // 実際の楽器音を使用する場合
    if (useRealSounds && categoryId && soundsLoaded) {
      // 周波数に基づいてピッチを選択
      let pitch: 'low' | 'mid' | 'high' = 'mid';
      if (frequency < 300) pitch = 'low';
      else if (frequency > 600) pitch = 'high';
      
      playRealInstrumentSound(categoryId, pitch, volume, currentTime);
      return;
    }

    // オシレーターを使用する場合（既存の実装）
    switch (instrument) {
      case '🥁 ドラム':
        createSoftOscillator(frequency * 0.4, duration * 0.3, volume * 0.8, 'sine', currentTime);
        createSoftOscillator(frequency * 1.5, duration * 0.15, volume * 0.4, 'triangle', currentTime + 0.05);
        break;
      case '🎸 ベース':
        createSoftOscillator(frequency * 0.7, duration * 1.2, volume * 0.6, 'sine', currentTime);
        createSoftOscillator(frequency * 1.4, duration * 0.8, volume * 0.2, 'sine', currentTime + 0.1);
        break;
      case '🎺 トランペット':
        createSoftOscillator(frequency * 1.0, duration * 0.8, volume * 0.7, 'sine', currentTime);
        createSoftOscillator(frequency * 1.5, duration * 0.6, volume * 0.3, 'sine', currentTime + 0.05);
        break;
      case '🎸 エレキギター':
        createSoftOscillator(frequency * 1.0, duration * 0.6, volume * 0.8, 'sine', currentTime);
        createSoftOscillator(frequency * 1.5, duration * 0.4, volume * 0.4, 'triangle', currentTime + 0.03);
        break;
      case '🎹 シンセサイザー':
        createSoftOscillator(frequency * 1.0, duration * 1.0, volume * 0.6, 'sine', currentTime);
        createSoftOscillator(frequency * 1.25, duration * 0.8, volume * 0.3, 'sine', currentTime + 0.02);
        createSoftOscillator(frequency * 1.5, duration * 0.6, volume * 0.2, 'sine', currentTime + 0.04);
        break;
      case '🎹 ピアノ':
        createSoftOscillator(frequency * 1.0, duration * 0.9, volume * 0.7, 'sine', currentTime);
        createSoftOscillator(frequency * 2.0, duration * 0.6, volume * 0.3, 'sine', currentTime + 0.02);
        createSoftOscillator(frequency * 3.0, duration * 0.4, volume * 0.15, 'sine', currentTime + 0.04);
        break;
      default:
        createSoftOscillator(frequency, duration, volume, 'sine', currentTime);
        break;
    }
  };

  // 心地よいオシレーターを作成するヘルパー関数
  const createSoftOscillator = (frequency: number, duration: number, volume: number, waveType: OscillatorType, startTime: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.Q.setValueAtTime(1, startTime);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(gainNodeRef.current);

    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  // 食事バランスを音に変換する関数
  const playMealBalance = () => {
    if (isPlaying && !isLooping) {
      showMessage('音声を再生中です。しばらくお待ちください。');
      return;
    }

    // Web Audio APIの再開（ユーザーインタラクション後）
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setIsPlaying(true);
    const genre = musicGenres.find(g => g.id === selectedGenre);
    if (!genre) {
      setIsPlaying(false);
      showMessage('音楽ジャンルが見つかりません。', 5000);
      return;
    }

    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      setIsPlaying(false);
      showMessage('食事を記録してから音声を再生してください。', 5000);
      return;
    }

    const categoryRatios = foodCategories.map(category => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems
    }));

    const balanceScore = calculateBalanceScore(categoryRatios);
    generateMusic(categoryRatios, balanceScore, genre);
    
    const balanceMessage = balanceScore > 0.7 
      ? '素晴らしいバランスです！' 
      : balanceScore > 0.4 
        ? 'バランスが改善できそうです。'
        : 'バランスを改善することをお勧めします。';
    showMessage(balanceMessage, 4000);

    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      const loopInterval = setInterval(() => {
        if (!isLooping) {
          clearInterval(loopInterval);
          return;
        }
        generateMusic(categoryRatios, balanceScore, genre);
      }, PLAYBACK_DURATION);
    } else if (repeatMode > 0) {
      let repeatCount = 0;
      const repeatInterval = setInterval(() => {
        repeatCount++;
        if (repeatCount >= repeatMode) {
          clearInterval(repeatInterval);
          setIsPlaying(false);
          return;
        }
        generateMusic(categoryRatios, balanceScore, genre);
      }, PLAYBACK_DURATION);
    } else {
      setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
    }
  };

  // バランススコアを計算する関数
  const calculateBalanceScore = (categoryRatios: (FoodCategory & { ratio: number })[]): number => {
    let score = 0;
    categoryRatios.forEach(category => {
      const ideal = category.id in IDEAL_BALANCE_RATIOS
        ? IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS]
        : 0;
      const actual = category.ratio;
      score += 1 - Math.abs(ideal - actual);
    });

    return Math.max(0, Math.min(1, score / categoryRatios.length));
  };

  // 音楽を生成する関数
  const generateMusic = (categoryRatios: (FoodCategory & { ratio: number })[], balanceScore: number, genre: MusicGenre) => {
    const baseTempo = selectedGenre === 'custom' ? customTempo : genre.baseTempo;
    const adjustedTempo = Math.max(80, Math.min(140, baseTempo * (0.7 + balanceScore * 0.3)));
    const adjustedBeatDuration = 60 / adjustedTempo;

    const sortedCategories = categoryRatios
      .filter(cat => cat.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio);

    sortedCategories.forEach((category, index) => {
      const delay = index * adjustedBeatDuration * 0.8;
      const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
      const duration = category.sound.duration * (0.8 + balanceScore * 0.4);
      const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

      setTimeout(() => {
        playSound(frequency, duration, volume, category.instrument, category.id);
      }, delay * 1000);
    });

    if (balanceScore > 0.6) {
      const harmonyDelay = sortedCategories.length * adjustedBeatDuration * 0.8 + 1000;
      setTimeout(() => {
        playSound(220, 2.0, 0.4, '🎹 ピアノ', 'vegetable');
        setTimeout(() => playSound(275, 1.8, 0.3, '🎹 ピアノ', 'vegetable'), 200);
        setTimeout(() => playSound(330, 1.6, 0.25, '🎹 ピアノ', 'vegetable'), 400);
      }, harmonyDelay);
    }
  };

  // カテゴリの数量を更新する関数
  const updateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: Math.max(0, count)
      }
    }));
  };

  // カテゴリの数量をリセットする関数
  const resetMeal = () => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: {}
    }));
  };

  // リピート停止関数
  const stopRepeat = () => {
    setIsLooping(false);
    setIsPlaying(false);
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ {useRealSounds ? '（リアル楽器モード）' : '（シンセサイザーモード）'}
        </h2>
        <div className="section-controls">
          {showSoundApp ? (
            <button
              onClick={() => setShowSoundApp(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("sound-app");
                setShowSoundApp(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {showSoundApp && (
        <div className="sound-app-content">
          {/* ローディング表示 */}
          {useRealSounds && !soundsLoaded && (
            <div className="loading-overlay">
              <div className="loading-content">
                <h3>楽器音をロード中...</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <p>{Math.round(loadingProgress)}%</p>
              </div>
            </div>
          )}

          {/* 説明文 */}
          <div className="app-description">
            <p>食事のバランスを音で表現し、心地よいリズムで健康状態を確認できます。</p>
            {useRealSounds && (
              <p className="real-sound-notice">
                🎵 リアル楽器モード: 実際の楽器音を使用しています
              </p>
            )}
          </div>

          {/* 音楽ジャンル選択 */}
          <div className="genre-selection">
            <h3>🎼 音楽ジャンル選択</h3>
            <div className="genre-grid">
              {musicGenres.map(genre => (
                <button
                  key={genre.id}
                  className={`genre-button ${selectedGenre === genre.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  <div className="genre-name">{genre.name}</div>
                  <div className="genre-description">{genre.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* カスタム設定 */}
          {selectedGenre === 'custom' && (
            <div className="custom-settings">
              <h4>カスタム設定</h4>
              <div className="setting-group">
                <label>テンポ: {customTempo} BPM</label>
                <input
                  type="range"
                  min={TEMPO_RANGE.MIN}
                  max={TEMPO_RANGE.MAX}
                  value={customTempo}
                  onChange={(e) => setCustomTempo(parseInt(e.target.value, 10))}
                  aria-label="カスタムテンポ設定"
                />
              </div>
            </div>
          )}

          {/* リピート設定 */}
          <div className="repeat-settings">
            <h4>🔄 リピート設定</h4>
            <div className="repeat-options">
              {Object.entries(REPEAT_OPTIONS).map(([key, value]) => (
                <button
                  key={key}
                  className={`repeat-button ${repeatMode === value ? 'selected' : ''}`}
                  onClick={() => setRepeatMode(value)}
                >
                  {key === 'NONE' ? 'なし' : 
                   key === 'ONCE' ? '1回' :
                   key === 'TWICE' ? '2回' :
                   key === 'THREE_TIMES' ? '3回' : 'ループ'}
                </button>
              ))}
            </div>
          </div>

          {/* 食事記録 */}
          <div className="meal-recording">
            <h3>🍽️ 食事記録</h3>
            <div className="category-grid">
              {foodCategories.map(category => (
                <div key={category.id} className="category-item">
                  <div 
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-instrument">{category.instrument}</span>
                  </div>
                  <div className="count-controls">
                    <button
                      onClick={() => updateCategoryCount(category.id, (currentMeal.categories[category.id] || 0) - 1)}
                      className="count-button"
                    >
                      -
                    </button>
                    <span className="count-display">
                      {currentMeal.categories[category.id] || 0}
                    </span>
                    <button
                      onClick={() => updateCategoryCount(category.id, (currentMeal.categories[category.id] || 0) + 1)}
                      className="count-button"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="meal-actions">
              <button onClick={resetMeal} className="reset-button">
                リセット
              </button>
            </div>
          </div>

          {/* 音声再生コントロール */}
          <div className="sound-controls">
            <h3>🎵 音声再生</h3>
            <div className="play-controls">
              <button
                onClick={playMealBalance}
                disabled={isPlaying || Object.values(currentMeal.categories).every(count => count === 0)}
                className={`play-button ${isPlaying ? 'playing' : ''}`}
              >
                {isPlaying ? '再生中...' : '食事バランスを音で確認'}
              </button>
              {isLooping && (
                <button
                  onClick={stopRepeat}
                  className="stop-button"
                >
                  停止
                </button>
              )}
            </div>
            
            {/* ユーザーメッセージ表示 */}
            {userMessage && (
              <div className="user-message">
                <div className="message-content">
                  <span>{userMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* バランス表示 */}
          <div className="balance-display">
            <h3>📊 バランス分析</h3>
            <div className="balance-chart">
              {foodCategories.map(category => {
                const count = currentMeal.categories[category.id] || 0;
                const total = Object.values(currentMeal.categories).reduce((sum, c) => sum + c, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={category.id} className="balance-bar">
                    <div className="bar-label">
                      <span 
                        className="bar-color"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      {category.name}
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: category.color 
                        }}
                      ></div>
                      <span className="bar-percentage">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;