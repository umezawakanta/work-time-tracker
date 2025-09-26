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
  // アクションボタン用のprops
  onAddIncomeExpense?: () => void;
  onAddDiary?: () => void;
  // 記録詳細表示用のprops
  selectedRecord?: any;
  selectedRecordType?: "income" | "expense" | "diary" | null;
  onEditIncomeExpense?: (record: any) => void;
  onEditDiary?: (diary: any) => void;
  onDeleteIncomeExpense?: (id: string) => void;
  onDeleteDiary?: (id: string) => void;
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
  onWeekChange,
  onAddIncomeExpense,
  onAddDiary,
  selectedRecord,
  selectedRecordType,
  onEditIncomeExpense,
  onEditDiary,
  onDeleteIncomeExpense,
  onDeleteDiary
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
        
        {/* 選択された記録の詳細 */}
        {selectedRecord && selectedDate && (
          <div className="calendar-record-details">
            <h3>
              <i className="bi bi-calendar-check"></i>
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
              <span className="day-of-week">
                ({['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]})
              </span>の記録
            </h3>
            
            {/* 収入記録の表示 */}
            {selectedRecord.incomeRecords && selectedRecord.incomeRecords.length > 0 && (
              <div className="income-records-detail">
                <h4>
                  <i className="bi bi-arrow-up-circle-fill"></i>
                  収入記録 ({selectedRecord.incomeRecords.length}件)
                  <span className="total-amount">
                    合計: ¥{selectedRecord.incomeRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0).toLocaleString()}
                  </span>
                </h4>
                {selectedRecord.incomeRecords.map((record: any, index: number) => (
                  <div key={index} className="record-item">
                    <div className="record-header">
                      <span className="record-amount income">¥{(record.amount || 0).toLocaleString()}</span>
                      <span className="record-time">
                        {new Date(record.date).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="record-content">
                      {record.notes && record.notes.trim() ? (
                        <p className="record-title">{record.notes}</p>
                      ) : (
                        <p className="record-title">収入記録</p>
                      )}
                    </div>
                    <div className="record-actions">
                      <button
                        onClick={() => onEditIncomeExpense?.(record)}
                        className="edit-button"
                      >
                        <i className="bi bi-pencil"></i> 編集
                      </button>
                      <button
                        onClick={() => onDeleteIncomeExpense?.(record._id)}
                        className="delete-button"
                      >
                        <i className="bi bi-trash"></i> 削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 支出記録の表示 */}
            {selectedRecord.expenseRecords && selectedRecord.expenseRecords.length > 0 && (
              <div className="expense-records-detail">
                <h4>
                  <i className="bi bi-arrow-down-circle-fill"></i>
                  支出記録 ({selectedRecord.expenseRecords.length}件)
                  <span className="total-amount">
                    合計: ¥{selectedRecord.expenseRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0).toLocaleString()}
                  </span>
                </h4>
                {selectedRecord.expenseRecords.map((record: any, index: number) => (
                  <div key={index} className="record-item">
                    <div className="record-header">
                      <span className="record-amount expense">¥{(record.amount || 0).toLocaleString()}</span>
                      <span className="record-time">
                        {new Date(record.date).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="record-content">
                      {record.notes && record.notes.trim() ? (
                        <p className="record-title">{record.notes}</p>
                      ) : (
                        <p className="record-title">支出記録</p>
                      )}
                    </div>
                    <div className="record-actions">
                      <button
                        onClick={() => onEditIncomeExpense?.(record)}
                        className="edit-button"
                      >
                        <i className="bi bi-pencil"></i> 編集
                      </button>
                      <button
                        onClick={() => onDeleteIncomeExpense?.(record._id)}
                        className="delete-button"
                      >
                        <i className="bi bi-trash"></i> 削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 日記の表示 */}
            {selectedRecord.workDiaries && selectedRecord.workDiaries.length > 0 && (
              <div className="diary-records-detail">
                <h4>
                  <i className="bi bi-journal-text"></i>
                  日記 ({selectedRecord.workDiaries.length}件)
                </h4>
                {selectedRecord.workDiaries.map((diary: any, index: number) => (
                  <div key={diary._id || index} className="record-item">
                    <div className="record-header">
                      <span className="record-amount" style={{ color: 'var(--info-color, #17a2b8)' }}>
                        <i className="bi bi-journal-text"></i>
                      </span>
                      <span className="record-time">
                        {new Date(diary.date).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="record-content">
                      <p className="record-title">{diary.title}</p>
                      <p className="diary-content-full">{diary.content}</p>
                      {diary.mood && (
                        <span className="diary-mood">
                          <i className={`bi bi-emoji-${diary.mood === '1' ? 'frown' : 
                            diary.mood === '2' ? 'meh' : 
                            diary.mood === '3' ? 'neutral' : 
                            diary.mood === '4' ? 'smile' : 'laughing'}`}></i>
                        </span>
                      )}
                    </div>
                    <div className="record-actions">
                      <button
                        onClick={() => onEditDiary?.(diary)}
                        className="edit-button"
                      >
                        <i className="bi bi-pencil"></i> 編集
                      </button>
                      <button
                        onClick={() => onDeleteDiary?.(diary._id)}
                        className="delete-button"
                      >
                        <i className="bi bi-trash"></i> 削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 記録がない場合の表示 */}
            {(!selectedRecord.incomeRecords || selectedRecord.incomeRecords.length === 0) &&
             (!selectedRecord.expenseRecords || selectedRecord.expenseRecords.length === 0) &&
             (!selectedRecord.workDiaries || selectedRecord.workDiaries.length === 0) && (
              <div className="no-records">
                <div className="no-records-icon">
                  <i className="bi bi-calendar-x"></i>
                </div>
                <h4>この日は記録がありません</h4>
                <p>収支記録や日記を追加してみましょう</p>
              </div>
            )}
          </div>
        )}
        
        {/* アクションボタン */}
        {selectedDate && (
          <div className="calendar-action-buttons">
            <button
              onClick={onAddIncomeExpense}
              className="calendar-action-button income-expense-button"
              title="収支記録を追加"
            >
              <i className="bi bi-plus-circle"></i>
              <span>収支記録</span>
            </button>
            <button
              onClick={onAddDiary}
              className="calendar-action-button diary-button"
              title="日記を追加"
            >
              <i className="bi bi-journal-plus"></i>
              <span>日記追加</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
