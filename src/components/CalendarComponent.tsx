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
  // 記録詳細表示用のprops
  selectedRecord?: any;
  selectedRecordType?: "income" | "expense" | "diary" | null;
  onEditIncomeExpense?: (record: any) => void;
  onEditDiary?: (diary: any) => void;
  onDeleteIncomeExpense?: (id: string) => void;
  onDeleteDiary?: (id: string) => void;
  // 月次統計表示用のprops
  monthlySummary?: any;
  weeklySummary?: any;
  calendarViewMode?: 'month' | 'week';
  isSummaryExpanded?: boolean;
  onToggleSummary?: () => void;
  // 月次メモ表示用のprops
  monthlyMemo?: string;
  weeklyMemo?: string;
  editingMonthlyMemo?: boolean;
  editingWeeklyMemo?: boolean;
  isMemoExpanded?: boolean;
  onToggleMemo?: () => void;
  onStartEditingMonthlyMemo?: () => void;
  onCancelEditingMonthlyMemo?: () => void;
  onSaveMonthlyMemo?: () => void;
  onStartEditingWeeklyMemo?: () => void;
  onCancelEditingWeeklyMemo?: () => void;
  onSaveWeeklyMemo?: () => void;
  onMonthlyMemoChange?: (memo: string) => void;
  onWeeklyMemoChange?: (memo: string) => void;
  // アクションボタン用のprops
  onRefresh?: () => void;
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
  selectedRecord,
  selectedRecordType,
  onEditIncomeExpense,
  onEditDiary,
  onDeleteIncomeExpense,
  onDeleteDiary,
  monthlySummary,
  weeklySummary,
  calendarViewMode,
  isSummaryExpanded,
  onToggleSummary,
  monthlyMemo,
  weeklyMemo,
  editingMonthlyMemo,
  editingWeeklyMemo,
  isMemoExpanded,
  onToggleMemo,
  onStartEditingMonthlyMemo,
  onCancelEditingMonthlyMemo,
  onSaveMonthlyMemo,
  onStartEditingWeeklyMemo,
  onCancelEditingWeeklyMemo,
  onSaveWeeklyMemo,
  onMonthlyMemoChange,
  onWeeklyMemoChange,
  onRefresh
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
                      
                      {/* 基本情報 */}
                      <div className="diary-basic-info">
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

                      {/* 詳細項目の表示 */}
                      <div className="diary-detailed-sections">
                        {/* 仕事の要約 */}
                        {diary.workSummary && (
                          <div className="diary-section">
                            <h5><i className="bi bi-briefcase"></i> 仕事の要約</h5>
                            <p>{diary.workSummary}</p>
                          </div>
                        )}

                        {/* 今日の成果 */}
                        {diary.achievements && diary.achievements.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-trophy"></i> 今日の成果</h5>
                            <ul>
                              {diary.achievements.map((achievement, idx) => (
                                <li key={idx}>{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 課題・困難 */}
                        {diary.challenges && diary.challenges.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-exclamation-triangle"></i> 課題・困難</h5>
                            <ul>
                              {diary.challenges.map((challenge, idx) => (
                                <li key={idx}>{challenge}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 活動 */}
                        {diary.activities && diary.activities.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-activity"></i> 活動</h5>
                            <ul>
                              {diary.activities.map((activity, idx) => (
                                <li key={idx}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 学んだこと */}
                        {diary.learnings && diary.learnings.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-lightbulb"></i> 学んだこと</h5>
                            <ul>
                              {diary.learnings.map((learning, idx) => (
                                <li key={idx}>{learning}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 明日の目標 */}
                        {diary.nextGoals && diary.nextGoals.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-target"></i> 明日の目標</h5>
                            <ul>
                              {diary.nextGoals.map((goal, idx) => (
                                <li key={idx}>{goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 数値指標 */}
                        <div className="diary-metrics">
                          <h5><i className="bi bi-graph-up"></i> 今日の指標</h5>
                          <div className="metrics-grid">
                            {diary.energyLevel && (
                              <div className="metric-item">
                                <span className="metric-label">エネルギーレベル:</span>
                                <span className="metric-value">{diary.energyLevel}/10</span>
                              </div>
                            )}
                            {diary.stressLevel && (
                              <div className="metric-item">
                                <span className="metric-label">ストレスレベル:</span>
                                <span className="metric-value">{diary.stressLevel}/10</span>
                              </div>
                            )}
                            {diary.productivity && (
                              <div className="metric-item">
                                <span className="metric-label">生産性:</span>
                                <span className="metric-value">{diary.productivity}/10</span>
                              </div>
                            )}
                            {diary.workHours > 0 && (
                              <div className="metric-item">
                                <span className="metric-label">作業時間:</span>
                                <span className="metric-value">{diary.workHours}時間</span>
                              </div>
                            )}
                            {diary.breakTime > 0 && (
                              <div className="metric-item">
                                <span className="metric-label">休憩時間:</span>
                                <span className="metric-value">{diary.breakTime}分</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* その他のメモ */}
                        {diary.notes && (
                          <div className="diary-section">
                            <h5><i className="bi bi-sticky"></i> その他のメモ</h5>
                            <p>{diary.notes}</p>
                          </div>
                        )}

                        {/* 感謝の気持ち */}
                        {diary.gratitude && (
                          <div className="diary-section">
                            <h5><i className="bi bi-heart"></i> 感謝の気持ち</h5>
                            <p>{diary.gratitude}</p>
                          </div>
                        )}

                        {/* タグ */}
                        {diary.tags && diary.tags.length > 0 && (
                          <div className="diary-section">
                            <h5><i className="bi bi-tags"></i> タグ</h5>
                            <div className="diary-tags">
                              {diary.tags.map((tag, idx) => (
                                <span key={idx} className="diary-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
        
        
        {/* 月次統計表示 */}
        {monthlySummary && (
          <div className="calendar-monthly-summary">
            <div 
              className="summary-header"
              onClick={onToggleSummary}
              style={{ cursor: 'pointer' }}
            >
              <h3>
                <i className="bi bi-graph-up"></i> 
                {calendarViewMode === 'month' 
                  ? `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月の統計`
                  : `週の統計`
                }
              </h3>
              <i className={`bi bi-chevron-${isSummaryExpanded ? 'up' : 'down'} summary-toggle-icon`}></i>
            </div>
            {isSummaryExpanded && (
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">総収入</span>
                  <span className="summary-value income">
                    ¥{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.totalIncome || 0).toLocaleString()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">総支出</span>
                  <span className="summary-value expense">
                    ¥{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.totalExpense || 0).toLocaleString()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">収支</span>
                  <span className={`summary-value ${((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.netBalance || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.netBalance || 0) >= 0 ? '+' : ''}¥{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.netBalance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">平均気分</span>
                  <span className="summary-value">
                    {((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.averageMood || 0) > 0 ? (
                      <>
                        <i className="bi bi-emoji-smile"></i> {((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.averageMood || 0).toFixed(1)}
                      </>
                    ) : 'なし'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">収入記録</span>
                  <span className="summary-value">{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.incomeRecordsCount || 0)}件</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">支出記録</span>
                  <span className="summary-value">{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.expenseRecordsCount || 0)}件</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">日記</span>
                  <span className="summary-value">{((calendarViewMode === 'month' ? monthlySummary : weeklySummary)?.diariesCount || 0)}件</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 月次メモ表示 */}
        {monthlyMemo !== undefined && (
          <div className="calendar-monthly-memo">
            <div 
              className="memo-header"
              onClick={onToggleMemo}
              style={{ cursor: 'pointer' }}
            >
              <h3>
                <i className="bi bi-journal-text"></i> 
                {calendarViewMode === 'month' 
                  ? `${currentMonth.getMonth() + 1}月の目標と振り返り`
                  : `週の目標と振り返り`
                }
              </h3>
              <i className={`bi bi-chevron-${isMemoExpanded ? 'up' : 'down'} memo-toggle-icon`}></i>
            </div>
            {isMemoExpanded && (
              <div className="memo-content">
                {calendarViewMode === 'month' ? (
                  // 月次メモ
                  editingMonthlyMemo ? (
                    <div className="memo-edit">
                      <textarea
                        value={monthlyMemo}
                        onChange={(e) => onMonthlyMemoChange?.(e.target.value)}
                        placeholder="今月の振り返りや来月の目標を書いてください"
                        rows={4}
                      />
                      <div className="memo-actions">
                        <button onClick={onSaveMonthlyMemo} className="save-button">
                          保存
                        </button>
                        <button onClick={onCancelEditingMonthlyMemo} className="cancel-button">
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="memo-display">
                      <p>{monthlyMemo || '月次メモがありません'}</p>
                      <button onClick={onStartEditingMonthlyMemo} className="edit-button">
                        編集
                      </button>
                    </div>
                  )
                ) : (
                  // 週次メモ
                  editingWeeklyMemo ? (
                    <div className="memo-edit">
                      <textarea
                        value={weeklyMemo}
                        onChange={(e) => onWeeklyMemoChange?.(e.target.value)}
                        placeholder="今週の振り返りや来週の目標を書いてください"
                        rows={4}
                      />
                      <div className="memo-actions">
                        <button onClick={onSaveWeeklyMemo} className="save-button">
                          保存
                        </button>
                        <button onClick={onCancelEditingWeeklyMemo} className="cancel-button">
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="memo-display">
                      <p>{weeklyMemo || '週次メモがありません'}</p>
                      <button onClick={onStartEditingWeeklyMemo} className="edit-button">
                        編集
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
        
        {/* アクションボタン */}
        {onRefresh && (
          <div className="calendar-action-buttons-bottom">
            <button
              onClick={onRefresh}
              className="action-button refresh-button"
            >
              <i className="bi bi-arrow-clockwise"></i> 更新
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
