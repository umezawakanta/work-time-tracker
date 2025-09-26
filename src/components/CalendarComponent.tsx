import React, { useState, useEffect, useRef } from 'react';
import './CalendarComponent.css';

interface CalendarComponentProps {
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  getRecordsForDate: (date: Date) => {
    incomeRecords: any[];
    expenseRecords: any[];
    workDiaries: any[];
  };
  isModal?: boolean;
  onClose?: () => void;
  onViewModeChange?: (mode: 'month' | 'week') => void;
  onWeekChange?: (weekStart: Date) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateClick,
  getRecordsForDate,
  isModal = false,
  onClose,
  onViewModeChange,
  onWeekChange
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeek, setCurrentWeek] = useState(0);

  // カレンダーの日付を生成
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // 月の最初の日曜日を取得
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // 6週間分（42日）のカレンダーを生成
    // 日曜日から土曜日まで7日×6週間 = 42日
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // 週表示用の日付を生成
  const getWeekDays = () => {
    const allDays = getCalendarDays();
    const startIndex = currentWeek * 7;
    return allDays.slice(startIndex, startIndex + 7);
  };

  // 週移動ハンドラー
  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(Math.max(0, currentWeek - 1));
    } else {
      setCurrentWeek(Math.min(5, currentWeek + 1));
    }
    
    // 週の開始日を計算してコールバックを呼び出し
    const weekStart = new Date(currentMonth);
    const firstDayOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
    const firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstMonday.getDay();
    const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToAdd);
    
    const targetWeekStart = new Date(firstMonday);
    targetWeekStart.setDate(firstMonday.getDate() + (currentWeek * 7));
    
    onWeekChange?.(targetWeekStart);
  };

  return (
    <div 
      className={`work-records-calendar ${isModal ? 'calendar-modal' : ''}`}
    >
      <div className="calendar-header">
        <div className="calendar-title-container">
          <h3>
            {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            {viewMode === 'week' && ` (第${currentWeek + 1}週)`}
          </h3>
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('month');
                onViewModeChange?.('month');
              }}
            >
              月
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('week');
                onViewModeChange?.('week');
              }}
            >
              週
            </button>
          </div>
        </div>
        <div className="calendar-nav-buttons">
          <button
            onClick={() => viewMode === 'month' ? onMonthChange("prev") : handleWeekChange("prev")}
            className="calendar-nav-button"
          >
            ← {viewMode === 'month' ? '前月' : '前週'}
          </button>
          <button
            onClick={() => viewMode === 'month' ? onMonthChange("next") : handleWeekChange("next")}
            className="calendar-nav-button"
          >
            {viewMode === 'month' ? '次月' : '次週'} →
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={day} className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className={`calendar-days ${viewMode === 'week' ? 'week-view' : ''}`}>
          {(viewMode === 'month' ? getCalendarDays() : getWeekDays()).map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const records = getRecordsForDate(date);
            const dayOfWeek = date.getDay(); // 0=日曜日, 6=土曜日
            
            return (
              <div
                key={index}
                className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : ''}`}
                onClick={() => onDateClick(date)}
              >
                <div className="day-header">
                  <span className="day-number">{date.getDate()}</span>
                  {isToday && <span className="today-indicator">今日</span>}
                </div>
                
                {/* 収入・支出の金額表示 */}
                <div className="day-amounts">
                  {records.incomeRecords.length > 0 && (
                    <div className="income-amount">
                      <span className="amount-label">+</span>
                      <span className="amount-value">
                        ¥{records.incomeRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {records.expenseRecords.length > 0 && (
                    <div className="expense-amount">
                      <span className="amount-label">-</span>
                      <span className="amount-value">
                        ¥{records.expenseRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* 日記の表示 */}
                {records.workDiaries.length > 0 && (
                  <div className="day-diaries">
                    {records.workDiaries.map((diary: any, diaryIndex: number) => (
                      <div key={diaryIndex} className="diary-item">
                        <span className="diary-text">{diary.title || diary.content}</span>
                        <span className="diary-icon">📝</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* アイコン表示 */}
                <div className="day-icons">
                  {records.incomeRecords.length > 0 && (
                    <span className="icon income-icon" title="収入記録">💰</span>
                  )}
                  {records.expenseRecords.length > 0 && (
                    <span className="icon expense-icon" title="支出記録">💸</span>
                  )}
                  {records.workDiaries.length > 0 && (
                    <span className="icon diary-icon" title="日記">📝</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
