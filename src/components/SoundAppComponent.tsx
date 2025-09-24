import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import './SoundAppComponent.css';

// グローバルでTone.jsの初期化状態を管理
let globalToneInitialized = false;

// ビジュアライザー用のデータ型
export interface VisualizerData {
  categoryId: string;
  name: string;
  color: string;
  value: number;
  percentage: number;
  isPlaying: boolean;
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
}

// 食事記録の型定義
export interface MealRecord {
  id: string;
  date: string;
  time?: string;
  categories: { [key: string]: number };
  notes?: string;
}

// 音楽ジャンルの定義
export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
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

  // 音楽ジャンル
  const musicGenres: MusicGenre[] = [
    { id: 'balanced', name: 'バランス', baseTempo: 120, instruments: ['piano', 'strings'], description: 'バランスの取れた食事の時' },
    { id: 'rock', name: 'ロック', baseTempo: 140, instruments: ['distortion', 'drums', 'bass'], description: 'パワフルなロックサウンド' },
    { id: 'techno', name: 'テクノ', baseTempo: 128, instruments: ['synth', 'electronic'], description: '電子音楽スタイル' },
    { id: 'classical', name: 'クラシック', baseTempo: 80, instruments: ['strings', 'piano', 'orchestra'], description: '優雅なクラシック' },
    { id: 'japanese', name: '和楽器', baseTempo: 100, instruments: ['shamisen', 'taiko', 'koto'], description: '日本の伝統音楽' },
    { id: 'jazz', name: 'ジャズ', baseTempo: 110, instruments: ['saxophone', 'piano', 'bass'], description: 'スウィングジャズ' },
    { id: 'ambient', name: 'アンビエント', baseTempo: 60, instruments: ['pad', 'atmosphere'], description: '環境音楽' },
    { id: 'custom', name: 'カスタム', baseTempo: 120, instruments: ['piano'], description: 'ユーザー設定' },
  ];

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>('balanced');
  const [customTempo, setCustomTempo] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>('');
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    categories: {}
  });
  const [visualizerData, setVisualizerData] = useState<VisualizerData[]>([]);
  const [playingCategory, setPlayingCategory] = useState<string | null>(null);
  const [balanceScore, setBalanceScore] = useState<number>(0);

  // 参照管理
  const instrumentsRef = useRef<{[key: string]: any}>({});
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // ビジュアライザーデータを更新
  useEffect(() => {
    const total = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    
    const newVisualizerData = foodCategories.map(category => ({
      categoryId: category.id,
      name: category.name,
      color: category.color,
      value: currentMeal.categories[category.id] || 0,
      percentage: total > 0 ? ((currentMeal.categories[category.id] || 0) / total) * 100 : 0,
      isPlaying: playingCategory === category.id
    }));
    
    setVisualizerData(newVisualizerData);
    
    // バランススコアを計算
    if (total > 0) {
      const score = foodCategories.reduce((acc, category) => {
        const actual = (currentMeal.categories[category.id] || 0) / total;
        const ideal = IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS] || 0;
        return acc + (1 - Math.abs(ideal - actual));
      }, 0) / foodCategories.length;
      setBalanceScore(score);
    } else {
      setBalanceScore(0);
    }
  }, [currentMeal, playingCategory, foodCategories]);

  // キャンバスアニメーション
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let particles: any[] = [];
    
    // パーティクルを生成
    visualizerData.forEach((data, index) => {
      if (data.value > 0) {
        for (let i = 0; i < data.value * 3; i++) {
          particles.push({
            x: (index + 1) * (canvas.width / (visualizerData.length + 1)),
            y: canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            color: data.color,
            size: Math.random() * 4 + 2,
            life: 1
          });
        }
      }
    });
    
    const animate = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05; // 重力
        particle.life -= 0.01;
        
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        return particle.life > 0 && particle.y < canvas.height;
      });
      
      if (isPlaying && particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualizerData]);

  // Tone.jsの初期化
  const initializeTone = useCallback(async () => {
    if (globalToneInitialized) {
      return true;
    }
    
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

  // 楽器を作成
  const getOrCreateInstrument = useCallback((categoryId: string) => {
    if (!globalToneInitialized) return null;
    
    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

    let instrument = null;
    
    switch (categoryId) {
      case 'staple':
        instrument = new Tone.MembraneSynth().toDestination();
        break;
      case 'side':
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' }
        }).toDestination();
        break;
      case 'miso':
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'square' }
        }).toDestination();
        break;
      case 'meat':
        instrument = new Tone.FMSynth().toDestination();
        break;
      case 'fish':
        instrument = new Tone.PolySynth(Tone.Synth).toDestination();
        break;
      case 'vegetable':
        instrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' }
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
        instrument.triggerAttackRelease('C2', duration + 's');
      } else {
        instrument.triggerAttackRelease(frequency, duration + 's');
      }
      
      // ビジュアライザーを更新
      setPlayingCategory(categoryId);
      setTimeout(() => setPlayingCategory(null), duration * 1000);
    } catch (error) {
      console.log(`Could not play sound for ${categoryId}`);
    }
  }, [getOrCreateInstrument]);

  // 音楽を生成
  const generateMusic = useCallback((categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    playTimeoutsRef.current = [];

    const baseTempo = genre.baseTempo;
    const adjustedTempo = Math.max(80, Math.min(160, baseTempo * (0.7 + balanceScore * 0.3)));
    const beatDuration = 60 / adjustedTempo;

    const activeCats = categoryRatios.filter(cat => cat.ratio > 0).sort((a, b) => b.ratio - a.ratio);

    // メロディーラインを生成
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
  }, [playSound]);

  // メイン再生関数
  const playMealBalance = useCallback(async () => {
    if (!globalToneInitialized) {
      const success = await initializeTone();
      if (!success) {
        showMessage('音声システムの初期化に失敗しました', 3000);
        return;
      }
      showMessage('音声システムを起動しました！', 2000);
    }

    if (isPlaying) {
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

    generateMusic(categoryRatios, balanceScore, genre);

    const message = balanceScore > 0.7 ? '素晴らしいバランスです！🎵' 
                  : balanceScore > 0.4 ? 'まあまあのバランスです' 
                  : 'バランスを改善しましょう';
    showMessage(message, 4000);

    setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
  }, [currentMeal, selectedGenre, isPlaying, foodCategories, musicGenres, initializeTone, generateMusic, balanceScore]);

  // カテゴリ更新
  const updateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: Math.max(0, count) }
    }));
  };

  // リセット
  const resetMeal = () => {
    setCurrentMeal(prev => ({ 
      ...prev, 
      categories: {},
      time: new Date().toTimeString().split(' ')[0]
    }));
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ（ビジュアライザー版）
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
            <p>食事のバランスを音と色で表現します 🎨</p>
            {!globalToneInitialized && (
              <p style={{ color: '#ffeb3b' }}>初回は再生ボタンをクリックしてください</p>
            )}
          </div>

          {/* ビジュアライザー表示エリア */}
          <div className="visualizer-section">
            <h3>🎨 バランスビジュアライザー</h3>
            
            {/* カラフルなバー表示 */}
            <div className="bar-visualizer">
              {visualizerData.map(data => (
                <div key={data.categoryId} className="bar-container">
                  <div className="bar-label">{data.name}</div>
                  <div className="bar-wrapper">
                    <div 
                      className={`bar ${data.isPlaying ? 'playing' : ''}`}
                      style={{
                        height: `${data.percentage * 2}px`,
                        backgroundColor: data.color,
                        boxShadow: data.isPlaying ? `0 0 20px ${data.color}` : 'none'
                      }}
                    >
                      <span className="bar-value">{data.value}</span>
                    </div>
                  </div>
                  <div className="bar-percentage">{Math.round(data.percentage)}%</div>
                </div>
              ))}
            </div>

            {/* バランススコア表示 */}
            <div className="balance-meter">
              <h4>バランススコア</h4>
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{
                    width: `${balanceScore * 100}%`,
                    background: `linear-gradient(90deg, 
                      ${balanceScore < 0.3 ? '#ff4444' : 
                        balanceScore < 0.7 ? '#ffaa00' : '#44ff44'} 0%, 
                      ${balanceScore < 0.3 ? '#ff6666' : 
                        balanceScore < 0.7 ? '#ffcc00' : '#66ff66'} 100%)`
                  }}
                />
              </div>
              <div className="score-text">{Math.round(balanceScore * 100)}%</div>
            </div>

            {/* パーティクルキャンバス */}
            <canvas 
              ref={canvasRef}
              className="particle-canvas"
              style={{
                width: '100%',
                height: '150px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px'
              }}
            />
          </div>

          {/* ジャンル選択 */}
          <div className="genre-selection">
            <h3>🎼 音楽ジャンル</h3>
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

          {/* 食事記録 */}
          <div className="meal-recording">
            <h3>🍽️ 食事記録</h3>
            <div className="category-grid">
              {foodCategories.map(category => (
                <div key={category.id} className="category-item">
                  <span 
                    className="category-color"
                    style={{ 
                      backgroundColor: category.color,
                      width: '20px',
                      height: '20px',
                      display: 'inline-block',
                      borderRadius: '4px'
                    }}
                  />
                  <span>{category.name}</span>
                  <span>{category.instrument}</span>
                  <div className="count-controls">
                    <button onClick={() => updateCategoryCount(category.id, 
                      (currentMeal.categories[category.id] || 0) - 1)}>-</button>
                    <span className="count-display">{currentMeal.categories[category.id] || 0}</span>
                    <button onClick={() => updateCategoryCount(category.id, 
                      (currentMeal.categories[category.id] || 0) + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={resetMeal} className="reset-button">リセット</button>
          </div>

          {/* コントロール */}
          <div className="sound-controls">
            <button
              onClick={playMealBalance}
              disabled={isPlaying || Object.values(currentMeal.categories).every(c => c === 0)}
              className={`play-button ${isPlaying ? 'playing' : ''}`}
            >
              {!globalToneInitialized ? '🎵 クリックして起動' :
               isPlaying ? '再生中...' : '再生'}
            </button>
          </div>

          {/* メッセージ */}
          {userMessage && (
            <div className="user-message">
              {userMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;