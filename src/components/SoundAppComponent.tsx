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
  instrument: string; // 楽器の種類を追加
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
  // 食事カテゴリの定義（楽器を分かりやすく設定）
  const foodCategories: FoodCategory[] = [
    { id: 'staple', name: '主食', sound: { frequency: 220, duration: 0.5, volume: 0.7 }, color: '#8B4513', instrument: '🥁 ドラム' },
    { id: 'side', name: '副菜', sound: { frequency: 330, duration: 0.4, volume: 0.6 }, color: '#228B22', instrument: '🎸 ベース' },
    { id: 'miso', name: '味噌', sound: { frequency: 440, duration: 0.3, volume: 0.5 }, color: '#D2691E', instrument: '🎺 トランペット' },
    { id: 'meat', name: '肉', sound: { frequency: 110, duration: 0.8, volume: 0.9 }, color: '#DC143C', instrument: '🎸 エレキギター' },
    { id: 'fish', name: '魚', sound: { frequency: 880, duration: 0.6, volume: 0.8 }, color: '#4169E1', instrument: '🎹 シンセサイザー' },
    { id: 'vegetable', name: '野菜', sound: { frequency: 660, duration: 0.4, volume: 0.7 }, color: '#32CD32', instrument: '🎹 ピアノ' },
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
  const [userMessage, setUserMessage] = useState<string>('');
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.ONCE);
  const [isLooping, setIsLooping] = useState<boolean>(false);
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
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
    }
  }, []);

  // バランスバーの幅を設定
  useEffect(() => {
    const barFills = document.querySelectorAll('.bar-fill[data-width]');
    barFills.forEach(bar => {
      const width = bar.getAttribute('data-width');
      if (width) {
        (bar as HTMLElement).style.width = `${width}%`;
      }
    });
  }, [currentMeal]);

  // ユーザーメッセージを表示する関数
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(''), duration);
  };

  // 楽器の種類に応じた音を生成する関数
  const playSound = (frequency: number, duration: number, volume: number, instrument: string) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    const { currentTime } = audioContextRef.current;

    // 楽器の種類に応じて複数の音を組み合わせ
    switch (instrument) {
      case '🥁 ドラム':
        // ドラム：低音のキック + 高音のハイハット
        createOscillator(frequency * 0.3, duration * 0.2, volume * 1.5, 'sawtooth', currentTime);
        createOscillator(frequency * 2.0, duration * 0.1, volume * 0.8, 'square', currentTime + 0.1);
        break;
      case '🎸 ベース':
        // ベース：低音の基音 + 少し高い倍音
        createOscillator(frequency * 0.6, duration * 1.8, volume * 0.9, 'triangle', currentTime);
        createOscillator(frequency * 1.2, duration * 1.5, volume * 0.3, 'sine', currentTime);
        break;
      case '🎺 トランペット':
        // トランペット：明るい音 + 少しの歪み
        createOscillator(frequency * 1.1, duration * 1.0, volume * 1.2, 'square', currentTime);
        createOscillator(frequency * 1.3, duration * 0.8, volume * 0.4, 'sawtooth', currentTime + 0.1);
        break;
      case '🎸 エレキギター':
        // エレキギター：歪んだ音 + ハーモニクス
        createOscillator(frequency * 1.0, duration * 0.8, volume * 1.4, 'sawtooth', currentTime);
        createOscillator(frequency * 2.0, duration * 0.6, volume * 0.6, 'square', currentTime + 0.05);
        createOscillator(frequency * 3.0, duration * 0.4, volume * 0.3, 'sine', currentTime + 0.1);
        break;
      case '🎹 シンセサイザー':
        // シンセサイザー：複数の波形を重ねた豊かな音
        createOscillator(frequency * 1.4, duration * 1.5, volume * 0.8, 'sine', currentTime);
        createOscillator(frequency * 2.1, duration * 1.3, volume * 0.5, 'triangle', currentTime + 0.05);
        createOscillator(frequency * 2.8, duration * 1.1, volume * 0.3, 'sine', currentTime + 0.1);
        break;
      case '🎹 ピアノ':
        // ピアノ：基音 + 倍音の組み合わせ
        createOscillator(frequency * 1.2, duration * 1.2, volume * 1.0, 'sine', currentTime);
        createOscillator(frequency * 2.4, duration * 0.8, volume * 0.4, 'sine', currentTime + 0.05);
        createOscillator(frequency * 3.6, duration * 0.6, volume * 0.2, 'sine', currentTime + 0.1);
        break;
      default:
        createOscillator(frequency, duration, volume, 'sine', currentTime);
        break;
    }
  };

  // オシレーターを作成するヘルパー関数
  const createOscillator = (frequency: number, duration: number, volume: number, waveType: OscillatorType, startTime: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      return;
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(gainNodeRef.current);

    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
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

    setIsPlaying(true);
    const genre = musicGenres.find(g => g.id === selectedGenre);
    if (!genre) {
      setIsPlaying(false);
      showMessage('音楽ジャンルが見つかりません。ページを再読み込みしてください。', 5000);
      return;
    }

    // バランス分析
    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      setIsPlaying(false);
      showMessage('食事を記録してから音声を再生してください。各カテゴリの数量を設定してください。', 5000);
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
    
    // 成功メッセージを表示
    const balanceMessage = balanceScore > 0.7 
      ? '素晴らしいバランスです！心地よいリズムが流れています。' 
      : balanceScore > 0.4 
        ? 'バランスが改善できそうです。もう少し調整してみてください。'
        : 'バランスを改善することをお勧めします。';
    showMessage(balanceMessage, 4000);

    // リピート処理
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

  // IDEAL_BALANCE_RATIOSに存在しないカテゴリIDを処理する関数
  function handleMissingIdealRatio(categoryId: string): number {
    console.warn(`Missing ideal balance ratio for category: ${categoryId}`);
    return 0;
  }

  // バランススコアを計算する関数
  const calculateBalanceScore = (categoryRatios: (FoodCategory & { ratio: number })[]): number => {
    let score = 0;
    categoryRatios.forEach(category => {
      const ideal = category.id in IDEAL_BALANCE_RATIOS
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
          playSound(frequency, duration, volume, category.instrument);
        }, delay * 1000);
      }
    });

    // バランスが良い場合は追加のハーモニーを演奏
    if (balanceScore > 0.7) {
      setTimeout(() => {
        playSound(MUSICAL_NOTES.A, 1.0, 0.3, '🎹 ピアノ'); // A音
        setTimeout(() => playSound(MUSICAL_NOTES.C_SHARP, 1.0, 0.3, '🎹 ピアノ'), TIMING_DELAYS.C_SHARP_OFFSET); // C#音
        setTimeout(() => playSound(MUSICAL_NOTES.E, 1.0, 0.3, '🎹 ピアノ'), TIMING_DELAYS.E_OFFSET); // E音
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
                  min={TEMPO_RANGE.MIN}
                  max={TEMPO_RANGE.MAX}
                  value={customTempo}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= TEMPO_RANGE.MIN && value <= TEMPO_RANGE.MAX) {
                      setCustomTempo(value);
                    }
                  }}
                  aria-label="カスタムテンポ設定"
                />
              </div>
            </div>
          )}

          {/* リピート設定 */}
          <div className="repeat-settings">
            <h4>🔄 リピート設定</h4>
            <div className="repeat-options">
              <button
                className={`repeat-button ${repeatMode === REPEAT_OPTIONS.NONE ? 'selected' : ''}`}
                onClick={() => setRepeatMode(REPEAT_OPTIONS.NONE)}
              >
                なし
              </button>
              <button
                className={`repeat-button ${repeatMode === REPEAT_OPTIONS.ONCE ? 'selected' : ''}`}
                onClick={() => setRepeatMode(REPEAT_OPTIONS.ONCE)}
              >
                1回
              </button>
              <button
                className={`repeat-button ${repeatMode === REPEAT_OPTIONS.TWICE ? 'selected' : ''}`}
                onClick={() => setRepeatMode(REPEAT_OPTIONS.TWICE)}
              >
                2回
              </button>
              <button
                className={`repeat-button ${repeatMode === REPEAT_OPTIONS.THREE_TIMES ? 'selected' : ''}`}
                onClick={() => setRepeatMode(REPEAT_OPTIONS.THREE_TIMES)}
              >
                3回
              </button>
              <button
                className={`repeat-button ${repeatMode === REPEAT_OPTIONS.LOOP ? 'selected' : ''}`}
                onClick={() => setRepeatMode(REPEAT_OPTIONS.LOOP)}
              >
                ループ
              </button>
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
                    data-color={category.color}
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
            <div className="balance-info">
              <p>バランスの良い食事ほど心地よいリズムになります</p>
              <p>各カテゴリは異なる楽器で表現されます</p>
            </div>
            
            {/* ユーザーメッセージ表示 */}
            {userMessage && (
              <div className="user-message">
                <div className="message-content">
                  <i className="bi bi-info-circle"></i>
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
                        data-color={category.color}
                      ></span>
                      {category.name}
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        data-width={percentage}
                        data-color={category.color}
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
