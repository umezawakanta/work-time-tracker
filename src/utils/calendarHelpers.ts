import type { Memo } from '../types';

// カレンダーの日付配列を生成
export const getCalendarDays = (currentMonth: Date): Date[] => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// 指定された日付のメモを取得
export const getMemosForDate = (memos: Memo[], date: Date): Memo[] => {
  const dateStr = date.toISOString().split('T')[0];
  return memos.filter(memo => {
    const memoDate = new Date(memo.createdAt).toISOString().split('T')[0];
    return memoDate === dateStr;
  });
};

// 月次統計を計算
export const getMonthlyStats = (memos: Memo[], currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const monthMemos = memos.filter(memo => {
    const memoDate = new Date(memo.createdAt);
    return memoDate.getFullYear() === year && memoDate.getMonth() === month;
  });
  
  const totalMemos = monthMemos.length;
  const errorReports = monthMemos.filter(memo => memo.postType === 'error_report').length;
  const updateRequests = monthMemos.filter(memo => memo.postType === 'update_request').length;
  const generalMemos = monthMemos.filter(memo => !memo.postType || memo.postType === 'general').length;
  
  const resolvedMemos = monthMemos.filter(memo => memo.status === 'resolved').length;
  const pendingMemos = monthMemos.filter(memo => memo.status === 'pending').length;
  const inProgressMemos = monthMemos.filter(memo => memo.status === 'in_progress').length;
  
  return {
    total: totalMemos,
    errorReports,
    updateRequests,
    general: generalMemos,
    resolved: resolvedMemos,
    pending: pendingMemos,
    inProgress: inProgressMemos,
    resolutionRate: totalMemos > 0 ? (resolvedMemos / totalMemos) * 100 : 0
  };
};

// 週次統計を計算
export const getWeeklyStats = (memos: Memo[], weekStart: Date) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weekMemos = memos.filter(memo => {
    const memoDate = new Date(memo.createdAt);
    return memoDate >= weekStart && memoDate <= weekEnd;
  });
  
  const totalMemos = weekMemos.length;
  const errorReports = weekMemos.filter(memo => memo.postType === 'error_report').length;
  const updateRequests = weekMemos.filter(memo => memo.postType === 'update_request').length;
  const generalMemos = weekMemos.filter(memo => !memo.postType || memo.postType === 'general').length;
  
  const resolvedMemos = weekMemos.filter(memo => memo.status === 'resolved').length;
  const pendingMemos = weekMemos.filter(memo => memo.status === 'pending').length;
  const inProgressMemos = weekMemos.filter(memo => memo.status === 'in_progress').length;
  
  return {
    total: totalMemos,
    errorReports,
    updateRequests,
    general: generalMemos,
    resolved: resolvedMemos,
    pending: pendingMemos,
    inProgress: inProgressMemos,
    resolutionRate: totalMemos > 0 ? (resolvedMemos / totalMemos) * 100 : 0
  };
};

// 日付が今日かどうかを判定
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// 日付が選択されているかどうかを判定
export const isSelectedDate = (date: Date, selectedDate: Date | null): boolean => {
  if (!selectedDate) return false;
  return date.toDateString() === selectedDate.toDateString();
};

// 日付が現在の月かどうかを判定
export const isCurrentMonth = (date: Date, currentMonth: Date): boolean => {
  return date.getMonth() === currentMonth.getMonth() && 
         date.getFullYear() === currentMonth.getFullYear();
};

// 日付の表示用テキストを取得
export const getDateDisplayText = (date: Date): string => {
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric'
  });
};

// 週の開始日を取得
export const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  return weekStart;
};

// 週の終了日を取得
export const getWeekEnd = (date: Date): Date => {
  const weekEnd = new Date(date);
  weekEnd.setDate(date.getDate() - date.getDay() + 6);
  return weekEnd;
};

// 月の最初の日を取得
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// 月の最後の日を取得
export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// 日付範囲の表示用テキストを取得
export const getDateRangeText = (startDate: Date, endDate: Date): string => {
  const start = startDate.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric'
  });
  const end = endDate.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric'
  });
  return `${start} - ${end}`;
};

