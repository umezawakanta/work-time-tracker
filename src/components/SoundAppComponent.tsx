import React, { useState, useEffect, useRef } from 'react';
import './SoundAppComponent.css';

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
}

// 定数定義
const IDEAL_BALANCE_RATIOS = {
  staple: 0.4,
  side: 0.3,
  miso: 0.1,
  meat: 0.1,
  fish: 0.05,
  vegetable: 0.05
} as const;

const MUSICAL_NOTES = {
  A: 440,
  C_SHARP: 554.37,
  E: 659.25
} as const;

const TIMING_DELAYS = {
  C_SHARP_OFFSET: 200,
  E_OFFSET: 400
} as const;

const PLAYBACK_DURATION = 5000; // 5秒

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
    [key: string]: number; // カテゴリID -> 数量
  };
  notes?: string;
}

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
  // 食事カテゴリの定義
  const foodCategories: FoodCategory[] = [
    { id: 'staple', name: '主食', sound: { frequency: 220, duration: 0.5, volume: 0.7 }, color: '#8B4513' },
    { id: 'side', name: '副菜', sound: { frequency: 330, duration: 0.4, volume: 0.6 }, color: '#228B22' },
    { id: 'miso', name: '味噌', sound: { frequency: 440, duration: 0.3, volume: 0.5 }, color: '#D2691E' },
    { id: 'meat', name: '肉', sound: { frequency: 110, duration: 0.8, volume: 0.9 }, color: '#DC143C' },
    { id: 'fish', name: '魚', sound: { frequency: 880, duration: 0.6, volume: 0.8 }, color: '#4169E1' },
    { id: 'vegetable', name: '野菜', sound: { frequency: 660, duration: 0.4, volume: 0.7 }, color: '#32CD32' },
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
  const [customInstruments, setCustomInstruments] = useState<string[]>(['piano']);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    categories: {}
  });

  // Web Audio API関連
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // オーディオコンテキストの初期化
  useEffect(() => {
    // TypeScript-safe detection of AudioContext and webkitAudioContext
    const AudioCtx =
      typeof window !== 'undefined' && 'AudioContext' in window
        ? window.AudioContext
        : typeof window !== 'undefined' && 'webkitAudioContext' in window
          // @ts-ignore: webkitAudioContext is not in the standard DOM typings
          ? (window as any).webkitAudioContext
          : undefined;
    if (AudioCtx) {
      audioContextRef.current = new AudioCtx();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  // 音を生成する関数
  const playSound = (frequency: number, duration: number, volume: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(gainNodeRef.current);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // 食事バランスを音に変換する関数
  const playMealBalance = () => {
    if (isPlaying) {
      return;
    }

    setIsPlaying(true);
    const genre = musicGenres.find(g => g.id === selectedGenre);
    if (!genre) {
      return;
    }

    // バランス分析
    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      setIsPlaying(false);
      return;
    }

    // 各カテゴリの割合を計算
    const categoryRatios = foodCategories.map(category => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems
    }));

    // バランススコアを計算（0-1の範囲）
    const balanceScore = calculateBalanceScore(categoryRatios);

    // 音楽を生成
    generateMusic(categoryRatios, balanceScore, genre);

    setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
  };

  // IDEAL_BALANCE_RATIOSに存在しないカテゴリIDを処理する関数
  function handleMissingIdealRatio(categoryId: string): number {
    console.warn(`Missing ideal balance ratio for category: ${categoryId}`);
    return 0;
  }

  // バランススコアを計算する関数
  const calculateBalanceScore = (categoryRatios: (FoodCategory & { ratio: number })[]): number => {
    let score = 0;
    categoryRatios.forEach(category => {
      const ideal = Object.prototype.hasOwnProperty.call(IDEAL_BALANCE_RATIOS, category.id)
        ? IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS]
        : handleMissingIdealRatio(category.id);
      const actual = category.ratio;
      score += 1 - Math.abs(ideal - actual);
    });

    return Math.max(0, Math.min(1, score / categoryRatios.length));
  };

  // 音楽を生成する関数
  const generateMusic = (categoryRatios: (FoodCategory & { ratio: number })[], balanceScore: number, genre: MusicGenre) => {
    const baseTempo = selectedGenre === 'custom' ? customTempo : genre.baseTempo;
    const beatDuration = 60 / baseTempo; // 1拍の長さ（秒）

    // バランススコアに基づいてテンポを調整
    const adjustedTempo = baseTempo * (0.5 + balanceScore * 0.5);

    categoryRatios.forEach((category, index) => {
      if (category.ratio > 0) {
        const delay = index * beatDuration * 0.5;
        const frequency = category.sound.frequency * (0.8 + balanceScore * 0.4);
        const duration = category.sound.duration * (0.5 + balanceScore * 0.5);
        const volume = category.sound.volume * balanceScore;

        setTimeout(() => {
          playSound(frequency, duration, volume);
        }, delay * 1000);
      }
    });

    // バランスが良い場合は追加のハーモニーを演奏
    if (balanceScore > 0.7) {
      setTimeout(() => {
        playSound(MUSICAL_NOTES.A, 1.0, 0.3); // A音
        setTimeout(() => playSound(MUSICAL_NOTES.C_SHARP, 1.0, 0.3), TIMING_DELAYS.C_SHARP_OFFSET); // C#音
        setTimeout(() => playSound(MUSICAL_NOTES.E, 1.0, 0.3), TIMING_DELAYS.E_OFFSET); // E音
      }, 2000);
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

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ
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
              <i className="bi bi-play-fill"></i>
            </button>
          )}
        </div>
      </div>

      {showSoundApp && (
        <div className="sound-app-content">
          {/* 説明文 */}
          <div className="app-description">
            <p>自分の調子を音で知れるアプリです。食事のバランスを音で表現し、心地よいリズムで健康状態を確認できます。</p>
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
                  min="60"
                  max="200"
                  value={customTempo}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 60 && value <= 200) {
                      setCustomTempo(value);
                    }
                  }}
                  aria-label="カスタムテンポ設定"
                />
              </div>
            </div>
          )}

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
                  <span className="category-name">{category.name}</span>
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
            <button
              onClick={playMealBalance}
              disabled={isPlaying || Object.values(currentMeal.categories).every(count => count === 0)}
              className={`play-button ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? '再生中...' : '食事バランスを音で確認'}
            </button>
            <div className="balance-info">
              <p>バランスの良い食事ほど心地よいリズムになります</p>
            </div>
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
