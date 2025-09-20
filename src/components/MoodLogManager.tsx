import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MoodLog } from '../types';

// 感情ログフォームの型定義
export interface MoodForm {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  notes: string;
  activities: string[];
  weather: string;
  sleep: number;
}

// 感情ログ関連の状態の型定義
interface MoodLogStates {
  // 感情ログ状態
  moodLogs: MoodLog[];
  setMoodLogs: (logs: MoodLog[]) => void;
  
  // フォーム状態
  showMoodForm: boolean;
  setShowMoodForm: (show: boolean) => void;
  editingMoodLog: string | null;
  setEditingMoodLog: (id: string | null) => void;
  moodForm: MoodForm;
  setMoodForm: (form: MoodForm) => void;
  
  // アクティビティ管理
  newActivity: string;
  setNewActivity: (activity: string) => void;
  
  // 感情ログ管理関数
  addMoodLog: () => void;
  updateMoodLog: (moodLogId: string, updates: Partial<MoodLog>) => void;
  deleteMoodLog: (moodLogId: string) => void;
  editMoodLog: (log: MoodLog) => void;
  saveMoodLog: () => void;
  resetMoodForm: () => void;
  
  // アクティビティ管理関数
  addActivity: () => void;
  removeActivity: (index: number) => void;
  
  // 統計関数
  getAverageMood: () => number;
  getMoodStats: () => {
    total: number;
    average: number;
    highest: number;
    lowest: number;
    recent: MoodLog[];
  };
}

// コンテキストの作成
const MoodLogContext = createContext<MoodLogStates | undefined>(undefined);

// プロバイダーコンポーネント
interface MoodLogProviderProps {
  children: ReactNode;
}

