import React, { createContext, useContext, useState, ReactNode } from 'react';

// タイマープリセットの型定義
export interface TimerPreset {
  id: number;
  name: string;
  minutes: number;
  seconds: number;
  color: string;
}

// タイマープリセット関連の状態の型定義
interface TimerPresetStates {
  // プリセット状態
  timerPresets: TimerPreset[];
  setTimerPresets: (presets: TimerPreset[]) => void;
  
  // プリセットタイマーの制御
  startPresetTimer: (preset: TimerPreset) => void;
  stopPresetTimer: () => void;
  resetPresetTimer: () => void;
  
  // プリセットの管理
  addPreset: (preset: Omit<TimerPreset, 'id'>) => void;
  updatePreset: (id: number, preset: Partial<TimerPreset>) => void;
  deletePreset: (id: number) => void;
  
  // プリセットの保存・読み込み
  savePresets: () => void;
  loadPresets: () => void;
}

// コンテキストの作成
const TimerPresetContext = createContext<TimerPresetStates | undefined>(undefined);

// プロバイダーコンポーネント
interface TimerPresetProviderProps {
  children: ReactNode;
  // 外部のタイマー制御関数
  onStartTimer: (minutes: number, seconds: number, name: string) => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  isTimerActive: boolean;
}

export const TimerPresetProvider: React.FC<TimerPresetProviderProps> = ({ 
  children, 
  onStartTimer,
  onStopTimer,
  onResetTimer,
  isTimerActive
}) => {
  // デフォルトのタイマープリセット
  const defaultPresets: TimerPreset[] = [
    { id: 1, name: "ポモドーロ", minutes: 25, seconds: 0, color: "#ef4444" },
    { id: 2, name: "短い休憩", minutes: 5, seconds: 0, color: "#10b981" },
    { id: 3, name: "長い休憩", minutes: 15, seconds: 0, color: "#3b82f6" },
    { id: 4, name: "料理タイマー", minutes: 10, seconds: 0, color: "#f59e0b" },
    { id: 5, name: "運動タイマー", minutes: 30, seconds: 0, color: "#8b5cf6" },
  ];

  const [timerPresets, setTimerPresets] = useState<TimerPreset[]>(defaultPresets);

  // プリセットタイマーを開始
  const startPresetTimer = (preset: TimerPreset) => {
    if (isTimerActive) {
      return;
    }
    onStartTimer(preset.minutes, preset.seconds, preset.name);
  };

  // プリセットタイマーを停止
  const stopPresetTimer = () => {
    onStopTimer();
  };

  // プリセットタイマーをリセット
  const resetPresetTimer = () => {
    onResetTimer();
  };

  // 新しいプリセットを追加
  const addPreset = (preset: Omit<TimerPreset, 'id'>) => {
    const newId = Math.max(...timerPresets.map(p => p.id), 0) + 1;
    const newPreset: TimerPreset = { ...preset, id: newId };
    setTimerPresets(prev => [...prev, newPreset]);
  };

  // プリセットを更新
  const updatePreset = (id: number, updates: Partial<TimerPreset>) => {
    setTimerPresets(prev => 
      prev.map(preset => 
        preset.id === id ? { ...preset, ...updates } : preset
      )
    );
  };

  // プリセットを削除
  const deletePreset = (id: number) => {
    setTimerPresets(prev => prev.filter(preset => preset.id !== id));
  };

  // プリセットをローカルストレージに保存
  const savePresets = () => {
    try {
      localStorage.setItem('timerPresets', JSON.stringify(timerPresets));
    } catch (error) {
      console.error('プリセットの保存に失敗しました:', error);
    }
  };

  // プリセットをローカルストレージから読み込み
  const loadPresets = () => {
    try {
      const saved = localStorage.getItem('timerPresets');
      if (saved) {
        const parsedPresets = JSON.parse(saved);
        setTimerPresets(parsedPresets);
      }
    } catch (error) {
      console.error('プリセットの読み込みに失敗しました:', error);
    }
  };

  const value: TimerPresetStates = {
    // プリセット状態
    timerPresets,
    setTimerPresets,
    
    // プリセットタイマーの制御
    startPresetTimer,
    stopPresetTimer,
    resetPresetTimer,
    
    // プリセットの管理
    addPreset,
    updatePreset,
    deletePreset,
    
    // プリセットの保存・読み込み
    savePresets,
    loadPresets,
  };

  return (
    <TimerPresetContext.Provider value={value}>
      {children}
    </TimerPresetContext.Provider>
  );
};

// カスタムフック
export const useTimerPresetState = (): TimerPresetStates => {
  const context = useContext(TimerPresetContext);
  if (context === undefined) {
    throw new Error('useTimerPresetState must be used within a TimerPresetProvider');
  }
  return context;
};

// タイマープリセットのヘルパー関数
export const useTimerPresetHelpers = () => {
  const timerPresetState = useTimerPresetState();
  
  // プリセットを名前で検索
  const findPresetByName = (name: string): TimerPreset | undefined => {
    return timerPresetState.timerPresets.find(preset => preset.name === name);
  };

  // プリセットをIDで検索
  const findPresetById = (id: number): TimerPreset | undefined => {
    return timerPresetState.timerPresets.find(preset => preset.id === id);
  };

  // プリセットを色で検索
  const findPresetsByColor = (color: string): TimerPreset[] => {
    return timerPresetState.timerPresets.filter(preset => preset.color === color);
  };

  // プリセットの総時間を計算（秒）
  const calculatePresetDuration = (preset: TimerPreset): number => {
    return preset.minutes * 60 + preset.seconds;
  };

  // プリセットを時間でソート
  const sortPresetsByDuration = (ascending: boolean = true): TimerPreset[] => {
    return [...timerPresetState.timerPresets].sort((a, b) => {
      const durationA = calculatePresetDuration(a);
      const durationB = calculatePresetDuration(b);
      return ascending ? durationA - durationB : durationB - durationA;
    });
  };

  // プリセットを名前でソート
  const sortPresetsByName = (ascending: boolean = true): TimerPreset[] => {
    return [...timerPresetState.timerPresets].sort((a, b) => {
      return ascending 
        ? a.name.localeCompare(b.name, 'ja')
        : b.name.localeCompare(a.name, 'ja');
    });
  };

  // プリセットの統計情報を取得
  const getPresetStats = () => {
    const totalPresets = timerPresetState.timerPresets.length;
    const totalDuration = timerPresetState.timerPresets.reduce(
      (sum, preset) => sum + calculatePresetDuration(preset), 
      0
    );
    const averageDuration = totalPresets > 0 ? totalDuration / totalPresets : 0;
    const colorCounts = timerPresetState.timerPresets.reduce((counts, preset) => {
      counts[preset.color] = (counts[preset.color] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalPresets,
      totalDuration,
      averageDuration,
      colorCounts,
    };
  };

  return {
    findPresetByName,
    findPresetById,
    findPresetsByColor,
    calculatePresetDuration,
    sortPresetsByDuration,
    sortPresetsByName,
    getPresetStats,
  };
};

export default TimerPresetProvider;
