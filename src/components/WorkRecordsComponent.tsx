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
  loadIncomeExpenseRecords: () => Promise<void>;
  loadWorkDiaries: () => Promise<void>;
  handleCreateIncomeExpenseRecord: (e: React.FormEvent) => Promise<void>;
  handleUpdateIncomeExpenseRecord: (e: React.FormEvent) => Promise<void>;
  handleCreateDiary: (e: React.FormEvent) => Promise<void>;
  handleUpdateDiary: (e: React.FormEvent) => Promise<void>;
  handleDeleteIncomeExpenseRecord: (id: string) => Promise<void>;
  handleDeleteDiary: (id: string) => Promise<void>;
  editDiary: (diary: any) => void;
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
  user
}) => {
  // ローカル状態
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [editingWeeklyMemo, setEditingWeeklyMemo] = useState(false);
  const [weeklyMemo, setWeeklyMemo] = useState('');

  // 収入・支出記録読み込み関数をWorkRecordsComponent内で定義
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
    
    const totalIncome = weeklyIncomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalExpense = weeklyExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const averageMood = weeklyDiaries.length > 0 
      ? weeklyDiaries.reduce((sum, diary) => sum + parseInt(diary.mood || '3'), 0) / weeklyDiaries.length 
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
    const monthlyIncomeRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && 
             recordDate.getMonth() === month && 
             record.type === 'income';
    });
    
    const monthlyExpenseRecords = (incomeExpenseRecords || []).filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && 
             recordDate.getMonth() === month && 
             record.type === 'expense';
    });
    
    const monthlyDiaries = (workDiaries || []).filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === year && diaryDate.getMonth() === month;
    });
    
    const totalIncome = monthlyIncomeRecords.reduce((sum, record) => sum + record.amount, 0);
    const totalExpense = monthlyExpenseRecords.reduce((sum, record) => sum + record.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const averageMood = monthlyDiaries.length > 0 
      ? monthlyDiaries.reduce((sum, diary) => sum + parseInt(diary.mood || '3'), 0) / monthlyDiaries.length 
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

      {/* 日記フォーム - 最上部に表示（編集時は常に表示） */}
      {showDiaryForm && (
        <div className="diary-form">
          <h3><i className="bi bi-journal-text"></i>{editingDiary ? '日記を編集' : '新しい日記'}</h3>
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
                  setDiaryContent('');
                  setDiaryMood('');
                  setDiaryDate('');
                  setDiaryNotes('');
                  setDiaryIsPrivate(true);
                  setDiaryWorkSummary('');
                  setDiaryAchievements([]);
                  setDiaryChallenges([]);
                  setDiaryLearnings([]);
                  setDiaryNextGoals([]);
                  setDiaryEnergyLevel(5);
                  setDiaryStressLevel(5);
                  setDiaryWorkHours(0);
                  setDiaryBreakTime(0);
                  setDiaryProductivity(5);
                  setDiaryNotes('');
                  setDiaryGratitude('');
                  setDiaryReflection('');
                  setNewAchievement('');
                  setNewChallenge('');
                  setNewLearning('');
                  setNewNextGoal('');
                }}
                className="cancel-button"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

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
          viewMode={calendarViewMode}
          onWeekChange={setCurrentWeekStart}
          currentWeekStart={currentWeekStart}
          selectedRecord={selectedRecord}
          selectedRecordType={selectedRecordType}
          onRecordClick={handleRecordClick}
          onEditIncomeExpenseRecord={editIncomeExpenseRecord}
          onEditDiary={editDiary}
          onDeleteIncomeExpenseRecord={handleDeleteIncomeExpenseRecord}
          onDeleteDiary={handleDeleteDiary}
          onRefresh={loadIncomeExpenseRecordsLocal}
          incomeExpenseRecords={incomeExpenseRecords}
          workDiaries={workDiaries}
          monthlyMemo={monthlyMemo}
          onMonthlyMemoChange={setMonthlyMemo}
          editingMonthlyMemo={editingMonthlyMemo}
          onStartEditingMonthlyMemo={() => setEditingMonthlyMemo(true)}
          onSaveWeeklyMemo={saveMonthlyMemo}
          onCancelEditingWeeklyMemo={() => setEditingMonthlyMemo(false)}
        />
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