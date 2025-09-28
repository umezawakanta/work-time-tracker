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


  // 統計表示のアコーディオン状態管理
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // 月次メモのアコーディオン状態管理
  const [isMemoExpanded, setIsMemoExpanded] = useState(false);

  // 週次メモの状態管理
  const [weeklyMemo, setWeeklyMemo] = useState<string>('');
  const [editingWeeklyMemo, setEditingWeeklyMemo] = useState(false);

  // カレンダーの表示モード状態（CalendarComponentから取得）
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  // 週の開始日と終了日を計算
  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { startOfWeek, endOfWeek };
  };

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
    // ローカル時間で日付を比較（UTC変換を避ける）
    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();
    const selectedDay = date.getDate();
    
    const incomeRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === selectedYear &&
             recordDate.getMonth() === selectedMonth &&
             recordDate.getDate() === selectedDay &&
             record.type === 'income';
    });
    
    const expenseRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === selectedYear &&
             recordDate.getMonth() === selectedMonth &&
             recordDate.getDate() === selectedDay &&
             record.type === 'expense';
    });
    
    const diaryRecords = (workDiaries || []).filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === selectedYear &&
             diaryDate.getMonth() === selectedMonth &&
             diaryDate.getDate() === selectedDay;
    });
    
    return { incomeRecords, expenseRecords, workDiaries: diaryRecords };
  };

  // 週の統計を計算
  const getWeeklySummary = (startDate: Date, endDate: Date) => {
    const weeklyIncomeRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate && record.type === 'income';
    });
    
    const weeklyExpenseRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate && record.type === 'expense';
    });
    
    const weeklyDiaries = (workDiaries || []).filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate >= startDate && diaryDate <= endDate;
    });
    
    const totalIncome = weeklyIncomeRecords.length > 0 ? weeklyIncomeRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) : 0;
    const totalExpense = weeklyExpenseRecords.length > 0 ? weeklyExpenseRecords.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) : 0;
    const netBalance = totalIncome - totalExpense;
    const averageMood = weeklyDiaries.length > 0 
      ? weeklyDiaries.reduce((sum: number, diary) => sum + (Number(diary.mood) || 0), 0) / weeklyDiaries.length 
      : 0;
    
    return {
      totalIncome,
      totalExpense,
      netBalance,
      averageMood,
      incomeRecordsCount: weeklyIncomeRecords.length,
      expenseRecordsCount: weeklyExpenseRecords.length,
      diariesCount: weeklyDiaries.length,
    };
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
    // ローカル時間で日付を正しく保存（UTC変換を避ける）
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(localDate);
    const records = getRecordsForDate(localDate);
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
    // ローカル時間で日付を正しく保存（UTC変換を避ける）
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(localDate);
    const records = getRecordsForDate(localDate);
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

  // 週次メモの保存・編集関数
  const saveWeeklyMemo = () => {
    // TODO: API呼び出しで週次メモを保存
    console.log('週次メモを保存:', weeklyMemo);
    setEditingWeeklyMemo(false);
  };

  const startEditingWeeklyMemo = () => {
    setEditingWeeklyMemo(true);
  };

  const cancelEditingWeeklyMemo = () => {
    setEditingWeeklyMemo(false);
  };

  // 統計データの計算
  const monthlySummary = currentMonth ? getMonthlySummary(currentMonth.getFullYear(), currentMonth.getMonth()) : { totalIncome: 0, totalExpense: 0, netBalance: 0, averageMood: 0, incomeRecordsCount: 0, expenseRecordsCount: 0, diariesCount: 0 };
  
  const weekRange = getWeekRange(currentWeekStart);
  const weeklySummary = getWeeklySummary(weekRange.startOfWeek, weekRange.endOfWeek);

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

      {/* カレンダー（常に拡大表示） - work-records-section直下 */}
      {showWorkRecords && (
        <CalendarComponent
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          getRecordsForDate={getRecordsForDate}
          isModal={true}
          onClose={() => setShowCalendarModal(false)}
          onViewModeChange={setCalendarViewMode}
          onWeekChange={setCurrentWeekStart}
          onAddIncomeExpense={() => {
            setShowIncomeExpenseForm(true);
            setShowDiaryForm(false);
            setEditingIncomeExpenseRecord(null);
            setIncomeExpenseType('income');
            setIncomeExpenseAmount('');
            setIncomeExpenseDate(selectedDate ? 
              `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '');
            setIncomeExpenseNotes('');
          }}
          onAddDiary={() => {
            setShowDiaryForm(true);
            setShowIncomeExpenseForm(false);
            setEditingDiary(null);
            setDiaryTitle('');
            setDiaryDate(selectedDate ? 
              `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '');
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
          selectedRecord={selectedRecord}
          selectedRecordType={selectedRecordType}
          onEditIncomeExpense={(record) => {
            setEditingIncomeExpenseRecord(record);
            setIncomeExpenseType(record.type === 'income' ? 'income' : 'expense');
            setIncomeExpenseAmount(Math.abs(record.amount).toString());
            setIncomeExpenseDate(record.date.split('T')[0]);
            setIncomeExpenseNotes(record.notes || '');
            setShowIncomeExpenseForm(true);
            setShowDiaryForm(false);
          }}
          onEditDiary={(diary) => {
            setEditingDiary(diary);
            setDiaryTitle(diary.title || '');
            setDiaryDate(diary.date.split('T')[0]);
            setDiaryContent(diary.content || '');
            setDiaryMood(diary.mood || '');
            setDiaryActivities(diary.activities || []);
            setDiaryNotes(diary.notes || '');
            setDiaryNextGoals(diary.nextGoals || []);
            setDiaryChallenges(diary.challenges || []);
            setDiaryAchievements(diary.achievements || []);
            setDiaryGratitude(diary.gratitude || '');
            setDiaryReflection(diary.reflection || '');
            setShowDiaryForm(true);
            setShowIncomeExpenseForm(false);
          }}
          onDeleteIncomeExpense={handleDeleteIncomeExpenseRecord}
          onDeleteDiary={handleDeleteDiary}
          monthlySummary={monthlySummary}
          weeklySummary={weeklySummary}
          calendarViewMode={calendarViewMode}
          isSummaryExpanded={isSummaryExpanded}
          onToggleSummary={() => setIsSummaryExpanded(!isSummaryExpanded)}
          monthlyMemo={monthlyMemo}
          weeklyMemo={weeklyMemo}
          editingMonthlyMemo={editingMonthlyMemo}
          editingWeeklyMemo={editingWeeklyMemo}
          isMemoExpanded={isMemoExpanded}
          onToggleMemo={() => setIsMemoExpanded(!isMemoExpanded)}
          onStartEditingMonthlyMemo={startEditingMonthlyMemo}
          onCancelEditingMonthlyMemo={cancelEditingMonthlyMemo}
          onSaveMonthlyMemo={saveMonthlyMemo}
          onStartEditingWeeklyMemo={startEditingWeeklyMemo}
          onCancelEditingWeeklyMemo={cancelEditingWeeklyMemo}
          onSaveWeeklyMemo={saveWeeklyMemo}
          onMonthlyMemoChange={setMonthlyMemo}
          onWeeklyMemoChange={setWeeklyMemo}
          onRefresh={() => {
            loadIncomeExpenseRecordsLocal();
            loadWorkDiariesLocal();
          }}
        />
      )}

      {/* 収入・支出記録フォーム */}
      {showWorkRecords && showIncomeExpenseForm && (
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

      {/* 日記フォーム - 最上部に表示 */}
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
                    <option value="1">😞 1 (とても悪い)</option>
                    <option value="2">😐 2 (悪い)</option>
                    <option value="3">😑 3 (普通)</option>
                    <option value="4">😊 4 (良い)</option>
                    <option value="5">😄 5 (とても良い)</option>
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
