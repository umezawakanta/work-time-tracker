import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import './SoundAppComponent.css';

// グローバルでTone.jsの初期化状態を管理
let globalToneInitialized = false;

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
const TEMPO_RANGE = { MIN: 60, MAX: 200 } as const;
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
  categories: { [key: string]: number };
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
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    categories: {}
  });

  // 参照管理
  const instrumentsRef = useRef<{[key: string]: any}>({});
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Tone.jsの一回だけの初期化
  const initializeTone = useCallback(async () => {
    if (globalToneInitialized) return true;
    
    try {
      await Tone.start();
      console.log('Tone.js started successfully');
      globalToneInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      return false;
    }
  }, []);

  // 楽器の作成（必要時のみ）
  const getOrCreateInstrument = useCallback((categoryId: string) => {
    // 既に存在すれば返す
    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

    // 新規作成
    let instrument = null;
    
    switch (categoryId) {
      case 'staple':
        instrument = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();
        break;
        
      case 'side':
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
          filterEnvelope: {
            attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.5,
            baseFrequency: 200, octaves: 2.6
          }
        }).toDestination();
        break;
        
      case 'miso':
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.3 },
          filterEnvelope: {
            attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.3,
            baseFrequency: 300, octaves: 3
          }
        }).toDestination();
        break;
        
      case 'meat':
        instrument = new Tone.FMSynth({
          harmonicity: 3.01,
          modulationIndex: 14,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.002, decay: 0.3, sustain: 0.3, release: 0.5 },
          modulation: { type: 'square' },
          modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.1 }
        }).toDestination();
        break;
        
      case 'fish':
        instrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 }
        }).toDestination();
        break;
        
      case 'vegetable':
        instrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 1.0 }
        }).toDestination();
        break;
    }

    if (instrument) {
      instrumentsRef.current[categoryId] = instrument;
    }
    
    return instrument;
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      // タイムアウトをクリア
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      
      // 楽器を破棄
      Object.values(instrumentsRef.current).forEach(inst => {
        if (inst && inst.dispose) {
          try { inst.dispose(); } catch (e) { /* ignore */ }
        }
      });
    };
  }, []);

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(''), duration);
  };

  // 音を再生
  const playSound = useCallback((categoryId: string, frequency: number, duration: number, volume: number) => {
    const instrument = getOrCreateInstrument(categoryId);
    if (!instrument) return;

    try {
      const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
      instrument.volume.value = volumeDb;
      
      if (categoryId === 'staple') {
        instrument.triggerAttackRelease('C1', duration + 's');
      } else {
        instrument.triggerAttackRelease(frequency, duration + 's');
      }
    } catch (error) {
      console.log(`Could not play sound for ${categoryId}`);
    }
  }, [getOrCreateInstrument]);

  // 音楽を生成
  const generateMusic = useCallback((categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
    // 既存のタイムアウトをクリア
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    playTimeoutsRef.current = [];

    const baseTempo = selectedGenre === 'custom' ? customTempo : genre.baseTempo;
    const adjustedTempo = Math.max(80, Math.min(140, baseTempo * (0.7 + balanceScore * 0.3)));
    const beatDuration = 60 / adjustedTempo;

    const activeCats = categoryRatios.filter(cat => cat.ratio > 0).sort((a, b) => b.ratio - a.ratio);

    // 各カテゴリーの音をスケジュール
    activeCats.forEach((category, index) => {
      const delay = index * beatDuration * 800;
      const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
      const duration = category.sound.duration * (0.8 + balanceScore * 0.4);
      const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

      const timeout = setTimeout(() => {
        playSound(category.id, frequency, duration, volume);
      }, delay);
      
      playTimeoutsRef.current.push(timeout);
    });

    // ハーモニー追加
    if (balanceScore > 0.6) {
      const harmonyDelay = activeCats.length * beatDuration * 800 + 1000;
      const timeout = setTimeout(() => {
        const pianoInst = getOrCreateInstrument('vegetable');
        if (pianoInst) {
          try {
            pianoInst.triggerAttackRelease(['C4', 'E4', 'G4'], '2s');
          } catch (e) { /* ignore */ }
        }
      }, harmonyDelay);
      
      playTimeoutsRef.current.push(timeout);
    }
  }, [selectedGenre, customTempo, playSound, getOrCreateInstrument]);

  // メイン再生関数
  const playMealBalance = useCallback(async () => {
    // 初回はTone.jsを初期化
    if (!globalToneInitialized) {
      const success = await initializeTone();
      if (!success) {
        showMessage('音声システムの初期化に失敗しました', 3000);
        return;
      }
      showMessage('音声システムを起動しました！', 2000);
    }

    if (isPlaying && !isLooping) {
      showMessage('再生中です...', 2000);
      return;
    }

    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      showMessage('食事を記録してください', 3000);
      return;
    }

    setIsPlaying(true);
    const genre = musicGenres.find(g => g.id === selectedGenre) || musicGenres[0];

    const categoryRatios = foodCategories.map(category => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems
    }));

    const balanceScore = categoryRatios.reduce((score, category) => {
      const ideal = IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS] || 0;
      return score + (1 - Math.abs(ideal - category.ratio));
    }, 0) / categoryRatios.length;

    generateMusic(categoryRatios, balanceScore, genre);

    const message = balanceScore > 0.7 ? '素晴らしいバランスです！' 
                  : balanceScore > 0.4 ? 'まあまあのバランスです' 
                  : 'バランスを改善しましょう';
    showMessage(message, 4000);

    // リピート処理
    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      const loop = () => {
        generateMusic(categoryRatios, balanceScore, genre);
        loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
      };
      loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
    } else if (repeatMode > 0) {
      let count = 0;
      const repeat = () => {
        if (++count < repeatMode) {
          generateMusic(categoryRatios, balanceScore, genre);
          setTimeout(repeat, PLAYBACK_DURATION);
        } else {
          setIsPlaying(false);
        }
      };
      setTimeout(repeat, PLAYBACK_DURATION);
    } else {
      setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
    }
  }, [currentMeal, selectedGenre, repeatMode, isPlaying, isLooping, 
      foodCategories, musicGenres, initializeTone, generateMusic, showMessage]);

  // 停止
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLooping(false);
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    playTimeoutsRef.current = [];
  };

  // テスト再生
  const testInstrument = useCallback(async (categoryId: string) => {
    if (!globalToneInitialized) {
      await initializeTone();
    }
    const category = foodCategories.find(c => c.id === categoryId);
    if (category) {
      playSound(categoryId, category.sound.frequency, 0.5, 0.5);
    }
  }, [foodCategories, initializeTone, playSound]);

  // カテゴリ更新
  const updateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: Math.max(0, count) }
    }));
  };

  // リセット
  const resetMeal = () => {
    setCurrentMeal(prev => ({ ...prev, categories: {} }));
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ
        </h2>
        <button
          onClick={() => setShowSoundApp(!showSoundApp)}
          className={showSoundApp ? "close-section-button" : "show-section-button"}
        >
          {showSoundApp ? '✕' : '▶'}
        </button>
      </div>

      {showSoundApp && (
        <div className="sound-app-content">
          <div className="app-description">
            <p>食事のバランスを音で表現します</p>
            {!globalToneInitialized && (
              <p style={{ color: '#ffeb3b' }}>初回は音ボタンをクリックしてください</p>
            )}
          </div>

          <div className="genre-selection">
            <h3>音楽ジャンル</h3>
            <div className="genre-grid">
              {musicGenres.map(genre => (
                <button
                  key={genre.id}
                  className={`genre-button ${selectedGenre === genre.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGenre(genre.id)}
                >
                  <div>{genre.name}</div>
                  <small>{genre.description}</small>
                </button>
              ))}
            </div>
          </div>

          {selectedGenre === 'custom' && (
            <div className="custom-settings">
              <label>テンポ: {customTempo} BPM</label>
              <input
                type="range"
                min={TEMPO_RANGE.MIN}
                max={TEMPO_RANGE.MAX}
                value={customTempo}
                onChange={(e) => setCustomTempo(parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="repeat-settings">
            <h4>リピート</h4>
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
            <h3>食事記録</h3>
            <div className="category-grid">
              {foodCategories.map(category => (
                <div key={category.id} className="category-item">
                  <span style={{ 
                    width: '20px',
                    height: '20px',
                    backgroundColor: category.color,
                    display: 'inline-block',
                    borderRadius: '4px'
                  }}></span>
                  <span>{category.name}</span>
                  <span>{category.instrument}</span>
                  <button onClick={() => testInstrument(category.id)}>🔊</button>
                  <div className="count-controls">
                    <button onClick={() => updateCategoryCount(category.id, 
                      (currentMeal.categories[category.id] || 0) - 1)}>-</button>
                    <span>{currentMeal.categories[category.id] || 0}</span>
                    <button onClick={() => updateCategoryCount(category.id, 
                      (currentMeal.categories[category.id] || 0) + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={resetMeal}>リセット</button>
          </div>

          <div className="sound-controls">
            <button
              onClick={playMealBalance}
              disabled={isPlaying || Object.values(currentMeal.categories).every(c => c === 0)}
              className={`play-button ${isPlaying ? 'playing' : ''}`}
            >
              {!globalToneInitialized ? '🎵 クリックして起動' :
               isPlaying ? '再生中...' : '再生'}
            </button>
            {isLooping && (
              <button onClick={stopPlayback}>停止</button>
            )}
          </div>

          {userMessage && (
            <div className="user-message" style={{
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '10px'
            }}>
              {userMessage}
            </div>
          )}

          <div className="balance-display">
            <h3>バランス分析</h3>
            {foodCategories.map(category => {
              const count = currentMeal.categories[category.id] || 0;
              const total = Object.values(currentMeal.categories).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={category.id} className="balance-bar">
                  <span>{category.name}</span>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: category.color,
                      borderRadius: '4px',
                      transition: 'width 0.3s'
                    }}></div>
                    <span style={{
                      position: 'absolute',
                      right: '5px',
                      top: '0',
                      lineHeight: '20px'
                    }}>{Math.round(percentage)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;