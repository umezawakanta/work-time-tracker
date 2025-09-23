import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
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
  instrument: string;
  toneInstrument?: any; // Tone.jsの楽器インスタンス
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
}

const SoundAppComponent: React.FC<SoundAppComponentProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures,
}) => {
  // 食事カテゴリの定義とTone.js楽器の初期化
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([
    { 
      id: 'staple', 
      name: '主食', 
      sound: { frequency: 220, duration: 0.5, volume: 0.7 }, 
      color: '#8B4513', 
      instrument: '🥁 ドラム'
    },
    { 
      id: 'side', 
      name: '副菜', 
      sound: { frequency: 330, duration: 0.4, volume: 0.6 }, 
      color: '#228B22', 
      instrument: '🎸 ベース'
    },
    { 
      id: 'miso', 
      name: '味噌', 
      sound: { frequency: 440, duration: 0.3, volume: 0.5 }, 
      color: '#D2691E', 
      instrument: '🎺 トランペット'
    },
    { 
      id: 'meat', 
      name: '肉', 
      sound: { frequency: 110, duration: 0.8, volume: 0.9 }, 
      color: '#DC143C', 
      instrument: '🎸 エレキギター'
    },
    { 
      id: 'fish', 
      name: '魚', 
      sound: { frequency: 880, duration: 0.6, volume: 0.8 }, 
      color: '#4169E1', 
      instrument: '🎹 シンセサイザー'
    },
    { 
      id: 'vegetable', 
      name: '野菜', 
      sound: { frequency: 660, duration: 0.4, volume: 0.7 }, 
      color: '#32CD32', 
      instrument: '🎹 ピアノ'
    },
  ]);

  // 音楽ジャンルの定義
  const musicGenres: MusicGenre[] = [
    { id: 'balanced', name: 'バランス', baseTempo: 120, instruments: ['piano', 'strings'], description: 'バランスの取れた食事の時' },
    { id: 'vegetarian', name: 'ベジタリアン', baseTempo: 90, instruments: ['flute', 'harp'], description: 'ロハス的な音楽' },
    { id: 'meat-heavy', name: '肉多め', baseTempo: 160, instruments: ['drums', 'bass'], description: 'パワフルな音楽' },
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
  const [toneReady, setToneReady] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    categories: {}
  });

  // Tone.js楽器の参照
  const instrumentsRef = useRef<{[key: string]: any}>({});
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tone.jsの初期化と楽器のセットアップ
  useEffect(() => {
    const initTone = async () => {
      await Tone.start();
      
      // 各楽器をセットアップ
      // ドラム（キック）
      instrumentsRef.current.staple = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.001,
          decay: 0.4,
          sustain: 0.01,
          release: 1.4,
        }
      }).toDestination();

      // ベース
      instrumentsRef.current.side = new Tone.MonoSynth({
        oscillator: { 
          type: 'sawtooth' 
        },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.4,
          release: 0.5
        },
        filterEnvelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.5,
          release: 0.5,
          baseFrequency: 200,
          octaves: 2.6
        }
      }).toDestination();

      // トランペット風シンセ
      instrumentsRef.current.miso = new Tone.MonoSynth({
        oscillator: { 
          type: 'sawtooth' 
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.8,
          release: 0.3
        },
        filterEnvelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 0.3,
          baseFrequency: 300,
          octaves: 3
        }
      }).toDestination();

      // エレキギター風（FM合成）
      instrumentsRef.current.meat = new Tone.FMSynth({
        harmonicity: 3.01,
        modulationIndex: 14,
        oscillator: { 
          type: 'triangle' 
        },
        envelope: {
          attack: 0.002,
          decay: 0.3,
          sustain: 0.3,
          release: 0.5
        },
        modulation: { 
          type: 'square' 
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.5,
          sustain: 0.2,
          release: 0.1
        }
      }).toDestination();

      // シンセサイザー
      instrumentsRef.current.fish = new Tone.PolySynth(Tone.Synth, {
        oscillator: { 
          type: 'sawtooth' 
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 0.4
        }
      }).toDestination();

      // ピアノ風
      instrumentsRef.current.vegetable = new Tone.PolySynth(Tone.Synth, {
        oscillator: { 
          type: 'sine' 
        },
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.6,
          release: 1.0
        }
      }).toDestination();

      // リバーブを追加してより豊かな音に
      const reverb = new Tone.Reverb({
        decay: 2.5,
        wet: 0.3
      }).toDestination();

      // 全ての楽器にリバーブを接続
      Object.values(instrumentsRef.current).forEach(inst => {
        if (inst) inst.connect(reverb);
      });

      setToneReady(true);
      showMessage('楽器の準備が完了しました！', 2000);
    };

    initTone();

    // クリーンアップ
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
      Object.values(instrumentsRef.current).forEach(inst => {
        if (inst && inst.dispose) {
          inst.dispose();
        }
      });
    };
  }, []);

  // ユーザーメッセージを表示する関数
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(''), duration);
  };

  // Tone.jsで音を再生する関数
  const playToneSound = (categoryId: string, frequency: number, duration: number, volume: number) => {
    if (!toneReady || !instrumentsRef.current[categoryId]) return;

    const inst = instrumentsRef.current[categoryId];
    const volumeDb = Math.log10(volume) * 20; // 音量をdBに変換

    try {
      inst.volume.value = volumeDb;
      
      if (categoryId === 'staple') {
        // ドラムは特定の音程で
        inst.triggerAttackRelease('C1', duration + 's');
      } else {
        // その他の楽器は指定された周波数で
        inst.triggerAttackRelease(frequency, duration + 's');
      }
    } catch (error) {
      console.error(`Error playing sound for ${categoryId}:`, error);
    }
  };

  // 食事バランスを音に変換する関数
  const playMealBalance = async () => {
    if (isPlaying && !isLooping) {
      showMessage('音声を再生中です。しばらくお待ちください。');
      return;
    }

    if (!toneReady) {
      showMessage('楽器を準備中です。もう少しお待ちください。');
      return;
    }

    // Tone.jsのコンテキストを開始
    if (Tone.context.state !== 'running') {
      await Tone.start();
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
    
    // 音楽を生成
    generateMusic(categoryRatios, balanceScore, genre);
    
    const balanceMessage = balanceScore > 0.7 
      ? '素晴らしいバランスです！心地よいリズムが流れています。' 
      : balanceScore > 0.4 
        ? 'バランスが改善できそうです。もう少し調整してみてください。'
        : 'バランスを改善することをお勧めします。';
    showMessage(balanceMessage, 4000);

    // リピート処理
    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      loopIntervalRef.current = setInterval(() => {
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

    // Tone.jsのTransportを使用してタイミングをスケジュール
    const now = Tone.now();
    
    sortedCategories.forEach((category, index) => {
      const time = now + (index * adjustedBeatDuration * 0.8);
      const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
      const duration = category.sound.duration * (0.8 + balanceScore * 0.4);
      const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

      // Tone.jsのスケジューリングを使用
      Tone.Transport.schedule(() => {
        playToneSound(category.id, frequency, duration, volume);
      }, time);
    });

    // バランスが良い場合は美しいハーモニーを追加
    if (balanceScore > 0.6) {
      const harmonyTime = now + sortedCategories.length * adjustedBeatDuration * 0.8 + 1;
      
      Tone.Transport.schedule(() => {
        // メジャーコードで美しいハーモニー（C-E-G）
        if (instrumentsRef.current.vegetable) {
          instrumentsRef.current.vegetable.triggerAttackRelease(['C4', 'E4', 'G4'], '2s');
        }
      }, harmonyTime);
    }

    // バランスが非常に良い場合は追加の装飾音
    if (balanceScore > 0.8) {
      const decorationTime = now + sortedCategories.length * adjustedBeatDuration * 0.8 + 2.5;
      
      // アルペジオパターンを作成
      const arpeggio = new Tone.Pattern((time, note) => {
        if (instrumentsRef.current.fish) {
          instrumentsRef.current.fish.triggerAttackRelease(note, '16n', time);
        }
      }, ['C4', 'E4', 'G4', 'C5', 'G4', 'E4'], 'up');
      
      arpeggio.start(decorationTime);
      arpeggio.stop(decorationTime + 2);
    }

    // Transportを開始
    Tone.Transport.start();
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
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
  };

  // 個別の楽器をテスト再生
  const testInstrument = (categoryId: string) => {
    if (!toneReady) return;
    
    const category = foodCategories.find(c => c.id === categoryId);
    if (category) {
      playToneSound(categoryId, category.sound.frequency, 0.5, 0.5);
    }
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ（Tone.js楽器モード）
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
          {/* 説明文 */}
          <div className="app-description">
            <p>食事のバランスを音で表現し、心地よいリズムで健康状態を確認できます。</p>
            <p className="real-sound-notice">
              🎵 Tone.js楽器モード: 高品質なシンセサイザー音源を使用
            </p>
          </div>

          {/* Tone.js準備状態表示 */}
          {!toneReady && (
            <div className="loading-message">
              <p>🎹 楽器を準備中...</p>
            </div>
          )}

          {/* 音楽ジャンル選択 */}
          <div className="genre-selection">
            <h3>🎼 音楽ジャンル選択</h3>
            <div className="genre-grid">
              {musicGenres.map(genre => (
                <button
                  key={genre.id}
                  className={`genre-button ${selectedGenre === genre.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGenre(genre.id)}
                  disabled={!toneReady}
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
                  disabled={!toneReady}
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
                    <button 
                      className="test-sound-btn"
                      onClick={() => testInstrument(category.id)}
                      disabled={!toneReady}
                      title="音をテスト"
                    >
                      🔊
                    </button>
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
                disabled={!toneReady || isPlaying || Object.values(currentMeal.categories).every(count => count === 0)}
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