import { useState, useMemo } from 'react';
import { ViewMode } from '../types/calendar.types';

// カレンダーの日付配列を生成するフック
export const useCalendarDays = (currentMonth: Date) => {
  return useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 月の最初の日の曜日（0=日曜日）
    const firstDayOfWeek = firstDay.getDay();
    
    // 前月の日付を計算
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    const days = [];
    
    // 前月の日付（カレンダー表示用）
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // 当月の日付
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    // 次月の日付（6週間分の表示を完成させる）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  }, [currentMonth]);
};

// 週次ナビゲーション用のフック
export const useWeekNavigation = (
  currentMonth: Date,
  onWeekChange?: (weekStart: Date) => void
) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'next' ? currentWeek + 1 : currentWeek - 1;
    setCurrentWeek(newWeek);
    
    if (onWeekChange) {
      const weekStart = new Date(currentMonth);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (newWeek * 7));
      onWeekChange(weekStart);
    }
  };
  
  const resetWeek = () => {
    setCurrentWeek(0);
  };
  
  return {
    currentWeek,
    handleWeekChange,
    resetWeek
  };
};

// ビューモード管理用のフック
export const useViewMode = (
  initialMode: ViewMode = 'month',
  onViewModeChange?: (mode: ViewMode) => void
) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  
  const changeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };
  
  return {
    viewMode,
    changeViewMode
  };
};

// 日付のフォーマット用ヘルパー
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 月名を取得するヘルパー
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long'
  });
};

// 週の開始日を取得するヘルパー
export const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart;
};

// 週の終了日を取得するヘルパー
export const getWeekEnd = (date: Date): Date => {
  const weekEnd = new Date(date);
  weekEnd.setDate(date.getDate() - date.getDay() + 6);
  return weekEnd;
};

// 日付が同じかどうかを判定するヘルパー
export const isSameDate = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

// 日付が今日かどうかを判定するヘルパー
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDate(date, today);
};

// 日付が選択されているかどうかを判定するヘルパー
export const isSelected = (date: Date, selectedDate: Date | null): boolean => {
  if (!selectedDate) {
    return false;
  }
  return isSameDate(date, selectedDate);
};
