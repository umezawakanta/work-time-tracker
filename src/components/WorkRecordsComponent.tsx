import React, { useState, useEffect } from 'react';
import './WorkRecordsComponent.css';
import type { IncomeExpenseRecord, WorkDiary, User } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';
import CalendarComponent from './CalendarComponent';

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
  editDiary: (diary: WorkDiary) => void;
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
  editDiary,
  openDiaryForm,
  loadMonthlyMemo,
  saveMonthlyMemo,
  startEditingMonthlyMemo,
  cancelEditingMonthlyMemo,
  closeOtherFeatures,
}) => {
  // 収支記録のローディング状態をWorkRecordsComponent内で管理
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);

  // 日記のローディング状態をWorkRecordsComponent内で管理
  const [diaryLoading, setDiaryLoading] = useState(false);

  // カレンダーモーダルの状態管理（デフォルトで拡大表示）
  const [showCalendarModal, setShowCalendarModal] = useState(true);

  // 収支記録読み込み関数をWorkRecordsComponent内で定義
  const loadIncomeExpenseRecordsLocal = async () => {
    setIncomeExpenseLoading(true);
    try {
      await loadIncomeExpenseRecords();
    } finally {
      setIncomeExpenseLoading(false);
    }
  };

  // 日記読み込み関数をWorkRecordsComponent内で定義
  const loadWorkDiariesLocal = async () => {
    setDiaryLoading(true);
    try {
      await loadWorkDiaries();
    } finally {
      setDiaryLoading(false);
    }
  };

  // 削除確認モーダルの状態
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);

  // データが更新されたときに選択された記録も更新
  useEffect(() => {
    if (selectedDate) {
      const records = getRecordsForDate(selectedDate);
      if (records.incomeRecords.length > 0 || records.expenseRecords.length > 0 || records.workDiaries.length > 0) {
        setSelectedRecord(records);
        // 複数の記録がある場合は、日記を優先表示
        if (records.workDiaries.length > 0) {
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
    }
  }, [selectedDate, incomeExpenseRecords.length, workDiaries.length]);

  // カレンダー用の月移動ハンドラー
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // 指定された日付の記録を取得
  const getRecordsForDate = (date: Date) => {
    // 選択された日付をUTCの開始時刻に設定
    const selectedDateUTC = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selectedDateUTCStr = selectedDateUTC.toISOString().split("T")[0];
    
    
    const incomeRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      const recordDateStr = recordDate.toISOString().split("T")[0];
      return recordDateStr === selectedDateUTCStr && record.type === 'income';
    });
    const expenseRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      const recordDateStr = recordDate.toISOString().split("T")[0];
      return recordDateStr === selectedDateUTCStr && record.type === 'expense';
    });
    const diaryRecords = (workDiaries || []).filter(diary => {
      const diaryDate = new Date(diary.date);
      const diaryDateStr = diaryDate.toISOString().split("T")[0];
      const matches = diaryDateStr === selectedDateUTCStr;
      return matches;
    });
    
    return { incomeRecords, expenseRecords, workDiaries: diaryRecords };
  };

  // 月の統計を計算
  const getMonthlySummary = (year: number, month: number) => {
    if (!currentMonth) {
      return { totalIncome: 0, totalExpense: 0, netBalance: 0, averageMood: 0, incomeRecordsCount: 0, expenseRecordsCount: 0, diariesCount: 0 };
    }
    
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
    
    const totalIncome = monthlyIncomeRecords.length > 0 ? monthlyIncomeRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) : 0;
    const totalExpense = monthlyExpenseRecords.length > 0 ? monthlyExpenseRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) : 0;
    const netBalance = totalIncome - totalExpense;
    const averageMood = monthlyDiaries.length > 0 
      ? monthlyDiaries.reduce((sum: number, diary) => sum + (Number(diary.mood) || 0), 0) / monthlyDiaries.length 
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
    if (records.incomeRecords.length > 0 || records.expenseRecords.length > 0 || records.workDiaries.length > 0) {
      setSelectedRecord(records);
      // 複数の記録がある場合は、日記を優先表示
      if (records.workDiaries.length > 0) {
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
    } else if (type === "diary" && records.workDiaries.length > 0) {
      setSelectedRecord(records);
      setSelectedRecordType("diary");
    }
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

  // 削除確認モーダルのハンドラー
  const handleDeleteClick = (id: string, name: string, type: string) => {
    setDeleteTarget({ id, name, type });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      handleDeleteIncomeExpenseRecord(deleteTarget.id);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
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
                  loadIncomeExpenseRecordsLocal();
                }
                if (workDiaries.length === 0) {
                  loadWorkDiariesLocal();
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

          {/* カレンダー（常に拡大表示） */}
          <CalendarComponent
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            getRecordsForDate={getRecordsForDate}
            isModal={true}
            onClose={() => setShowCalendarModal(false)}
          />

          {/* 選択された記録の詳細 */}
          {selectedRecord && (
            <div className="record-details">
              <h3>
                <i className="bi bi-calendar-check"></i>
                {selectedDate ? (
                  <>
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                    <span className="day-of-week">
                      ({['日', '月', '火', '水', '木', '金', '土'][selectedDate.getDay()]})
                    </span>
                  </>
                ) : '選択された日付'}の記録
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
                      {record.notes && record.notes.trim() && (
                        <p className="record-notes">{record.notes}</p>
                      )}
                      <div className="record-actions">
                        <button
                          onClick={() => {
                            setEditingIncomeExpenseRecord(record);
                            // 編集フォームを表示するための追加処理
                            setIncomeExpenseType(record.type === 'income' ? 'income' : 'expense');
                            setIncomeExpenseAmount(Math.abs(record.amount).toString());
                            setIncomeExpenseDate(record.date.split('T')[0]);
                            setIncomeExpenseNotes(record.notes || '');
                            setShowIncomeExpenseForm(true);
                            setShowDiaryForm(false);
                          }}
                          className="edit-button"
                        >
                          <i className="bi bi-pencil"></i> 編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record._id, `収入記録 (¥${(record.amount || 0).toLocaleString()})`, '収入記録')}
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
                      {record.notes && record.notes.trim() && (
                        <p className="record-notes">{record.notes}</p>
                      )}
                      <div className="record-actions">
                        <button
                          onClick={() => {
                            setEditingIncomeExpenseRecord(record);
                            // 編集フォームを表示するための追加処理
                            setIncomeExpenseType(record.type === 'income' ? 'income' : 'expense');
                            setIncomeExpenseAmount(Math.abs(record.amount).toString());
                            setIncomeExpenseDate(record.date.split('T')[0]);
                            setIncomeExpenseNotes(record.notes || '');
                            setShowIncomeExpenseForm(true);
                            setShowDiaryForm(false);
                          }}
                          className="edit-button"
                        >
                          <i className="bi bi-pencil"></i> 編集
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record._id, `支出記録 (¥${(record.amount || 0).toLocaleString()})`, '支出記録')}
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
                  {selectedRecord.workDiaries.map((diary: WorkDiary, index: number) => (
                    <div key={diary._id || index} className="diary-record-detail">
                      <h5>
                        日記: {diary.title}
                        <span className="diary-mood">
                          {diary.mood && (
                            <i className={`bi bi-emoji-${diary.mood === '1' ? 'frown' : 
                              diary.mood === '2' ? 'meh' : 
                              diary.mood === '3' ? 'neutral' : 
                              diary.mood === '4' ? 'smile' : 'laughing'}`}></i>
                          )}
                        </span>
                      </h5>
                      <p><strong>タイトル:</strong> {diary.title}</p>
                      <p><strong>日付:</strong> {new Date(diary.date).toLocaleDateString()}</p>
                      <p><strong>気分:</strong> {diary.mood || '未設定'}</p>
                      <p><strong>内容:</strong> {diary.content}</p>
                      <div className="record-actions">
                        <button
                          onClick={() => editDiary(diary)}
                          className="edit-button"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteDiary(diary._id)}
                          className="delete-button"
                        >
                          削除
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
                    aria-label="収入・支出のタイプを選択"
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
                setIncomeExpenseType('income'); // デフォルト値を設定
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
                loadIncomeExpenseRecordsLocal();
                loadWorkDiariesLocal();
              }}
              className="action-button refresh-button"
            >
              <i className="bi bi-arrow-clockwise"></i> 更新
            </button>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="収支記録の削除"
        message="この収支記録を削除してもよろしいですか？削除した記録は復元できません。"
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.type || ''}
      />
    </div>
  );
};

export default WorkRecordsComponent;
