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
  diaryWorkSummary: string;
  setDiaryWorkSummary: (summary: string) => void;
  diaryLearnings: string[];
  setDiaryLearnings: React.Dispatch<React.SetStateAction<string[]>>;
  diaryEnergyLevel: number;
  setDiaryEnergyLevel: (level: number) => void;
  diaryStressLevel: number;
  setDiaryStressLevel: (level: number) => void;
  diaryWorkHours: number;
  setDiaryWorkHours: (hours: number) => void;
  diaryBreakTime: number;
  setDiaryBreakTime: (time: number) => void;
  diaryProductivity: number;
  setDiaryProductivity: (productivity: number) => void;
  diaryTags: string[];
  setDiaryTags: React.Dispatch<React.SetStateAction<string[]>>;
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
  diaryWorkSummary,
  setDiaryWorkSummary,
  diaryLearnings,
  setDiaryLearnings,
  diaryEnergyLevel,
  setDiaryEnergyLevel,
  diaryStressLevel,
  setDiaryStressLevel,
  diaryWorkHours,
  setDiaryWorkHours,
  diaryBreakTime,
  setDiaryBreakTime,
  diaryProductivity,
  setDiaryProductivity,
  diaryTags,
  setDiaryTags,
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
      setter(prev => {
        const newArray = [...prev, value.trim()];
        console.log('活動を追加:', newArray);
        return newArray;
      });
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

  // 週の範囲を取得する関数
  const getWeekRange = (weekStart: Date) => {
    const startOfWeek = new Date(weekStart);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // 日曜日を週の開始とする
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // 土曜日を週の終了とする
    
    return {
      startOfWeek,
      endOfWeek
    };
  };

  // 収入・支出記録の編集関数
  const editIncomeExpenseRecord = (record: any) => {
    setEditingIncomeExpenseRecord(record);
    setIncomeExpenseAmount(record.amount.toString());
    setIncomeExpenseDate(record.date);
    setSelectedRecordType(record.type);
    setShowIncomeExpenseForm(true);
  };

  // 日記モーダルの状態管理
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  // 収入・支出モーダルの状態管理
  const [showIncomeExpenseModal, setShowIncomeExpenseModal] = useState(false);

  // 配列入力用のローカル状態
  const [diaryActivitiesInput, setDiaryActivitiesInput] = useState('');
  const [diaryLearningsInput, setDiaryLearningsInput] = useState('');
  const [diaryTagsInput, setDiaryTagsInput] = useState('');

  // 日記モーダルを開く関数
  const openDiaryModal = (diary?: any) => {
    // 配列入力フィールドをリセット
    setDiaryActivitiesInput('');
    setDiaryLearningsInput('');
    setDiaryTagsInput('');
    
    if (diary) {
      editDiary(diary);
    } else {
      // 新規作成の場合、選択された日付または今日の日付を設定
      const dateToUse = selectedDate || new Date();
      // UTC変換を避けてローカル時間で日付文字列を作成
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const day = String(dateToUse.getDate()).padStart(2, '0');
      setDiaryDate(`${year}-${month}-${day}`);
      setDiaryTitle('');
      setDiaryContent('');
      setDiaryMood('');
      setDiaryActivities([]);
      setDiaryNotes('');
      setDiaryNextGoals([]);
      setDiaryChallenges([]);
      setDiaryAchievements([]);
      setDiaryGratitude('');
      setDiaryReflection('');
      setDiaryWorkSummary('');
      setDiaryLearnings([]);
      setDiaryEnergyLevel(5);
      setDiaryStressLevel(5);
      setDiaryWorkHours(0);
      setDiaryBreakTime(0);
      setDiaryProductivity(5);
      setDiaryTags([]);
      setEditingDiary(null);
    }
    setShowDiaryModal(true);
  };

  // 日記モーダルを閉じる関数
  const closeDiaryModal = () => {
    setShowDiaryModal(false);
    setEditingDiary(null);
  };

  // 収入・支出モーダルを開く関数
  const openIncomeExpenseModal = (record?: any) => {
    if (record) {
      editIncomeExpenseRecord(record);
    } else {
      // 新規作成の場合、選択された日付または今日の日付を設定
      const dateToUse = selectedDate || new Date();
      // UTC変換を避けてローカル時間で日付文字列を作成
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const day = String(dateToUse.getDate()).padStart(2, '0');
      setIncomeExpenseDate(`${year}-${month}-${day}`);
      setIncomeExpenseAmount('');
      setIncomeExpenseType('income');
      setIncomeExpenseNotes('');
      setEditingIncomeExpenseRecord(null);
    }
    setShowIncomeExpenseModal(true);
  };

  // 収入・支出モーダルを閉じる関数
  const closeIncomeExpenseModal = () => {
    setShowIncomeExpenseModal(false);
    setEditingIncomeExpenseRecord(null);
  };


  // 初期化時に今日の日付を選択
  useEffect(() => {
    if (showWorkRecords && !selectedDate) {
      const today = new Date();
      setSelectedDate(today);
    }
  }, [showWorkRecords, selectedDate, setSelectedDate]);

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


      {/* 日記モーダル */}
      {showDiaryModal && (
        <div className="modal-overlay" onClick={closeDiaryModal}>
          <div className="modal-content diary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-journal-text"></i>{editingDiary ? '日記を編集' : '新しい日記'}</h3>
              <button className="modal-close" onClick={closeDiaryModal} aria-label="モーダルを閉じる">
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                console.log('フォーム送信時の活動データ:', diaryActivities);
                if (editingDiary) {
                  handleUpdateDiary(e);
                } else {
                  handleCreateDiary(e);
                }
              }}>
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

                {/* 詳細項目 */}
                <div className="form-group">
                  <label>活動</label>
                  <div className="array-input-group">
                    <input
                      type="text"
                      value={diaryActivitiesInput}
                      onChange={(e) => setDiaryActivitiesInput(e.target.value)}
                      placeholder="活動を入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryActivities, diaryActivitiesInput, setDiaryActivitiesInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem(setDiaryActivities, diaryActivitiesInput, setDiaryActivitiesInput)}
                      className="add-item-button"
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-items">
                    {(diaryActivities || []).map((activity, index) => (
                      <div key={index} className="array-item">
                        <span>{activity}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryActivities, index)}
                          className="remove-item-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>学習内容</label>
                  <div className="array-input-group">
                    <input
                      type="text"
                      value={diaryLearningsInput}
                      onChange={(e) => setDiaryLearningsInput(e.target.value)}
                      placeholder="学習内容を入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryLearnings, diaryLearningsInput, setDiaryLearningsInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem(setDiaryLearnings, diaryLearningsInput, setDiaryLearningsInput)}
                      className="add-item-button"
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-items">
                    {(diaryLearnings || []).map((learning, index) => (
                      <div key={index} className="array-item">
                        <span>{learning}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryLearnings, index)}
                          className="remove-item-button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>エネルギー・ストレスレベル</label>
                  <div className="level-inputs">
                    <div className="level-input">
                      <label>エネルギー: {diaryEnergyLevel}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={diaryEnergyLevel}
                        onChange={(e) => setDiaryEnergyLevel(parseInt(e.target.value))}
                        aria-label="エネルギーレベル"
                      />
                    </div>
                    <div className="level-input">
                      <label>ストレス: {diaryStressLevel}</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={diaryStressLevel}
                        onChange={(e) => setDiaryStressLevel(parseInt(e.target.value))}
                        aria-label="ストレスレベル"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>作業時間・休憩時間</label>
                  <div className="time-inputs">
                    <div className="time-input">
                      <label>作業時間 (時間)</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={diaryWorkHours}
                        onChange={(e) => setDiaryWorkHours(parseFloat(e.target.value) || 0)}
                        aria-label="作業時間"
                      />
                    </div>
                    <div className="time-input">
                      <label>休憩時間 (分)</label>
                      <input
                        type="number"
                        min="0"
                        max="480"
                        step="15"
                        value={diaryBreakTime}
                        onChange={(e) => setDiaryBreakTime(parseInt(e.target.value) || 0)}
                        aria-label="休憩時間"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>生産性</label>
                  <div className="level-input">
                    <label>生産性: {diaryProductivity}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={diaryProductivity}
                      onChange={(e) => setDiaryProductivity(parseInt(e.target.value))}
                      aria-label="生産性レベル"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>タグ</label>
                  <div className="array-input-group">
                    <input
                      type="text"
                      value={diaryTagsInput}
                      onChange={(e) => setDiaryTagsInput(e.target.value)}
                      placeholder="タグを入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(setDiaryTags, diaryTagsInput, setDiaryTagsInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addArrayItem(setDiaryTags, diaryTagsInput, setDiaryTagsInput)}
                      className="add-item-button"
                    >
                      追加
                    </button>
                  </div>
                  <div className="array-items">
                    {(diaryTags || []).map((tag, index) => (
                      <div key={index} className="array-item">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(setDiaryTags, index)}
                          className="remove-item-button"
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
                    placeholder="その他のメモや備考"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingDiary ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={closeDiaryModal}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 収入・支出モーダル */}
      {showIncomeExpenseModal && (
        <div className="modal-overlay" onClick={closeIncomeExpenseModal}>
          <div className="modal-content income-expense-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-cash-coin"></i>
                {editingIncomeExpenseRecord ? '収支記録を編集' : '新しい収支記録'}
              </h3>
              <button className="modal-close" onClick={closeIncomeExpenseModal} aria-label="モーダルを閉じる">
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                if (editingIncomeExpenseRecord) {
                  handleUpdateIncomeExpenseRecord(e);
                } else {
                  handleCreateIncomeExpenseRecord(e);
                }
              }}>
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={incomeExpenseDate}
                    onChange={(e) => setIncomeExpenseDate(e.target.value)}
                    required
                    aria-label="収支記録の日付"
                  />
                </div>
                <div className="form-group">
                  <label>種類</label>
                  <select
                    value={incomeExpenseType}
                    onChange={(e) => setIncomeExpenseType(e.target.value as "income" | "expense")}
                    aria-label="収入または支出を選択"
                  >
                    <option value="income">💰 収入</option>
                    <option value="expense">💸 支出</option>
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
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>メモ（任意）</label>
                  <textarea
                    value={incomeExpenseNotes}
                    onChange={(e) => setIncomeExpenseNotes(e.target.value)}
                    placeholder="詳細や備考を入力"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-button">
                    {editingIncomeExpenseRecord ? '更新' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={closeIncomeExpenseModal}
                    className="cancel-button"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
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
          onWeekChange={setCurrentWeekStart}
          selectedRecord={selectedRecord}
          selectedRecordType={selectedRecordType}
          onEditIncomeExpense={openIncomeExpenseModal}
          onEditDiary={openDiaryModal}
          onDeleteIncomeExpense={handleDeleteIncomeExpenseRecord}
          onDeleteDiary={handleDeleteDiary}
          onAddIncomeExpense={() => openIncomeExpenseModal()}
          onAddDiary={() => openDiaryModal()}
          onRefresh={loadIncomeExpenseRecordsLocal}
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