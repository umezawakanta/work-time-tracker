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

// 保存された記録
export interface SavedRecord {
  id: string;
  date: string;
  mealData: MealRecord;
  genre: string;
  customSettings?: {
    tempo: number;
    instruments: string[];
  };
  balanceScore: number;
}

// 編集可能な曲データ
export interface ComposedSong {
  id: string;
  name: string;
  createdDate: string;
  records: SavedRecord[];
  genre: string;
  isEdited: boolean;
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

// 音楽ジャンルの定義（拡張版）
export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
  synthSettings?: any;
}

// 食事記録の型定義
export interface MealRecord {
  id: string;
  date: string;
  time?: string;
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

  // 拡張された音楽ジャンル
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
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.ONCE);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    categories: {}
  });
  
  // 新機能の状態
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [composedSongs, setComposedSongs] = useState<ComposedSong[]>([]);
  const [viewMode, setViewMode] = useState<'input' | 'history' | 'compose' | 'edit'>('input');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [editingSong, setEditingSong] = useState<ComposedSong | null>(null);
  const [customInstruments, setCustomInstruments] = useState<string[]>(['piano']);

  // 参照管理
  const instrumentsRef = useRef<{[key: string]: any}>({});
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // LocalStorageから保存データを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('soundAppRecords');
    if (saved) {
      setSavedRecords(JSON.parse(saved));
    }
    const songs = localStorage.getItem('composedSongs');
    if (songs) {
      setComposedSongs(JSON.parse(songs));
    }
  }, []);

  // Tone.jsの初期化
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

  // ジャンルに応じた楽器を作成
  const createInstrumentForGenre = useCallback((categoryId: string, genre: string) => {
    let instrument = null;
    
    // ジャンル別の音色設定
    switch (genre) {
      case 'rock':
        // ロック用の歪んだ音
        instrument = new Tone.FMSynth({
          harmonicity: 2.5,
          modulationIndex: 20,
          oscillator: { type: 'square' },
          envelope: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.3 }
        }).toDestination();
        break;
        
      case 'techno':
        // テクノ用の電子音
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'pulse' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.9, release: 0.1 },
          filterEnvelope: {
            attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.2,
            baseFrequency: 400, octaves: 4
          }
        }).toDestination();
        break;
        
      case 'classical':
        // クラシック用の柔らかい音
        instrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.5, sustain: 0.7, release: 1.5 }
        }).toDestination();
        break;
        
      case 'japanese':
        // 和楽器風の音
        instrument = new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.9
        }).toDestination();
        break;
        
      case 'jazz':
        // ジャズ用のスムースな音
        instrument = new Tone.MonoSynth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.8 },
          filterEnvelope: {
            attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.8,
            baseFrequency: 250, octaves: 2
          }
        }).toDestination();
        break;
        
      case 'ambient':
        // アンビエント用の広がりのある音
        const reverb = new Tone.Reverb({ decay: 5, wet: 0.8 }).toDestination();
        instrument = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 3 }
        }).connect(reverb);
        break;
        
      default:
        // デフォルト楽器を作成
        instrument = getOrCreateInstrument(categoryId);
    }
    
    return instrument;
  }, []);

  // 基本楽器の作成
  const getOrCreateInstrument = useCallback((categoryId: string) => {
    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

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

  // 現在の食事データを保存
  const saveCurrentRecord = useCallback(() => {
    const totalItems = Object.values(currentMeal.categories).reduce((sum, count) => sum + count, 0);
    if (totalItems === 0) {
      showMessage('記録する食事データがありません', 3000);
      return;
    }

    const categoryRatios = foodCategories.map(category => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems
    }));

    const balanceScore = categoryRatios.reduce((score, category) => {
      const ideal = IDEAL_BALANCE_RATIOS[category.id as keyof typeof IDEAL_BALANCE_RATIOS] || 0;
      return score + (1 - Math.abs(ideal - category.ratio));
    }, 0) / categoryRatios.length;

    const newRecord: SavedRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mealData: { ...currentMeal },
      genre: selectedGenre,
      customSettings: selectedGenre === 'custom' ? {
        tempo: customTempo,
        instruments: customInstruments
      } : undefined,
      balanceScore
    };

    const updatedRecords = [...savedRecords, newRecord];
    setSavedRecords(updatedRecords);
    localStorage.setItem('soundAppRecords', JSON.stringify(updatedRecords));
    
    showMessage('食事記録を保存しました！', 2000);
    resetMeal();
  }, [currentMeal, selectedGenre, customTempo, customInstruments, savedRecords, foodCategories]);

  // 期間ごとの記録を取得
  const getRecordsByPeriod = useCallback((period: 'day' | 'week' | 'month') => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return savedRecords.filter(record => 
      new Date(record.date) >= startDate && new Date(record.date) <= now
    );
  }, [savedRecords]);

  // 複数の記録をまとめて再生
  const playCompiledRecords = useCallback(async (records: SavedRecord[]) => {
    if (records.length === 0) {
      showMessage('再生する記録がありません', 3000);
      return;
    }

    if (!globalToneInitialized) {
      await initializeTone();
    }

    setIsPlaying(true);
    
    // 各記録を順番に再生
    let delay = 0;
    records.forEach((record, index) => {
      setTimeout(() => {
        const genre = musicGenres.find(g => g.id === record.genre) || musicGenres[0];
        const categoryRatios = foodCategories.map(category => ({
          ...category,
          ratio: (record.mealData.categories[category.id] || 0) / 
                 Object.values(record.mealData.categories).reduce((sum, c) => sum + c, 1)
        }));
        
        generateMusic(categoryRatios, record.balanceScore, genre);
        
        if (index === records.length - 1) {
          setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
        }
      }, delay);
      
      delay += PLAYBACK_DURATION + 1000; // 1秒の間隔を追加
    });
    
    showMessage(`${records.length}件の記録を再生中...`, 3000);
  }, [initializeTone, foodCategories, musicGenres]);

  // 曲として保存
  const saveAsComposition = useCallback((name: string, records: SavedRecord[]) => {
    const newSong: ComposedSong = {
      id: Date.now().toString(),
      name,
      createdDate: new Date().toISOString(),
      records,
      genre: selectedGenre,
      isEdited: false
    };
    
    const updatedSongs = [...composedSongs, newSong];
    setComposedSongs(updatedSongs);
    localStorage.setItem('composedSongs', JSON.stringify(updatedSongs));
    
    showMessage(`曲「${name}」を保存しました！`, 3000);
  }, [composedSongs, selectedGenre]);

  // 曲を編集モードで開く
  const openSongEditor = useCallback((song: ComposedSong) => {
    setEditingSong(song);
    setViewMode('edit');
  }, []);

  // 編集した曲を保存
  const saveEditedSong = useCallback(() => {
    if (!editingSong) return;
    
    const updatedSongs = composedSongs.map(song => 
      song.id === editingSong.id ? { ...editingSong, isEdited: true } : song
    );
    
    setComposedSongs(updatedSongs);
    localStorage.setItem('composedSongs', JSON.stringify(updatedSongs));
    
    showMessage('編集を保存しました！', 2000);
    setEditingSong(null);
    setViewMode('compose');
  }, [editingSong, composedSongs]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
      playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      
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
  const playSound = useCallback((categoryId: string, frequency: number, duration: number, volume: number, genre?: string) => {
    const instrument = genre ? createInstrumentForGenre(categoryId, genre) : getOrCreateInstrument(categoryId);
    if (!instrument) return;

    try {
      const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
      instrument.volume.value = volumeDb;
      
      if (categoryId === 'staple' || genre === 'japanese') {
        instrument.triggerAttackRelease('C2', duration + 's');
      } else {
        instrument.triggerAttackRelease(frequency, duration + 's');
      }
    } catch (error) {
      console.log(`Could not play sound for ${categoryId}`);
    }
  }, [getOrCreateInstrument, createInstrumentForGenre]);

  // 音楽を生成
  const generateMusic = useCallback((categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    playTimeoutsRef.current = [];

    const baseTempo = genre.baseTempo;
    const adjustedTempo = Math.max(80, Math.min(160, baseTempo * (0.7 + balanceScore * 0.3)));
    const beatDuration = 60 / adjustedTempo;

    const activeCats = categoryRatios.filter(cat => cat.ratio > 0).sort((a, b) => b.ratio - a.ratio);

    activeCats.forEach((category, index) => {
      const delay = index * beatDuration * 800;
      const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
      const duration = category.sound.duration * (0.8 + balanceScore * 0.4);
      const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

      const timeout = setTimeout(() => {
        playSound(category.id, frequency, duration, volume, genre.id);
      }, delay);
      
      playTimeoutsRef.current.push(timeout);
    });

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
  }, [playSound, getOrCreateInstrument]);

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

    const message = balanceScore > 0.7 ? '素晴らしいバランスです！🎵' 
                  : balanceScore > 0.4 ? 'まあまあのバランスです' 
                  : 'バランスを改善しましょう';
    showMessage(message, 4000);

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
      playSound(categoryId, category.sound.frequency, 0.5, 0.5, selectedGenre);
    }
  }, [foodCategories, initializeTone, playSound, selectedGenre]);

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
          音アプリ（拡張版）
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
            <p>食事のバランスを音で表現し、記録・編集できます🎵</p>
            {!globalToneInitialized && (
              <p style={{ color: '#ffeb3b' }}>初回は音ボタンをクリックしてください</p>
            )}
          </div>

          {/* ビューモード切り替え */}
          <div className="view-mode-tabs">
            <button 
              className={viewMode === 'input' ? 'active' : ''}
              onClick={() => setViewMode('input')}
            >
              入力
            </button>
            <button 
              className={viewMode === 'history' ? 'active' : ''}
              onClick={() => setViewMode('history')}
            >
              履歴
            </button>
            <button 
              className={viewMode === 'compose' ? 'active' : ''}
              onClick={() => setViewMode('compose')}
            >
              作曲
            </button>
            {editingSong && (
              <button 
                className={viewMode === 'edit' ? 'active' : ''}
                onClick={() => setViewMode('edit')}
              >
                編集中
              </button>
            )}
          </div>

          {/* 入力ビュー */}
          {viewMode === 'input' && (
            <>
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

              {selectedGenre === 'custom' && (
                <div className="custom-settings">
                  <label>テンポ: {customTempo} BPM</label>
                  <input
                    type="range"
                    min={TEMPO_RANGE.MIN}
                    max={TEMPO_RANGE.MAX}
                    value={customTempo}
                    onChange={(e) => setCustomTempo(parseInt(e.target.value))}
                    aria-label="テンポ調整"
                  />
                  <div className="custom-instruments">
                    <h4>楽器選択</h4>
                    {['piano', 'guitar', 'drums', 'synth', 'strings'].map(inst => (
                      <label key={inst}>
                        <input
                          type="checkbox"
                          checked={customInstruments.includes(inst)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomInstruments([...customInstruments, inst]);
                            } else {
                              setCustomInstruments(customInstruments.filter(i => i !== inst));
                            }
                          }}
                        />
                        {inst}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="repeat-settings">
                <h4>🔄 リピート</h4>
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
                <div className="meal-actions">
                  <button onClick={resetMeal}>リセット</button>
                  <button onClick={saveCurrentRecord} className="save-button">
                    💾 記録を保存
                  </button>
                </div>
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
            </>
          )}

          {/* 履歴ビュー */}
          {viewMode === 'history' && (
            <div className="history-view">
              <h3>📊 記録履歴</h3>
              <div className="period-selector">
                <button 
                  className={selectedPeriod === 'day' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('day')}
                >
                  今日
                </button>
                <button 
                  className={selectedPeriod === 'week' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('week')}
                >
                  1週間
                </button>
                <button 
                  className={selectedPeriod === 'month' ? 'active' : ''}
                  onClick={() => setSelectedPeriod('month')}
                >
                  1ヶ月
                </button>
              </div>
              
              <div className="records-list">
                {getRecordsByPeriod(selectedPeriod).map(record => (
                  <div key={record.id} className="record-item">
                    <span>{new Date(record.date).toLocaleString('ja-JP')}</span>
                    <span>ジャンル: {record.genre}</span>
                    <span>バランス: {Math.round(record.balanceScore * 100)}%</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => playCompiledRecords(getRecordsByPeriod(selectedPeriod))}
                disabled={isPlaying || getRecordsByPeriod(selectedPeriod).length === 0}
                className="compile-play-button"
              >
                🎵 まとめて再生
              </button>
              
              <button 
                onClick={() => {
                  const name = prompt('曲名を入力してください：');
                  if (name) {
                    saveAsComposition(name, getRecordsByPeriod(selectedPeriod));
                  }
                }}
                disabled={getRecordsByPeriod(selectedPeriod).length === 0}
                className="save-song-button"
              >
                💿 曲として保存
              </button>
            </div>
          )}

          {/* 作曲ビュー */}
          {viewMode === 'compose' && (
            <div className="compose-view">
              <h3>🎼 保存した曲</h3>
              <div className="songs-list">
                {composedSongs.map(song => (
                  <div key={song.id} className="song-item">
                    <span className="song-name">{song.name}</span>
                    <span className="song-date">
                      {new Date(song.createdDate).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="song-records">
                      {song.records.length}件の記録
                    </span>
                    {song.isEdited && <span className="edited-badge">編集済</span>}
                    <button onClick={() => playCompiledRecords(song.records)}>
                      ▶️ 再生
                    </button>
                    <button onClick={() => openSongEditor(song)}>
                      ✏️ 編集
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 編集ビュー */}
          {viewMode === 'edit' && editingSong && (
            <div className="edit-view">
              <h3>✏️ 曲を編集: {editingSong.name}</h3>
              <div className="edit-controls">
                <label>
                  曲名:
                  <input 
                    type="text" 
                    value={editingSong.name}
                    onChange={(e) => setEditingSong({...editingSong, name: e.target.value})}
                  />
                </label>
                
                <label>
                  ジャンル:
                  <select 
                    value={editingSong.genre}
                    onChange={(e) => setEditingSong({...editingSong, genre: e.target.value})}
                  >
                    {musicGenres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                </label>
                
                <div className="records-editor">
                  <h4>記録の順序（ドラッグで並び替え可能）</h4>
                  {editingSong.records.map((record, index) => (
                    <div key={record.id} className="editable-record">
                      <span>{index + 1}.</span>
                      <span>{new Date(record.date).toLocaleString('ja-JP')}</span>
                      <button onClick={() => {
                        const newRecords = [...editingSong.records];
                        newRecords.splice(index, 1);
                        setEditingSong({...editingSong, records: newRecords});
                      }}>
                        削除
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="edit-actions">
                  <button onClick={saveEditedSong} className="save-edit-button">
                    💾 編集を保存
                  </button>
                  <button onClick={() => {
                    setEditingSong(null);
                    setViewMode('compose');
                  }}>
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {viewMode === 'input' && (
            <div className="balance-display">
              <h3>📊 バランス分析</h3>
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
          )}
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;