export const MoodLogProvider: React.FC<MoodLogProviderProps> = ({ children }) => {
  // 感情ログ状態
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  
  // フォーム状態
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [editingMoodLog, setEditingMoodLog] = useState<string | null>(null);
  const [moodForm, setMoodForm] = useState<MoodForm>({
    date: new Date().toISOString().split("T")[0],
    mood: 5,
    energy: 5,
    stress: 5,
    notes: "",
    activities: [],
    weather: "晴れ",
    sleep: 8,
  });
  
  // アクティビティ管理
  const [newActivity, setNewActivity] = useState("");

  // 感情ログを追加
  const addMoodLog = () => {
    if (!moodForm.date) {
      return;
    }

    const moodLogId = Date.now().toString();
    const newMoodLog: MoodLog = {
      id: moodLogId,
      date: moodForm.date,
      mood: moodForm.mood,
      energy: moodForm.energy,
      stress: moodForm.stress,
      notes: moodForm.notes,
      activities: moodForm.activities,
      weather: moodForm.weather,
      sleep: moodForm.sleep,
      createdAt: new Date().toISOString(),
    };

    setMoodLogs((prev) => [...prev, newMoodLog]);
    resetMoodForm();
  };

  // 感情ログを更新
  const updateMoodLog = (moodLogId: string, updates: Partial<MoodLog>) => {
    setMoodLogs((prev) =>
      prev.map((log) => (log.id === moodLogId ? { ...log, ...updates } : log))
    );
  };

  // 感情ログを削除
  const deleteMoodLog = (moodLogId: string) => {
    setMoodLogs((prev) => prev.filter((log) => log.id !== moodLogId));
  };

  // 感情ログフォームをリセット
  const resetMoodForm = () => {
    setMoodForm({
      date: new Date().toISOString().split("T")[0],
      mood: 5,
      energy: 5,
      stress: 5,
      notes: "",
      activities: [],
      weather: "晴れ",
      sleep: 8,
    });
    setNewActivity("");
    setShowMoodForm(false);
    setEditingMoodLog(null);
  };

  // アクティビティを追加
  const addActivity = () => {
    if (!newActivity.trim()) {
      return;
    }
    setMoodForm((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity.trim()],
    }));
    setNewActivity("");
  };

  // アクティビティを削除
  const removeActivity = (index: number) => {
    setMoodForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  // 感情ログを編集
  const editMoodLog = (log: MoodLog) => {
    setMoodForm({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
      notes: log.notes,
      activities: log.activities,
      weather: log.weather,
      sleep: log.sleep,
    });
    setEditingMoodLog(log.id);
    setShowMoodForm(true);
  };

  // 感情ログを保存
  const saveMoodLog = () => {
    if (editingMoodLog) {
      updateMoodLog(editingMoodLog, {
        date: moodForm.date,
        mood: moodForm.mood,
        energy: moodForm.energy,
        stress: moodForm.stress,
        notes: moodForm.notes,
        activities: moodForm.activities,
        weather: moodForm.weather,
        sleep: moodForm.sleep,
      });
    } else {
      addMoodLog();
    }
  };

  // 平均気分を取得
  const getAverageMood = () => {
    if (moodLogs.length === 0) {
      return 0;
    }
    return moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodLogs.length;
  };

  // 感情ログの統計情報を取得
  const getMoodStats = () => {
    if (moodLogs.length === 0) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        recent: [],
      };
    }

    const moods = moodLogs.map(log => log.mood);
    const average = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    const highest = Math.max(...moods);
    const lowest = Math.min(...moods);
    
    // 最近の5件を取得
    const recent = [...moodLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      total: moodLogs.length,
      average: Math.round(average * 10) / 10,
      highest,
      lowest,
      recent,
    };
  };

  const value: MoodLogStates = {
    // 感情ログ状態
    moodLogs,
    setMoodLogs,
    
    // フォーム状態
    showMoodForm,
    setShowMoodForm,
    editingMoodLog,
    setEditingMoodLog,
    moodForm,
    setMoodForm,
    
    // アクティビティ管理
    newActivity,
    setNewActivity,
    
    // 感情ログ管理関数
    addMoodLog,
    updateMoodLog,
    deleteMoodLog,
    editMoodLog,
    saveMoodLog,
    resetMoodForm,
    
    // アクティビティ管理関数
    addActivity,
    removeActivity,
    
    // 統計関数
    getAverageMood,
    getMoodStats,
  };

  return (
    <MoodLogContext.Provider value={value}>
      {children}
    </MoodLogContext.Provider>
  );
};

// カスタムフック
export const useMoodLogState = (): MoodLogStates => {
  const context = useContext(MoodLogContext);
  if (context === undefined) {
    throw new Error('useMoodLogState must be used within a MoodLogProvider');
  }
  return context;
};

