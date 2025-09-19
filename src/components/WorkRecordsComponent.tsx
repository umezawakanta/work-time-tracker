import React, { useState, useEffect } from 'react';
import './WorkRecordsComponent.css';
import type { IncomeExpenseRecord, WorkDiary, User } from '../types';

interface WorkRecordsComponentProps {
  showWorkRecords: boolean;
  setShowWorkRecords: (show: boolean) => void;
  showIncomeExpenseForm: boolean;
  setShowIncomeExpenseForm: (show: boolean) => void;
  showDiaryForm: boolean;
  setShowDiaryForm: (show: boolean) => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  incomeExpenseRecords: IncomeExpenseRecord[];
  workDiaries: WorkDiary[];
  incomeExpenseLoading: boolean;
  diaryLoading: boolean;
  workRecordsLoading: boolean;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedRecord: any;
  setSelectedRecord: (record: any) => void;
  selectedRecordType: "income" | "expense" | "diary" | null;
  setSelectedRecordType: React.Dispatch<React.SetStateAction<"income" | "expense" | "diary" | null>>;
  editingIncomeExpenseRecord: any;
  setEditingIncomeExpenseRecord: (record: any) => void;
  editingDiary: any;
  setEditingDiary: (diary: any) => void;
  incomeExpenseAmount: string;
  setIncomeExpenseAmount: (amount: string) => void;
  incomeExpenseType: "income" | "expense";
  setIncomeExpenseType: (type: "income" | "expense") => void;
  incomeExpenseDate: string;
  setIncomeExpenseDate: (date: string) => void;
  incomeExpenseNotes: string;
  setIncomeExpenseNotes: (notes: string) => void;
  diaryDate: string;
  setDiaryDate: (date: string) => void;
  diaryTitle: string;
  setDiaryTitle: (title: string) => void;
  diaryContent: string;
  setDiaryContent: (content: string) => void;
  diaryMood: string;
  setDiaryMood: (mood: string) => void;
  diaryActivities: string[];
  setDiaryActivities: React.Dispatch<React.SetStateAction<string[]>>;
  diaryNotes: string;
  setDiaryNotes: (notes: string) => void;
  diaryNextGoals: string[];
  setDiaryNextGoals: React.Dispatch<React.SetStateAction<string[]>>;
  diaryChallenges: string[];
  setDiaryChallenges: React.Dispatch<React.SetStateAction<string[]>>;
  diaryAchievements: string[];
  setDiaryAchievements: React.Dispatch<React.SetStateAction<string[]>>;
  diaryGratitude: string;
  setDiaryGratitude: (gratitude: string) => void;
  diaryReflection: string;
  setDiaryReflection: (reflection: string) => void;
  monthlyMemo: string;
  setMonthlyMemo: (memo: string) => void;
  editingMonthlyMemo: boolean;
  setEditingMonthlyMemo: (editing: boolean) => void;
  loadIncomeExpenseRecords: () => void;
  loadWorkDiaries: () => void;
  handleCreateIncomeExpenseRecord: (e: React.FormEvent) => void;
  handleUpdateIncomeExpenseRecord: (e: React.FormEvent) => void;
  handleCreateDiary: (e: React.FormEvent) => void;
  handleUpdateDiary: (e: React.FormEvent) => void;
  handleDeleteIncomeExpenseRecord: (id: string) => void;
  handleDeleteDiary: (id: string) => void;
  openDiaryForm: () => void;
  loadMonthlyMemo: () => void;
  saveMonthlyMemo: () => void;
  startEditingMonthlyMemo: () => void;
  cancelEditingMonthlyMemo: () => void;
  closeOtherFeatures: (activeFeature: string) => void;
  user: User | null;
}

