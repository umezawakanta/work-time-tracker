import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  // 食事カテゴリの定義
  const foodCategories: FoodCategory[] = [
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
  ];

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
  const [toneInitialized, setToneInitialized] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    categories: {}
  });

  // 参照の管理
  const instrumentsRef = useRef<{[key: string]: any}>({});
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reverbRef = useRef<any>(null);
  const isDisposedRef = useRef<boolean>(false);
  const sequenceRef = useRef<any>(null);

  // 楽器を作成する関数（毎回新しいインスタンスを作成）
  const createInstruments = useCallback(() => {
    // 既存の楽器を破棄
    disposeInstruments();
    
    // 新しいリバーブを作成
    if (!reverbRef.current || isDisposedRef.current) {
      reverbRef.current = new Tone.Reverb({
        decay: 2.5,
        wet: 0.3
      }).toDestination();
    }

    // 新しい楽器を作成
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
    }).connect(reverbRef.current);

    instrumentsRef.current.side = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
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
    }).connect(reverbRef.current);

    instrumentsRef.current.miso = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
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
    }).connect(reverbRef.current);

    instrumentsRef.current.meat = new Tone.FMSynth({
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.002,
        decay: 0.3,
        sustain: 0.3,
        release: 0.5
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.2,
        release: 0.1
      }
    }).connect(reverbRef.current);

    instrumentsRef.current.fish = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.4
      }
    }).connect(reverbRef.current);

    instrumentsRef.current.vegetable = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 1.0
      }
    }).connect(reverbRef.current);

    isDisposedRef.current = false;
  }, []);

  // 楽器を破棄する関数
  const disposeInstruments = useCallback(() => {
    if (!isDisposedRef.current) {
      Object.values(instrumentsRef.current).forEach(inst => {
        if (inst && inst.dispose) {
          try {
            inst.dispose();
          } catch (e) {
            console.log('Instrument already disposed');
          }
        }
      });
      instrumentsRef.current = {};
      isDisposedRef.current = true;
    }
  }, []);

  // Tone.jsの初期化
  const initializeTone = useCallback(async () => {
    if (toneInitialized) {
      // 既に初期化済みの場合は楽器を再作成
      createInstruments();
      return;
    }

    try {
      await Tone.start();
      console.log('Tone.js started successfully');
      
      createInstruments();
      setToneInitialized(true);
      showMessage('楽器の準備が完了しました！', 2000);
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      showMessage('音声の初期化に失敗しました。', 5000);
    }
  }, [toneInitialized, createInstruments]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
      disposeInstruments();
      if (reverbRef.current) {
        reverbRef.current.dispose();
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, [disposeInstruments]);

  // ユーザーメッセージを表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(''), duration);
  };

  // 音を再生する関数（即座に再生）
  const playToneSound = useCallback((categoryId: string, frequency: number, duration: number, volume: number, time?: number) => {
    if (isDisposedRef.current || !instrumentsRef.current[categoryId]) {
      console.log(`Instrument ${categoryId} not available`);
      return;
    }

    try {
      const inst = instrumentsRef.current[categoryId];
      const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
      inst.volume.value = volumeDb;
      
      if (categoryId === 'staple') {
        inst.triggerAttackRelease('C1', duration + 's', time);
      } else {
        inst.triggerAttackRelease(frequency, duration + 's', time);
      }
    } catch (error) {
      console.error(`Error playing sound for ${categoryId}:`, error);
    }
  }, []);

  // 食事バランスを音に変換
  const playMealBalance = useCallback(async () => {
    if (!toneInitialized) {
      await initializeTone();
      setTimeout(() => playMealBalance(), 100);
      return;
    }

    if (isPlaying && !isLooping) {
      showMessage('音声を再生中です。', 2000);
      return;
    }

    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      showMessage('食事を記録してから音声を再生してください。', 3000);
      return;
    }

    // 楽器が破棄されていたら再作成
    if (isDisposedRef.current) {
      createInstruments();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsPlaying(true);
    const genre = musicGenres.find(g => g.id === selectedGenre);
    if (!genre) {
      setIsPlaying(false);
      showMessage('音楽ジャンルが見つかりません。', 3000);
      return;
    }

    const categoryRatios = foodCategories.map(category => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems
    }));

    const balanceScore = calculateBalanceScore(categoryRatios);
    
    // Transportをクリーンアップしてから開始
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    generateMusic(categoryRatios, balanceScore, genre);
    
    const balanceMessage = balanceScore > 0.7 
      ? '素晴らしいバランスです！' 
      : balanceScore > 0.4 
        ? 'バランスが改善できそうです。'
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
  }, [toneInitialized, isPlaying, isLooping, currentMeal, selectedGenre, repeatMode, 
      foodCategories, musicGenres, initializeTone, createInstruments, showMessage]);

  // バランススコアを計算
  const calculateBalanceScore = (categoryRatios: (FoodCategory & { ratio: number })[]) => {
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

  // 音楽を生成（シンプルな即座再生方式）
  const generateMusic = useCallback((
    categoryRatios: (FoodCategory & { ratio: number })[], 
    balanceScore: number, 
    genre: MusicGenre
  ) => {
    const baseTempo = selectedGenre === 'custom' ? customTempo : genre.baseTempo;
    const adjustedTempo = Math.max(80, Math.min(140, baseTempo * (0.7 + balanceScore * 0.3)));
    const adjustedBeatDuration = 60 / adjustedTempo;

    const sortedCategories = categoryRatios
      .filter(cat => cat.ratio > 0)
      .sort((a, b) => b.ratio - a.ratio);

    // 即座に音を再生（Transportを使わない）
    sortedCategories.forEach((category, index) => {
      const delay = index * adjustedBeatDuration * 800; // ミリ秒に変換
      const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
      const duration = category.sound.duration * (0.8 + balanceScore * 0.4);
      const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

      setTimeout(() => {
        playToneSound(category.id, frequency, duration, volume);
      }, delay);
    });

    // ハーモニーを追加
    if (balanceScore > 0.6 && instrumentsRef.current.vegetable) {
      const harmonyDelay = sortedCategories.length * adjustedBeatDuration * 800 + 1000;
      
      setTimeout(() => {
        if (!isDisposedRef.current && instrumentsRef.current.vegetable) {
          try {
            instrumentsRef.current.vegetable.triggerAttackRelease(['C4', 'E4', 'G4'], '2s');
          } catch (error) {
            console.log('Harmony already playing or disposed');
          }
        }
      }, harmonyDelay);
    }
  }, [selectedGenre, customTempo, playToneSound]);

  // カテゴリの数量を更新
  const updateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryId]: Math.max(0, count)
      }
    }));
  };

  // リセット
  const resetMeal = () => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: {}
    }));
  };

  // 停止
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

  // 楽器テスト
  const testInstrument = useCallback(async (categoryId: string) => {
    if (!toneInitialized) {
      await initializeTone();
      setTimeout(() => testInstrument(categoryId), 100);
      return;
    }

    if (isDisposedRef.current) {
      createInstruments();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const category = foodCategories.find(c => c.id === categoryId);
    if (category) {
      playToneSound(categoryId, category.sound.frequency, 0.5, 0.5);
    }
  }, [toneInitialized, foodCategories, initializeTone, createInstruments, playToneSound]);

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
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {showSoundApp && (
        <div className="sound-app-content">
          <div className="app-description">
            <p>食事のバランスを音で表現し、心地よいリズムで健康状態を確認できます。</p>
            {!toneInitialized && (
              <p style={{ color: '#ffeb3b' }}>
                ⚠️ 初回は音ボタンをクリックして音声システムを起動してください
              </p>
            )}
          </div>

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
                />
              </div>
            </div>
          )}

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
                      style={{ 
                        marginLeft: '10px',
                        padding: '2px 8px',
                        fontSize: '1.2em',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
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
            <button onClick={resetMeal} className="reset-button">
              リセット
            </button>
          </div>

          <div className="sound-controls">
            <h3>🎵 音声再生</h3>
            <div className="play-controls">
              <button
                onClick={playMealBalance}
                disabled={isPlaying || Object.values(currentMeal.categories).every(count => count === 0)}
                className={`play-button ${isPlaying ? 'playing' : ''}`}
              >
                {!toneInitialized 
                  ? '🎵 クリックして音声を起動'
                  : isPlaying 
                    ? '再生中...' 
                    : '食事バランスを音で確認'}
              </button>
              {isLooping && (
                <button onClick={stopRepeat} className="stop-button">
                  停止
                </button>
              )}
            </div>
            
            {userMessage && (
              <div className="user-message" style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <span>{userMessage}</span>
              </div>
            )}
          </div>

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
                      <span style={{ 
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        backgroundColor: category.color,
                        marginRight: '8px',
                        borderRadius: '2px'
                      }}></span>
                      {category.name}
                    </div>
                    <div className="bar-container" style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      height: '24px',
                      position: 'relative'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: category.color,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }}></div>
                      <span style={{
                        position: 'absolute',
                        right: '8px',
                        fontSize: '0.9em'
                      }}>{Math.round(percentage)}%</span>
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