// 感情ログのヘルパー関数
export const useMoodLogHelpers = () => {
  const moodLogState = useMoodLogState();
  
  // 日付で感情ログを検索
  const findMoodLogByDate = (date: string): MoodLog | undefined => {
    return moodLogState.moodLogs.find(log => log.date === date);
  };

  // 期間で感情ログを検索
  const findMoodLogsByDateRange = (startDate: string, endDate: string): MoodLog[] => {
    return moodLogState.moodLogs.filter(log => {
      const logDate = new Date(log.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return logDate >= start && logDate <= end;
    });
  };

  // 気分レベルで感情ログを検索
  const findMoodLogsByMood = (mood: number): MoodLog[] => {
    return moodLogState.moodLogs.filter(log => log.mood === mood);
  };

  // 気分レベルで感情ログを検索（範囲）
  const findMoodLogsByMoodRange = (minMood: number, maxMood: number): MoodLog[] => {
    return moodLogState.moodLogs.filter(log => 
      log.mood >= minMood && log.mood <= maxMood
    );
  };

  // アクティビティで感情ログを検索
  const findMoodLogsByActivity = (activity: string): MoodLog[] => {
    return moodLogState.moodLogs.filter(log => 
      log.activities.includes(activity)
    );
  };

  // 天気で感情ログを検索
  const findMoodLogsByWeather = (weather: string): MoodLog[] => {
    return moodLogState.moodLogs.filter(log => log.weather === weather);
  };

  // 感情ログを日付でソート
  const sortMoodLogsByDate = (ascending: boolean = true): MoodLog[] => {
    return [...moodLogState.moodLogs].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return ascending 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  // 感情ログを気分でソート
  const sortMoodLogsByMood = (ascending: boolean = true): MoodLog[] => {
    return [...moodLogState.moodLogs].sort((a, b) => {
      return ascending ? a.mood - b.mood : b.mood - a.mood;
    });
  };

  // 感情ログをエネルギーでソート
  const sortMoodLogsByEnergy = (ascending: boolean = true): MoodLog[] => {
    return [...moodLogState.moodLogs].sort((a, b) => {
      return ascending ? a.energy - b.energy : b.energy - a.energy;
    });
  };

  // 感情ログをストレスでソート
  const sortMoodLogsByStress = (ascending: boolean = true): MoodLog[] => {
    return [...moodLogState.moodLogs].sort((a, b) => {
      return ascending ? a.stress - b.stress : b.stress - a.stress;
    });
  };

  // 感情ログを睡眠時間でソート
  const sortMoodLogsBySleep = (ascending: boolean = true): MoodLog[] => {
    return [...moodLogState.moodLogs].sort((a, b) => {
      return ascending ? a.sleep - b.sleep : b.sleep - a.sleep;
    });
  };

  // 感情ログの傾向分析
  const analyzeMoodTrends = () => {
    const sortedLogs = sortMoodLogsByDate(true);
    if (sortedLogs.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        period: 0,
      };
    }

    const firstMood = sortedLogs[0].mood;
    const lastMood = sortedLogs[sortedLogs.length - 1].mood;
    const change = lastMood - firstMood;
    const period = sortedLogs.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (change > 0.5) {
      trend = 'improving';
    } else if (change < -0.5) {
      trend = 'declining';
    }

    return {
      trend,
      change: Math.round(change * 10) / 10,
      period,
    };
  };

  // 感情ログの相関分析
  const analyzeMoodCorrelations = () => {
    if (moodLogs.length < 2) {
      return {
        moodEnergy: 0,
        moodStress: 0,
        moodSleep: 0,
        energyStress: 0,
        energySleep: 0,
        stressSleep: 0,
      };
    }

    // ピアソン相関係数を計算
    const calculateCorrelation = (x: number[], y: number[]) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
      const sumXX = x.reduce((a, b) => a + b * b, 0);
      const sumYY = y.reduce((a, b) => a + b * b, 0);
      
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };

    const moods = moodLogs.map(log => log.mood);
    const energies = moodLogs.map(log => log.energy);
    const stresses = moodLogs.map(log => log.stress);
    const sleeps = moodLogs.map(log => log.sleep);

    return {
      moodEnergy: Math.round(calculateCorrelation(moods, energies) * 100) / 100,
      moodStress: Math.round(calculateCorrelation(moods, stresses) * 100) / 100,
      moodSleep: Math.round(calculateCorrelation(moods, sleeps) * 100) / 100,
      energyStress: Math.round(calculateCorrelation(energies, stresses) * 100) / 100,
      energySleep: Math.round(calculateCorrelation(energies, sleeps) * 100) / 100,
      stressSleep: Math.round(calculateCorrelation(stresses, sleeps) * 100) / 100,
    };
  };

  return {
    findMoodLogByDate,
    findMoodLogsByDateRange,
    findMoodLogsByMood,
    findMoodLogsByMoodRange,
    findMoodLogsByActivity,
    findMoodLogsByWeather,
    sortMoodLogsByDate,
    sortMoodLogsByMood,
    sortMoodLogsByEnergy,
    sortMoodLogsByStress,
    sortMoodLogsBySleep,
    analyzeMoodTrends,
    analyzeMoodCorrelations,
  };
};

export default MoodLogProvider;