const WorkRecordsComponent: React.FC<WorkRecordsComponentProps> = ({
  showWorkRecords,
  setShowWorkRecords,
  showIncomeExpenseForm,
  setShowIncomeExpenseForm,
  showDiaryForm,
  setShowDiaryForm,
  showCalendar,
  setShowCalendar,
  incomeExpenseRecords,
  workDiaries,
  incomeExpenseLoading,
  diaryLoading,
  workRecordsLoading,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  selectedRecord,
  setSelectedRecord,
  selectedRecordType,
  setSelectedRecordType,
  editingIncomeExpenseRecord,
  setEditingIncomeExpenseRecord,
  editingDiary,
  setEditingDiary,
  incomeExpenseAmount,
  setIncomeExpenseAmount,
  incomeExpenseType,
  setIncomeExpenseType,
  incomeExpenseDate,
  setIncomeExpenseDate,
  incomeExpenseNotes,
  setIncomeExpenseNotes,
  diaryDate,
  setDiaryDate,
  diaryTitle,
  setDiaryTitle,
  diaryContent,
  setDiaryContent,
  diaryMood,
  setDiaryMood,
  diaryActivities,
  setDiaryActivities,
  diaryNotes,
  setDiaryNotes,
  diaryNextGoals,
  setDiaryNextGoals,
  diaryChallenges,
  setDiaryChallenges,
  diaryAchievements,
  setDiaryAchievements,
  diaryGratitude,
  setDiaryGratitude,
  diaryReflection,
  setDiaryReflection,
  monthlyMemo,
  setMonthlyMemo,
  editingMonthlyMemo,
  setEditingMonthlyMemo,
  loadIncomeExpenseRecords,
  loadWorkDiaries,
  handleCreateIncomeExpenseRecord,
  handleUpdateIncomeExpenseRecord,
  handleCreateDiary,
  handleUpdateDiary,
  handleDeleteIncomeExpenseRecord,
  handleDeleteDiary,
  openDiaryForm,
  loadMonthlyMemo,
  saveMonthlyMemo,
  startEditingMonthlyMemo,
  cancelEditingMonthlyMemo,
  closeOtherFeatures,
}) => {
  // カレンダーの日付を生成
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  // 指定された日付の記録を取得
  const getRecordsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const incomeRecords = (incomeExpenseRecords || []).filter(record => 
      new Date(record.date).toISOString().split('T')[0] === dateString && record.type === 'income'
    );
    const expenseRecords = (incomeExpenseRecords || []).filter(record => 
      new Date(record.date).toISOString().split('T')[0] === dateString && record.type === 'expense'
    );
    const diaryRecord = (workDiaries || []).find(diary => 
      new Date(diary.date).toISOString().split('T')[0] === dateString
    );
    
    return { incomeRecords, expenseRecords, diaryRecord };
  };

  // 月の統計を計算
  const getMonthlySummary = (year: number, month: number) => {
    if (!currentMonth) return { totalIncome: 0, totalExpense: 0, netBalance: 0, averageMood: 0, incomeRecordsCount: 0, expenseRecordsCount: 0, diariesCount: 0 };
    
    const monthlyIncomeRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month && record.type === 'income';
    });
    
    const monthlyExpenseRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month && record.type === 'expense';
    });
    
    const monthlyDiaries = (workDiaries || []).filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === year && diaryDate.getMonth() === month;
    });
    
    const totalIncome = monthlyIncomeRecords.length > 0 ? monthlyIncomeRecords.reduce((sum, record) => sum + (record.salary || 0), 0) : 0;
    const totalExpense = monthlyExpenseRecords.length > 0 ? monthlyExpenseRecords.reduce((sum, record) => sum + (record.salary || 0), 0) : 0;
    const netBalance = totalIncome - totalExpense;
    const averageMood = monthlyDiaries.length > 0 
      ? monthlyDiaries.reduce((sum, diary) => sum + (Number(diary.mood) || 0), 0) / monthlyDiaries.length 
      : 0;
    
    return {
      totalIncome,
      totalExpense,
      netBalance,
      averageMood,
      incomeRecordsCount: monthlyIncomeRecords.length,
      expenseRecordsCount: monthlyExpenseRecords.length,
      diariesCount: monthlyDiaries.length,
    };
  };

  // 日付クリックハンドラー
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const records = getRecordsForDate(date);
    if (records.incomeRecords.length > 0 || records.expenseRecords.length > 0 || records.diaryRecord) {
      setSelectedRecord(records);
      // 複数の記録がある場合は、日記を優先表示
      if (records.diaryRecord) {
        setSelectedRecordType("diary");
      } else if (records.incomeRecords.length > 0) {
        setSelectedRecordType("income");
      } else if (records.expenseRecords.length > 0) {
        setSelectedRecordType("expense");
      }
    } else {
      setSelectedRecord(null);
      setSelectedRecordType(null);
    }
  };

  // 記録クリックハンドラー
  const handleRecordClick = (type: "income" | "expense" | "diary", date: Date) => {
    const records = getRecordsForDate(date);
    if (type === "income" && records.incomeRecords.length > 0) {
      setSelectedRecord(records);
      setSelectedRecordType("income");
    } else if (type === "expense" && records.expenseRecords.length > 0) {
      setSelectedRecord(records);
      setSelectedRecordType("expense");
    } else if (type === "diary" && records.diaryRecord) {
      setSelectedRecord(records);
      setSelectedRecordType("diary");
    }
  };

  // 月移動ハンドラー
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // 配列項目を管理する関数
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setter(prev => [...prev, value.trim()]);
      setValue("");
    }
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const monthlySummary = currentMonth ? getMonthlySummary(currentMonth.getFullYear(), currentMonth.getMonth()) : { totalIncome: 0, totalExpense: 0, netBalance: 0, averageMood: 0, incomeRecordsCount: 0, expenseRecordsCount: 0, diariesCount: 0 };

  return (
    <div className="work-records-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">💼</span>
          おしごと記録
        </h2>
        <div className="section-controls">
          {showWorkRecords ? (
            <button
              onClick={() => setShowWorkRecords(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("work-records");
                setShowWorkRecords(true);
                if (incomeExpenseRecords.length === 0) {
                  loadIncomeExpenseRecords();
                }
                if (workDiaries.length === 0) {
                  loadWorkDiaries();
                }
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              <i className="bi bi-play-fill"></i>
            </button>
          )}
        </div>
      </div>

      {showWorkRecords && (
        <div className="work-records-content">
          {/* 月別統計 */}
          <div className="monthly-summary">
            <h3><i className="bi bi-graph-up"></i> {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月の統計</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">総収入</span>
                <span className="summary-value income">¥{(monthlySummary.totalIncome || 0).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">総支出</span>
                <span className="summary-value expense">¥{(monthlySummary.totalExpense || 0).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">収支</span>
                <span className={`summary-value ${monthlySummary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                  {monthlySummary.netBalance >= 0 ? '+' : ''}¥{(monthlySummary.netBalance || 0).toLocaleString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">平均気分</span>
                <span className="summary-value">
                  {monthlySummary.averageMood > 0 ? `<i className="bi bi-emoji-smile"></i> ${monthlySummary.averageMood.toFixed(1)}` : 'なし'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">収入記録</span>
                <span className="summary-value">{monthlySummary.incomeRecordsCount}件</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">支出記録</span>
                <span className="summary-value">{monthlySummary.expenseRecordsCount}件</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">日記</span>
                <span className="summary-value">{monthlySummary.diariesCount}件</span>
              </div>
            </div>
          </div>

          {/* カレンダー */}
          <div className="work-records-calendar">
            <div className="calendar-header">
              <button
                onClick={() => navigateMonth("prev")}
                className="calendar-nav-button"
              >
                ← 前月
              </button>
              <h3>
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="calendar-nav-button"
              >
                次月 →
              </button>
            </div>
            
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {getCalendarDays().map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const records = getRecordsForDate(date);
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <span className="day-number">{date.getDate()}</span>
                      
                      {/* 収入・支出の金額表示 */}
                      <div className="day-amounts">
                        {records.incomeRecords.length > 0 && (
                          <div className="income-amount">
                            <span className="amount-label">+</span>
                            <span className="amount-value">
                              ¥{records.incomeRecords.reduce((sum, record) => sum + (record.salary || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {records.expenseRecords.length > 0 && (
                          <div className="expense-amount">
                            <span className="amount-label">-</span>
                            <span className="amount-value">
                              ¥{records.expenseRecords.reduce((sum, record) => sum + (record.salary || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 日記のタイトル表示 */}
                      {records.diaryRecord && (
                        <div className="diary-title">
                          <span className="diary-title-text" title={records.diaryRecord.title}>
                            {records.diaryRecord.title.length > 8 
                              ? records.diaryRecord.title.substring(0, 8) + '...' 
                              : records.diaryRecord.title}
                          </span>
                        </div>
                      )}

                      <div className="day-indicators">
                        {records.incomeRecords.length > 0 && (
                          <span 
                            className="income-indicator" 
                            title="収入記録"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecordClick("income", date);
                            }}
                          >
                            💰
                          </span>
                        )}
                        {records.expenseRecords.length > 0 && (
                          <span 
                            className="expense-indicator" 
                            title="支出記録"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecordClick("expense", date);
                            }}
                          >
                            💸
                          </span>
                        )}
                        {records.diaryRecord && (
                          <span 
                            className="diary-indicator" 
                            title="日記"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecordClick("diary", date);
                            }}
                          >
                            <i className="bi bi-journal-text"></i>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 選択された記録の詳細 */}
          {selectedRecord && (
            <div className="record-details">
              <h3>
                <i className="bi bi-calendar-check"></i>
                {selectedDate ? selectedDate.toLocaleDateString('ja-JP', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : '選択された日付'}の記録
              </h3>
              
              {/* 収入記録の表示 */}
              {selectedRecord.incomeRecords && selectedRecord.incomeRecords.length > 0 && (
                <div className="income-records-detail">
                  <h4>
                    <i className="bi bi-arrow-up-circle-fill"></i>
                    収入記録 ({selectedRecord.incomeRecords.length}件)
                    <span className="total-amount">
                      合計: ¥{selectedRecord.incomeRecords.reduce((sum, record) => sum + (record.amount || 0), 0).toLocaleString()}
                    </span>
                  </h4>
                  {selectedRecord.incomeRecords.map((record, index) => (
                    <div key={index} className="record-item">
                      <div className="record-header">
                        <span className="record-amount income">¥{(record.salary || 0).toLocaleString()}</span>
                        <span className="record-time">
                          {new Date(record.date).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="record-notes">{record.notes}</p>
                      )}
                      <div className="record-actions">
                        <button
                          onClick={() => setEditingIncomeExpenseRecord(record)}
                          className="edit-button"
                        >
                          <i className="bi bi-pencil"></i> 編集
                        </button>
                        <button
                          onClick={() => handleDeleteIncomeExpenseRecord(record.id)}
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
                      合計: ¥{selectedRecord.expenseRecords.reduce((sum, record) => sum + (record.amount || 0), 0).toLocaleString()}
                    </span>
                  </h4>
                  {selectedRecord.expenseRecords.map((record, index) => (
                    <div key={index} className="record-item">
                      <div className="record-header">
                        <span className="record-amount expense">¥{(record.salary || 0).toLocaleString()}</span>
                        <span className="record-time">
                          {new Date(record.date).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="record-notes">{record.notes}</p>
                      )}
                      <div className="record-actions">
                        <button
                          onClick={() => setEditingIncomeExpenseRecord(record)}
                          className="edit-button"
                        >
                          <i className="bi bi-pencil"></i> 編集
                        </button>
                        <button
                          onClick={() => handleDeleteIncomeExpenseRecord(record.id)}
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
              {selectedRecord.diaryRecord && (
                <div className="diary-record-detail">
                  <h4>
                    <i className="bi bi-journal-text"></i>
                    日記: {selectedRecord.diaryRecord.title}
                    <span className="diary-mood">
                      {selectedRecord.diaryRecord.mood && (
                        <i className={`bi bi-emoji-${selectedRecord.diaryRecord.mood === '1' ? 'frown' : 
                          selectedRecord.diaryRecord.mood === '2' ? 'meh' : 
                          selectedRecord.diaryRecord.mood === '3' ? 'neutral' : 
                          selectedRecord.diaryRecord.mood === '4' ? 'smile' : 'laughing'}`}></i>
                      )}
                    </span>
                  </h4>
                  <p><strong>タイトル:</strong> {selectedRecord.diaryRecord.title}</p>
                  <p><strong>日付:</strong> {new Date(selectedRecord.diaryRecord.date).toLocaleDateString()}</p>
                  <p><strong>気分:</strong> {selectedRecord.diaryRecord.mood || '未設定'}</p>
                  <p><strong>内容:</strong> {selectedRecord.diaryRecord.content}</p>
                  <div className="record-actions">
                    <button
                      onClick={() => setEditingDiary(selectedRecord.diaryRecord)}
                      className="edit-button"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteDiary(selectedRecord.diaryRecord.id)}
                      className="delete-button"
                    >
                      削除
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 収入・支出記録フォーム */}
          {showIncomeExpenseForm && (
            <div className="income-expense-form">
              <h3>{editingIncomeExpenseRecord ? '収入・支出記録を編集' : '新しい収入・支出記録'}</h3>
              <form onSubmit={editingIncomeExpenseRecord ? handleUpdateIncomeExpenseRecord : handleCreateIncomeExpenseRecord}>
                <div className="form-group">
                  <label>タイプ</label>
                  <select
                    value={incomeExpenseType}
                    onChange={(e) => setIncomeExpenseType(e.target.value as "income" | "expense")}
                    required
                  >
                    <option value="income">収入</option>
                    <option value="expense">支出</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>金額</label>
                  <input
                    type="number"
                    value={incomeExpenseAmount}
                    onChange={(e) => setIncomeExpenseAmount(e.target.value)}
                    placeholder="金額を入力"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={incomeExpenseDate}
                    onChange={(e) => setIncomeExpenseDate(e.target.value)}
                    required
                    aria-label="収入・支出記録の日付"
                  />
                </div>
                <div className="form-group">
                  <label>メモ</label>
                  <textarea
                    value={incomeExpenseNotes}
                    onChange={(e) => setIncomeExpenseNotes(e.target.value)}
                    placeholder="メモを入力（任意）"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingIncomeExpenseRecord ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowIncomeExpenseForm(false);
                      setEditingIncomeExpenseRecord(null);
                      setIncomeExpenseAmount('');
                      setIncomeExpenseType('income');
                      setIncomeExpenseDate('');
                      setIncomeExpenseNotes('');
                    }}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 日記フォーム */}
          {showDiaryForm && (
            <div className="diary-form">
              <h3>{editingDiary ? '日記を編集' : '新しい日記'}</h3>
              <form onSubmit={editingDiary ? handleUpdateDiary : handleCreateDiary}>
                <div className="form-group">
                  <label>タイトル</label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="日記のタイトル"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    required
                    aria-label="日記の日付"
                  />
                </div>
                <div className="form-group">
                  <label>気分 (1-5)</label>
                  <select
                    value={diaryMood}
                    onChange={(e) => setDiaryMood(e.target.value)}
                    aria-label="気分を選択"
                  >
                    <option value="">選択してください</option>
                    <option value="1"><i className="bi bi-emoji-frown"></i> 1 (とても悪い)</option>
                    <option value="2"><i className="bi bi-emoji-expressionless"></i> 2 (悪い)</option>
                    <option value="3"><i className="bi bi-emoji-neutral"></i> 3 (普通)</option>
                    <option value="4"><i className="bi bi-emoji-smile"></i> 4 (良い)</option>
                    <option value="5"><i className="bi bi-emoji-laughing"></i> 5 (とても良い)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>内容</label>
                  <textarea
                    value={diaryContent}
                    onChange={(e) => setDiaryContent(e.target.value)}
                    placeholder="今日の出来事や感想を書いてください"
                    rows={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>活動</label>
                  <div className="array-input">
                    <input
                      type="text"
                      placeholder="活動を入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryActivities, e.currentTarget.value, () => {});
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('.array-input input') as HTMLInputElement;
                        if (input) {
                          addArrayItem(setDiaryActivities, input.value, () => {});
                          input.value = '';
                        }
                      }}
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-list">
                    {diaryActivities.map((activity, index) => (
                      <div key={index} className="array-item">
                        <span>{activity}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryActivities, index)}
                          className="remove-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>メモ</label>
                  <textarea
                    value={diaryNotes}
                    onChange={(e) => setDiaryNotes(e.target.value)}
                    placeholder="追加のメモ"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>次回の目標</label>
                  <textarea
                    value={Array.isArray(diaryNextGoals) ? diaryNextGoals.join('\n') : diaryNextGoals}
                    onChange={(e) => setDiaryNextGoals(e.target.value.split('\n').filter(goal => goal.trim()))}
                    placeholder="次回の目標を書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>課題</label>
                  <textarea
                    value={Array.isArray(diaryChallenges) ? diaryChallenges.join('\n') : diaryChallenges}
                    onChange={(e) => setDiaryChallenges(e.target.value.split('\n').filter(challenge => challenge.trim()))}
                    placeholder="現在の課題を書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>達成したこと</label>
                  <div className="array-input">
                    <input
                      type="text"
                      placeholder="達成したことを入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryAchievements, e.currentTarget.value, () => {});
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('.array-input input') as HTMLInputElement;
                        if (input) {
                          addArrayItem(setDiaryAchievements, input.value, () => {});
                          input.value = '';
                        }
                      }}
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-list">
                    {diaryAchievements.map((achievement, index) => (
                      <div key={index} className="array-item">
                        <span>{achievement}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryAchievements, index)}
                          className="remove-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>感謝</label>
                  <textarea
                    value={diaryGratitude}
                    onChange={(e) => setDiaryGratitude(e.target.value)}
                    placeholder="感謝していることを書いてください"
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>振り返り</label>
                  <textarea
                    value={diaryReflection}
                    onChange={(e) => setDiaryReflection(e.target.value)}
                    placeholder="今日の振り返りを書いてください"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingDiary ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDiaryForm(false);
                      setEditingDiary(null);
                      setDiaryTitle('');
                      setDiaryDate('');
                      setDiaryContent('');
                      setDiaryMood('');
                      setDiaryActivities([]);
                      setDiaryNotes('');
                      setDiaryNextGoals([]);
                      setDiaryChallenges([]);
                      setDiaryAchievements([]);
                      setDiaryGratitude('');
                      setDiaryReflection('');
                    }}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 月次メモ */}
          <div className="monthly-memo">
            <h3><i className="bi bi-journal-text"></i> 月次メモ</h3>
            {editingMonthlyMemo ? (
              <div className="memo-edit">
                <textarea
                  value={monthlyMemo}
                  onChange={(e) => setMonthlyMemo(e.target.value)}
                  placeholder="今月の振り返りや来月の目標を書いてください"
                  rows={4}
                />
                <div className="memo-actions">
                  <button onClick={saveMonthlyMemo} className="save-button">
                    保存
                  </button>
                  <button onClick={cancelEditingMonthlyMemo} className="cancel-button">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="memo-display">
                <p>{monthlyMemo || '月次メモがありません'}</p>
                <button onClick={startEditingMonthlyMemo} className="edit-button">
                  編集
                </button>
              </div>
            )}
          </div>

          {/* アクションボタン */}
          <div className="action-buttons">
            <button
              onClick={() => {
                setShowIncomeExpenseForm(true);
                setShowDiaryForm(false);
                setEditingIncomeExpenseRecord(null);
                setIncomeExpenseAmount('');
                setIncomeExpenseDate('');
                setIncomeExpenseNotes('');
              }}
              className="action-button income-expense-button"
            >
              💰 収支記録を追加
            </button>
            <button
              onClick={openDiaryForm}
              className="action-button diary-button"
            >
              <i className="bi bi-journal-plus"></i> 日記を追加
            </button>
            <button
              onClick={() => {
                loadSalaryRecords();
                loadWorkDiaries();
              }}
              className="action-button refresh-button"
            >
              <i className="bi bi-arrow-clockwise"></i> 更新
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkRecordsComponent;
