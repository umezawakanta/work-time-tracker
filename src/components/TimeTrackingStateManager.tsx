import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TimeEntry } from '../types';

// 時間記録関連の状態の型定義
interface TimeTrackingStates {
  // 基本状態
  currentTimeEntry: TimeEntry | null;
  setCurrentTimeEntry: (entry: TimeEntry | null) => void;
  
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
  
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  
  description: string;
  setDescription: (desc: string) => void;
  
  timeEntries: TimeEntry[];
  setTimeEntries: (entries: TimeEntry[]) => void;
  
  timeEntriesLoading: boolean;
  setTimeEntriesLoading: (loading: boolean) => void;
  
  currentProject: string;
  setCurrentProject: (project: string) => void;
  
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  
  isTimeTrackingActive: boolean;
  setIsTimeTrackingActive: (active: boolean) => void;
}

// コンテキストの作成
const TimeTrackingContext = createContext<TimeTrackingStates | undefined>(undefined);

// プロバイダーコンポーネント
interface TimeTrackingStateProviderProps {
  children: ReactNode;
  user: any; // User型を適切にインポート
}

export const TimeTrackingStateProvider: React.FC<TimeTrackingStateProviderProps> = ({ 
  children, 
  user 
}) => {
  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTimeTrackingActive, setIsTimeTrackingActive] = useState(false);

  // 時間記録の進行状態を監視
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentTimeEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - currentTimeEntry.startTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentTimeEntry]);

  const value: TimeTrackingStates = {
    // 基本状態
    currentTimeEntry,
    setCurrentTimeEntry,
    
    isTracking,
    setIsTracking,
    
    elapsedTime,
    setElapsedTime,
    
    description,
    setDescription,
    
    timeEntries,
    setTimeEntries,
    
    timeEntriesLoading,
    setTimeEntriesLoading,
    
    currentProject,
    setCurrentProject,
    
    startTime,
    setStartTime,
    
    isTimeTrackingActive,
    setIsTimeTrackingActive,
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

// カスタムフック
export const useTimeTrackingState = (): TimeTrackingStates => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTrackingState must be used within a TimeTrackingStateProvider');
  }
  return context;
};

// 時間記録関連のヘルパー関数
export const useTimeTrackingHelpers = () => {
  const timeTrackingState = useTimeTrackingState();
  
  // 時間記録の履歴を取得
  const loadTimeEntries = async () => {
    if (!timeTrackingState.currentTimeEntry) {
      console.warn("ユーザーIDがありません。時間記録を取得できません。");
      timeTrackingState.setTimeEntries([]);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/time-entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn("時間記録APIが利用できません。モックデータを使用します。");
        timeTrackingState.setTimeEntries([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        timeTrackingState.setTimeEntries(data.entries);
      } else {
        console.warn(
          "時間記録の取得に失敗しました。モックデータを使用します。"
        );
        timeTrackingState.setTimeEntries([]);
      }
    } catch (error) {
      console.warn(
        "時間記録の読み込みに失敗しました。モックデータを使用します。",
        error
      );
      timeTrackingState.setTimeEntries([]);
    }
  };

  // 時間記録データからカテゴリ別の時間を計算
  const calculateTimeBreakdown = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 今日の時間記録をフィルタリング
    const todayEntries = (timeTrackingState.timeEntries || []).filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfDay && entry.endTime;
    });

    // カテゴリ別に集計
    const breakdown: { [key: string]: number } = {};
    todayEntries.forEach((entry) => {
      const category = entry.category || "その他";
      const duration = entry.duration || 0;
      breakdown[category] = (breakdown[category] || 0) + duration;
    });

    return breakdown;
  };

  // 生産性の傾向を計算
  const calculateProductivityTrend = (days: number = 7) => {
    const today = new Date();
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setDate(startOfDay.getDate() + 1);

      // その日の時間記録をフィルタリング
      const dayEntries = (timeTrackingState.timeEntries || []).filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startOfDay && entryDate < endOfDay && entry.endTime;
      });

      // その日の総時間を計算
      const totalTime = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      
      trend.push({
        date: date.toISOString().split('T')[0],
        totalTime,
        entries: dayEntries.length
      });
    }

    return trend;
  };

  // 時間記録を開始
  const startTimeTracking = async (project: string, desc: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project,
          description: desc,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newEntry: TimeEntry = {
          id: data.entry.id,
          description: desc,
          startTime: new Date(data.entry.startTime),
        };
        timeTrackingState.setCurrentTimeEntry(newEntry);
        timeTrackingState.setIsTracking(true);
        timeTrackingState.setIsTimeTrackingActive(true);
        timeTrackingState.setElapsedTime(0);
        return { success: true, message: "時間記録を開始しました" };
      } else {
        return { success: false, message: `エラー: ${data.message}` };
      }
    } catch (error) {
      console.error("❌ 時間記録開始エラー:", error);
      return { 
        success: false, 
        message: `エラー: ${error instanceof Error ? error.message : "Unknown error"}` 
      };
    }
  };

  // 時間記録を停止
  const stopTimeTracking = async () => {
    if (!timeTrackingState.currentTimeEntry) {
      return { success: false, message: "エラー: 記録中の時間記録が見つかりません" };
    }

    try {
      const response = await fetch("/api/time-entries/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ entryId: timeTrackingState.currentTimeEntry.id }),
      });

      const data = await response.json();

      if (data.success) {
        timeTrackingState.setCurrentTimeEntry(null);
        timeTrackingState.setIsTracking(false);
        timeTrackingState.setIsTimeTrackingActive(false);
        timeTrackingState.setElapsedTime(0);
        timeTrackingState.setDescription("");
        return { 
          success: true, 
          message: `時間記録を停止しました。記録時間: ${formatTime(data.entry.duration)}` 
        };
      } else {
        return { success: false, message: `エラー: ${data.message}` };
      }
    } catch (error) {
      console.error("❌ 時間記録停止エラー:", error);
      return { 
        success: false, 
        message: `エラー: ${error instanceof Error ? error.message : "Unknown error"}` 
      };
    }
  };

  // 時間記録をリセット
  const resetTimeTracking = () => {
    console.log("時間記録を強制リセットします");
    timeTrackingState.setCurrentTimeEntry(null);
    timeTrackingState.setIsTracking(false);
    timeTrackingState.setIsTimeTrackingActive(false);
    timeTrackingState.setElapsedTime(0);
    timeTrackingState.setDescription("");
    return { success: true, message: "時間記録をリセットしました" };
  };

  // 時間をフォーマットする関数
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  return {
    loadTimeEntries,
    calculateTimeBreakdown,
    calculateProductivityTrend,
    startTimeTracking,
    stopTimeTracking,
    resetTimeTracking,
    formatTime,
  };
};

export default TimeTrackingStateProvider;
