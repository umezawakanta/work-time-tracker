import React, { useState, useEffect } from 'react';
import './WorkRecordsComponent.css';
import type { IncomeExpenseRecord, WorkDiary, User, Budget, FinancialGoal } from '../types';
import DeleteConfirmModal from './DeleteConfirmModal';
import CalendarComponent from './CalendarComponent';
import ActionHistoryComponent from './ActionHistoryComponent';
import FuturePlanningComponent from './FuturePlanningComponent';
import DataAnalysisComponent from './DataAnalysisComponent';
import ComprehensiveDashboard from './ComprehensiveDashboard';
import { logger } from '../utils/logger';
import { apiFetch } from '../utils/apiClient';
import { createAuthHeaders } from '../utils/authUtils';
import { incomeExpenseRewardManager } from '../utils/incomeExpenseRewardManager';
import { diaryRewardManager } from '../utils/diaryRewardManager';

// カテゴリの定数定義
const INCOME_CATEGORIES = [
  '給与', 'ボーナス', '副業', '投資', 'その他収入'
];

const EXPENSE_CATEGORIES = [
  '食費', '住居費', '光熱費', '交通費', '通信費', '医療費', 
  '教育費', '娯楽費', '衣類費', 'その他支出'
];

const SUBCATEGORIES: { [key: string]: string[] } = {
  '食費': ['外食', '食材', '飲み物', 'お菓子'],
  '住居費': ['家賃', '管理費', '修繕費', '保険料'],
  '光熱費': ['電気代', 'ガス代', '水道代', 'インターネット'],
  '交通費': ['電車', 'バス', 'タクシー', 'ガソリン', '駐車場'],
  '通信費': ['スマホ', '固定電話', 'インターネット'],
  '医療費': ['病院', '薬代', '健康診断', '歯科'],
  '教育費': ['書籍', '講座', '資格', '学校'],
  '娯楽費': ['映画', 'ゲーム', 'スポーツ', '旅行'],
  '衣類費': ['服', '靴', 'アクセサリー', 'クリーニング'],
  'その他支出': ['雑費', '寄付', 'プレゼント', 'その他']
};

interface WorkRecordsComponentProps {
  showWorkRecords: boolean;
  setShowWorkRecords: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  user: User | null;
}

const WorkRecordsComponent: React.FC<WorkRecordsComponentProps> = ({
  showWorkRecords,
  setShowWorkRecords,
  closeOtherFeatures,
  user
}) => {
  // 内部状態管理
  const [incomeExpenseRecords, setIncomeExpenseRecords] = useState<IncomeExpenseRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<"income" | "expense" | "diary" | null>(null);
  const [editingIncomeExpenseRecord, setEditingIncomeExpenseRecord] = useState<IncomeExpenseRecord | null>(null);
  const [editingDiary, setEditingDiary] = useState<WorkDiary | null>(null);
  const [showIncomeExpenseForm, setShowIncomeExpenseForm] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showComprehensiveDashboard, setShowComprehensiveDashboard] = useState(false);

  // 収入・支出記録フォームの状態
  const [incomeExpenseDate, setIncomeExpenseDate] = useState("");
  const [incomeExpenseAmount, setIncomeExpenseAmount] = useState("");
  const [incomeExpenseType, setIncomeExpenseType] = useState<"income" | "expense">("income");
  const [incomeExpenseNotes, setIncomeExpenseNotes] = useState("");
  const [incomeExpenseCategory, setIncomeExpenseCategory] = useState("");
  const [incomeExpenseSubcategory, setIncomeExpenseSubcategory] = useState("");
  const [incomeExpenseTags, setIncomeExpenseTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // 予算管理の状態
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // 財務目標の状態
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // 分析・レポートの状態
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState<"week" | "month" | "year">("month");

  // 行動記録の状態
  const [showActionHistory, setShowActionHistory] = useState(false);

  // 未来計画の状態
  const [showFuturePlanning, setShowFuturePlanning] = useState(false);

  // データ分析の状態
  const [showDataAnalysis, setShowDataAnalysis] = useState(false);

  // 日記フォームの状態
  const [diaryDate, setDiaryDate] = useState("");
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryMood, setDiaryMood] = useState("3");
  const [diaryActivities, setDiaryActivities] = useState<string[]>([]);
  const [diaryNotes, setDiaryNotes] = useState("");
  const [diaryNextGoals, setDiaryNextGoals] = useState<string[]>([]);
  const [diaryChallenges, setDiaryChallenges] = useState<string[]>([]);
  const [diaryAchievements, setDiaryAchievements] = useState<string[]>([]);
  const [diaryGratitude, setDiaryGratitude] = useState("");
  const [diaryReflection, setDiaryReflection] = useState("");
  const [diaryWorkSummary, setDiaryWorkSummary] = useState("");
  const [diaryLearnings, setDiaryLearnings] = useState<string[]>([]);
  const [diaryEnergyLevel, setDiaryEnergyLevel] = useState(3);
  const [diaryStressLevel, setDiaryStressLevel] = useState(3);
  const [diaryWorkHours, setDiaryWorkHours] = useState(0);
  const [diaryBreakTime, setDiaryBreakTime] = useState(0);
  const [diaryProductivity, setDiaryProductivity] = useState(3);
  const [diaryTags, setDiaryTags] = useState<string[]>([]);
  const [monthlyMemo, setMonthlyMemo] = useState("");
  const [editingMonthlyMemo, setEditingMonthlyMemo] = useState(false);

  // 削除確認モーダルの状態
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [deletingRecordType, setDeletingRecordType] = useState<"income" | "expense" | "diary" | null>(null);

  // コンポーネントマウント時の初期化
  useEffect(() => {
    if (showWorkRecords && user) {
      loadIncomeExpenseRecords();
      loadWorkDiaries();
      loadMonthlyMemo();
    }
  }, [showWorkRecords, user]);

  // 収入・支出記録の読み込み
  const loadIncomeExpenseRecords = async () => {
    if (!user?.id) return;

    try {
      const headers = createAuthHeaders();
      const response = await apiFetch(`/api/income-expense-records?userId=${user.id}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (data.success) {
        setIncomeExpenseRecords(data.records);
        logger.debug('収入・支出記録を読み込みました:', data.records.length, '件');
      } else {
        console.error("Failed to load income/expense records:", data.message);
      }
    } catch (error) {
      console.error("Failed to load income/expense records:", error);
    }
  };

  // 日記の読み込み
  const loadWorkDiaries = async () => {
    if (!user?.id) return;

    try {
      const headers = createAuthHeaders();
      const response = await apiFetch(`/api/work-diaries?userId=${user.id}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
        logger.debug('日記を読み込みました:', data.diaries.length, '件');
      } else {
        console.error("Failed to load work diaries:", data.message);
      }
    } catch (error) {
      console.error("Failed to load work diaries:", error);
    }
  };

  // 月次メモの読み込み
  const loadMonthlyMemo = () => {
    if (!user?.id) return;

    const memoKey = `monthlyMemo_${user.id}_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}`;
    const savedMemo = localStorage.getItem(memoKey);
    if (savedMemo) {
      setMonthlyMemo(savedMemo);
    }
  };

  // 月次メモの保存
  const saveMonthlyMemo = () => {
    if (!user?.id) return;

    const memoKey = `monthlyMemo_${user.id}_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}`;
    localStorage.setItem(memoKey, monthlyMemo);
    setEditingMonthlyMemo(false);
  };

  // 月次メモの編集開始
  const startEditingMonthlyMemo = () => {
    setEditingMonthlyMemo(true);
  };

  // 月次メモの編集キャンセル
  const cancelEditingMonthlyMemo = () => {
    setEditingMonthlyMemo(false);
    loadMonthlyMemo();
  };

  // 金額の正規化（保存用）
  const normalizeAmountForStorage = (amount: string): number => {
    const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
    return isNaN(numericAmount) ? 0 : numericAmount;
  };

  // 収入・支出記録の作成
  const handleCreateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      if (!incomeExpenseDate || !incomeExpenseAmount || !incomeExpenseType) {
        alert('すべての必須項目を入力してください');
        return;
      }

      const amount = normalizeAmountForStorage(incomeExpenseAmount);
      const requestBody = {
        userId: user.id,
        date: incomeExpenseDate,
        amount: incomeExpenseType === "expense" ? -Math.abs(amount) : Math.abs(amount),
        type: incomeExpenseType,
        notes: incomeExpenseNotes,
        category: incomeExpenseCategory || (incomeExpenseType === "income" ? "給与" : "その他支出"),
        subcategory: incomeExpenseSubcategory || "",
        tags: incomeExpenseTags,
      };

      console.log("Creating income/expense record:", requestBody);

      const headers = createAuthHeaders();
      const response = await apiFetch('/api/income-expense-records', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        console.log("Income/expense record created successfully:", data.record);

        // 報酬システムの処理
        try {
          const rewardResult = await incomeExpenseRewardManager.processIncomeExpenseReward(user.id, {
            type: incomeExpenseType,
            amount: Math.abs(amount),
            notes: incomeExpenseNotes,
            date: incomeExpenseDate
          });

          if (rewardResult.experience > 0 || rewardResult.workCoins > 0) {
            console.log(`収入・支出記録報酬付与完了: ${rewardResult.experience}XP, ${rewardResult.workCoins}ワークコイン`);
          }
        } catch (rewardError) {
          console.error("報酬処理エラー:", rewardError);
        }

        // フォームをリセット
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setIncomeExpenseCategory("");
        setIncomeExpenseSubcategory("");
        setIncomeExpenseTags([]);
        setNewTag("");
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error("Failed to create income/expense record:", data.message);
        alert(`記録の作成に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating income/expense record:", error);
      alert('記録の作成中にエラーが発生しました');
    }
  };

  // 収入・支出記録の更新
  const handleUpdateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingIncomeExpenseRecord) return;

    try {
      if (!incomeExpenseDate || !incomeExpenseAmount || !incomeExpenseType) {
        alert('すべての必須項目を入力してください');
        return;
      }

      const amount = normalizeAmountForStorage(incomeExpenseAmount);
      const requestBody = {
        id: editingIncomeExpenseRecord._id,
        date: incomeExpenseDate,
        amount: incomeExpenseType === "expense" ? -Math.abs(amount) : Math.abs(amount),
        type: incomeExpenseType,
        notes: incomeExpenseNotes,
      };

      console.log("Updating income/expense record:", requestBody);

      const headers = createAuthHeaders();
      const response = await apiFetch('/api/income-expense-records', {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        console.log("Income/expense record updated successfully:", data.record);

        // 報酬システムの処理
        try {
          const rewardResult = await incomeExpenseRewardManager.processIncomeExpenseReward(user.id, {
            type: incomeExpenseType,
            amount: Math.abs(amount),
            notes: incomeExpenseNotes,
            date: incomeExpenseDate
          }, editingIncomeExpenseRecord._id);

          if (rewardResult.experience > 0 || rewardResult.workCoins > 0) {
            console.log(`収入・支出記録更新報酬付与完了: ${rewardResult.experience}XP, ${rewardResult.workCoins}ワークコイン`);
          }
        } catch (rewardError) {
          console.error("報酬処理エラー:", rewardError);
        }

        // フォームをリセット
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setIncomeExpenseCategory("");
        setIncomeExpenseSubcategory("");
        setIncomeExpenseTags([]);
        setNewTag("");
        setEditingIncomeExpenseRecord(null);
        setShowIncomeExpenseForm(false);
        await loadIncomeExpenseRecords();
      } else {
        console.error("Failed to update income/expense record:", data.message);
        alert(`記録の更新に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating income/expense record:", error);
      alert('記録の更新中にエラーが発生しました');
    }
  };

  // 収入・支出記録の削除
  const handleDeleteIncomeExpenseRecord = async (id: string) => {
    if (!user?.id) return;

    try {
      const headers = createAuthHeaders();
      const response = await apiFetch(`/api/income-expense-records/${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      if (data.success) {
        console.log("Income/expense record deleted successfully");
        await loadIncomeExpenseRecords();
      } else {
        console.error("Failed to delete income/expense record:", data.message);
        alert(`記録の削除に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting income/expense record:", error);
      alert('記録の削除中にエラーが発生しました');
    }
  };

  // 日記の作成
  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      if (!diaryDate || !diaryTitle || !diaryContent) {
        alert('日付、タイトル、内容は必須項目です');
        return;
      }

      const requestBody = {
        userId: user.id,
        date: diaryDate,
        title: diaryTitle,
        content: diaryContent,
        mood: parseInt(diaryMood),
        activities: diaryActivities,
        notes: diaryNotes,
        nextGoals: diaryNextGoals,
        challenges: diaryChallenges,
        achievements: diaryAchievements,
        gratitude: diaryGratitude,
        reflection: diaryReflection,
        workSummary: diaryWorkSummary,
        learnings: diaryLearnings,
        energyLevel: diaryEnergyLevel,
        stressLevel: diaryStressLevel,
        workHours: diaryWorkHours,
        breakTime: diaryBreakTime,
        productivity: diaryProductivity,
        tags: diaryTags,
      };

      console.log("Creating work diary:", requestBody);

      const headers = createAuthHeaders();
      const response = await apiFetch('/api/work-diaries', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        console.log("Work diary created successfully:", data.diary);

        // 報酬システムの処理
        try {
          const rewardResult = await diaryRewardManager.processDiaryReward(user.id, {
            title: diaryTitle,
            content: diaryContent,
            mood: parseInt(diaryMood),
            workHours: diaryWorkHours,
            isPrivate: false,
            activities: [],
            achievements: [],
            energyLevel: 5,
            productivity: 5
          });

          if (rewardResult.experience > 0 || rewardResult.workCoins > 0) {
            console.log(`日記投稿報酬付与完了: ${rewardResult.experience}XP, ${rewardResult.workCoins}ワークコイン`);
          }
        } catch (rewardError) {
          console.error("報酬処理エラー:", rewardError);
        }

        // フォームをリセット
        resetDiaryForm();
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        console.error("Failed to create work diary:", data.message);
        alert(`日記の作成に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating work diary:", error);
      alert('日記の作成中にエラーが発生しました');
    }
  };

  // 日記の更新
  const handleUpdateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingDiary) return;

    try {
      if (!diaryDate || !diaryTitle || !diaryContent) {
        alert('日付、タイトル、内容は必須項目です');
        return;
      }

      const requestBody = {
        id: editingDiary._id,
        date: diaryDate,
        title: diaryTitle,
        content: diaryContent,
        mood: parseInt(diaryMood),
        activities: diaryActivities,
        notes: diaryNotes,
        nextGoals: diaryNextGoals,
        challenges: diaryChallenges,
        achievements: diaryAchievements,
        gratitude: diaryGratitude,
        reflection: diaryReflection,
        workSummary: diaryWorkSummary,
        learnings: diaryLearnings,
        energyLevel: diaryEnergyLevel,
        stressLevel: diaryStressLevel,
        workHours: diaryWorkHours,
        breakTime: diaryBreakTime,
        productivity: diaryProductivity,
        tags: diaryTags,
      };

      console.log("Updating work diary:", requestBody);

      const headers = createAuthHeaders();
      const response = await apiFetch('/api/work-diaries', {
        method: 'PUT',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        console.log("Work diary updated successfully:", data.diary);
        resetDiaryForm();
        setEditingDiary(null);
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        console.error("Failed to update work diary:", data.message);
        alert(`日記の更新に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating work diary:", error);
      alert('日記の更新中にエラーが発生しました');
    }
  };

  // 日記の削除
  const handleDeleteDiary = async (id: string) => {
    if (!user?.id) return;

    try {
      const headers = createAuthHeaders();
      const response = await apiFetch(`/api/work-diaries/${id}`, {
        method: 'DELETE',
        headers
      });

      const data = await response.json();
      if (data.success) {
        console.log("Work diary deleted successfully");
        loadWorkDiaries();
      } else {
        console.error("Failed to delete work diary:", data.message);
        alert(`日記の削除に失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting work diary:", error);
      alert('日記の削除中にエラーが発生しました');
    }
  };

  // 日記フォームのリセット
  const resetDiaryForm = () => {
    setDiaryDate("");
    setDiaryTitle("");
    setDiaryContent("");
    setDiaryMood("3");
    setDiaryActivities([]);
    setDiaryNotes("");
    setDiaryNextGoals([]);
    setDiaryChallenges([]);
    setDiaryAchievements([]);
    setDiaryGratitude("");
    setDiaryReflection("");
    setDiaryWorkSummary("");
    setDiaryLearnings([]);
    setDiaryEnergyLevel(3);
    setDiaryStressLevel(3);
    setDiaryWorkHours(0);
    setDiaryBreakTime(0);
    setDiaryProductivity(3);
    setDiaryTags([]);
  };

  // 日記の編集
  const editDiary = (diary: WorkDiary) => {
    setDiaryDate(diary.date.split("T")[0]);
    setDiaryTitle(diary.title);
    setDiaryContent(diary.content);
    setDiaryMood(diary.mood.toString());
    setDiaryActivities(diary.activities || []);
    setDiaryNotes(diary.notes || "");
    setDiaryNextGoals(diary.nextGoals || []);
    setDiaryChallenges(diary.challenges || []);
    setDiaryAchievements(diary.achievements || []);
    setDiaryGratitude(diary.gratitude || "");
    setDiaryReflection(diary.reflection || "");
    setDiaryWorkSummary(diary.workSummary || "");
    setDiaryLearnings(diary.learnings || []);
    setDiaryEnergyLevel(diary.energyLevel || 3);
    setDiaryStressLevel(diary.stressLevel || 3);
    setDiaryWorkHours(diary.workHours || 0);
    setDiaryBreakTime(diary.breakTime || 0);
    setDiaryProductivity(diary.productivity || 3);
    setDiaryTags(diary.tags || []);
    setEditingDiary(diary);
    setShowDiaryForm(true);
  };

  // 日記フォームを開く
  const openDiaryForm = () => {
    resetDiaryForm();
    setEditingDiary(null);
    setShowDiaryForm(true);
  };

  // 削除確認モーダルの表示
  const showDeleteConfirm = (id: string, type: "income" | "expense" | "diary") => {
    setDeletingRecordId(id);
    setDeletingRecordType(type);
    setShowDeleteModal(true);
  };

  // 指定された日付の記録を取得
  const getRecordsForDate = (date: Date) => {
    const selectedDateUTC = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const selectedDateUTCStr = selectedDateUTC.toISOString().split("T")[0];

    const filteredIncomeExpenseRecords = incomeExpenseRecords.filter(record => 
      record.date.startsWith(selectedDateUTCStr)
    );

    const filteredDiaries = workDiaries.filter(diary => 
      diary.date.startsWith(selectedDateUTCStr)
    );

    return {
      incomeRecords: filteredIncomeExpenseRecords.filter(record => record.type === "income"),
      expenseRecords: filteredIncomeExpenseRecords.filter(record => record.type === "expense"),
      workDiaries: filteredDiaries,
    };
  };

  // 削除の実行
  const confirmDelete = async () => {
    if (!deletingRecordId || !deletingRecordType) return;

    try {
      if (deletingRecordType === "diary") {
        await handleDeleteDiary(deletingRecordId);
      } else {
        await handleDeleteIncomeExpenseRecord(deletingRecordId);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    } finally {
      setShowDeleteModal(false);
      setDeletingRecordId(null);
      setDeletingRecordType(null);
    }
  };

  // 削除のキャンセル
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingRecordId(null);
    setDeletingRecordType(null);
  };

  // 記録の選択
  const selectRecord = (record: any, type: "income" | "expense" | "diary") => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(false);
  };

  // 記録の表示
  const viewRecord = (record: any, type: "income" | "expense" | "diary") => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(false);
  };

  // 記録の編集
  const editRecord = (record: any, type: "income" | "expense" | "diary") => {
    if (type === "diary") {
      editDiary(record);
    } else {
      setIncomeExpenseDate(record.date.split("T")[0]);
      setIncomeExpenseAmount(Math.abs(record.amount).toString());
      setIncomeExpenseType(record.type === "income" ? "income" : "expense");
      setIncomeExpenseNotes(record.notes || "");
      setIncomeExpenseCategory(record.category || "");
      setIncomeExpenseSubcategory(record.subcategory || "");
      setIncomeExpenseTags(record.tags || []);
      setEditingIncomeExpenseRecord(record);
      setShowIncomeExpenseForm(true);
    }
  };

  // 記録の削除
  const deleteRecord = (id: string, type: "income" | "expense" | "diary") => {
    showDeleteConfirm(id, type);
  };

  // 月の変更
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    loadMonthlyMemo();
  };

  // 日付の選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedRecord(null);
    setSelectedRecordType(null);
  };

  // 機能の切り替え
  const handleFeatureSwitch = (feature: string) => {
    closeOtherFeatures(feature);
  };

  // お仕事記録セクションは常に表示
  // if (!showWorkRecords) return null;

  return (
    <div className="work-records-section">
      <div className="section-header">
        <h2>お仕事記録</h2>
        <p>収入・支出と日記を記録して、お仕事の振り返りをしましょう</p>
        <div className="dashboard-buttons">
          <button 
            className="open-dashboard-button comprehensive"
            onClick={() => {
              closeOtherFeatures('comprehensive-dashboard');
              setShowComprehensiveDashboard(true);
            }}
          >
            🏠 統合ダッシュボード
          </button>
          <button 
            className="open-dashboard-button action-history"
            onClick={() => setShowActionHistory(true)}
          >
            📝 行動記録
          </button>
          <button 
            className="open-dashboard-button future-planning"
            onClick={() => setShowFuturePlanning(true)}
          >
            🎯 未来計画
          </button>
          <button 
            className="open-dashboard-button data-analysis"
            onClick={() => setShowDataAnalysis(true)}
          >
            📊 データ分析
          </button>
        </div>
      </div>

      {/* カレンダー表示 */}
      <div className="calendar-section">
        <CalendarComponent
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          onDateClick={handleDateSelect}
          getRecordsForDate={getRecordsForDate}
        />
      </div>

      {/* 月次メモ */}
      <div className="monthly-memo-section">
        <h3>月次メモ</h3>
        {editingMonthlyMemo ? (
          <div className="memo-editor">
            <textarea
              value={monthlyMemo}
              onChange={(e) => setMonthlyMemo(e.target.value)}
              placeholder="今月の振り返りや来月の目標を記録してください..."
              rows={4}
            />
            <div className="memo-actions">
              <button onClick={saveMonthlyMemo} className="save-btn">
                保存
              </button>
              <button onClick={cancelEditingMonthlyMemo} className="cancel-btn">
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="memo-display">
            <p>{monthlyMemo || "月次メモがありません"}</p>
            <button onClick={startEditingMonthlyMemo} className="edit-btn">
              編集
            </button>
          </div>
        )}
      </div>

      {/* 収入・支出記録フォーム */}
      {showIncomeExpenseForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingIncomeExpenseRecord ? "収入・支出記録を編集" : "収入・支出記録を追加"}</h3>
            <form onSubmit={editingIncomeExpenseRecord ? handleUpdateIncomeExpenseRecord : handleCreateIncomeExpenseRecord}>
              <div className="form-group">
                <label>日付</label>
                <input
                  type="date"
                  value={incomeExpenseDate}
                  onChange={(e) => setIncomeExpenseDate(e.target.value)}
                  required
                />
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
                <label>種類</label>
                <select
                  value={incomeExpenseType}
                  onChange={(e) => {
                    setIncomeExpenseType(e.target.value as "income" | "expense");
                    setIncomeExpenseCategory("");
                    setIncomeExpenseSubcategory("");
                  }}
                  title="収入・支出の種類を選択"
                  aria-label="収入・支出の種類を選択"
                >
                  <option value="income">収入</option>
                  <option value="expense">支出</option>
                </select>
              </div>
              <div className="form-group">
                <label>カテゴリ</label>
                <select
                  value={incomeExpenseCategory}
                  onChange={(e) => {
                    setIncomeExpenseCategory(e.target.value);
                    setIncomeExpenseSubcategory("");
                  }}
                  required
                  title="カテゴリを選択"
                  aria-label="カテゴリを選択"
                >
                  <option value="">カテゴリを選択</option>
                  {(incomeExpenseType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              {incomeExpenseCategory && SUBCATEGORIES[incomeExpenseCategory] && (
                <div className="form-group">
                  <label>サブカテゴリ</label>
                <select
                  value={incomeExpenseSubcategory}
                  onChange={(e) => setIncomeExpenseSubcategory(e.target.value)}
                  title="サブカテゴリを選択"
                  aria-label="サブカテゴリを選択"
                >
                    <option value="">サブカテゴリを選択（任意）</option>
                    {SUBCATEGORIES[incomeExpenseCategory].map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>タグ</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {incomeExpenseTags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setIncomeExpenseTags(incomeExpenseTags.filter((_, i) => i !== index))}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="タグを入力"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim() && !incomeExpenseTags.includes(newTag.trim())) {
                            setIncomeExpenseTags([...incomeExpenseTags, newTag.trim()]);
                            setNewTag("");
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTag.trim() && !incomeExpenseTags.includes(newTag.trim())) {
                          setIncomeExpenseTags([...incomeExpenseTags, newTag.trim()]);
                          setNewTag("");
                        }
                      }}
                      className="tag-add-btn"
                    >
                      追加
                    </button>
                  </div>
                </div>
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
                <button type="submit" className="submit-btn">
                  {editingIncomeExpenseRecord ? "更新" : "追加"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIncomeExpenseForm(false);
                    setEditingIncomeExpenseRecord(null);
                    setIncomeExpenseDate("");
                    setIncomeExpenseAmount("");
                    setIncomeExpenseType("income");
                    setIncomeExpenseNotes("");
                    setIncomeExpenseCategory("");
                    setIncomeExpenseSubcategory("");
                    setIncomeExpenseTags([]);
                    setNewTag("");
                  }}
                  className="cancel-btn"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 日記フォーム */}
      {showDiaryForm && (
        <div className="form-overlay">
          <div className="form-container diary-form">
            <h3>{editingDiary ? "日記を編集" : "日記を追加"}</h3>
            <form onSubmit={editingDiary ? handleUpdateDiary : handleCreateDiary}>
              <div className="form-row">
                <div className="form-group">
                  <label>日付</label>
                  <input
                    type="date"
                    value={diaryDate}
                    onChange={(e) => setDiaryDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>タイトル</label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="日記のタイトル"
                    title="日記のタイトルを入力"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>内容</label>
                <textarea
                  value={diaryContent}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  placeholder="今日の出来事や感想を記録してください"
                  rows={4}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>気分</label>
                  <select
                    value={diaryMood}
                    onChange={(e) => setDiaryMood(e.target.value)}
                    title="気分を選択"
                    aria-label="気分を選択"
                  >
                    <option value="1">😢 とても悪い</option>
                    <option value="2">😞 悪い</option>
                    <option value="3">😐 普通</option>
                    <option value="4">😊 良い</option>
                    <option value="5">😄 とても良い</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>エネルギーレベル</label>
                  <select
                    value={diaryEnergyLevel}
                    onChange={(e) => setDiaryEnergyLevel(parseInt(e.target.value))}
                  >
                    <option value="1">🔋 とても低い</option>
                    <option value="2">🔋 低い</option>
                    <option value="3">🔋 普通</option>
                    <option value="4">🔋 高い</option>
                    <option value="5">🔋 とても高い</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingDiary ? "更新" : "追加"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiaryForm(false);
                    setEditingDiary(null);
                    resetDiaryForm();
                  }}
                  className="cancel-btn"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 行動記録コンポーネント */}
      <ActionHistoryComponent
        showActionHistory={showActionHistory}
        setShowActionHistory={setShowActionHistory}
        closeOtherFeatures={closeOtherFeatures}
        user={user}
      />

      {/* 未来計画コンポーネント */}
      <FuturePlanningComponent
        showFuturePlanning={showFuturePlanning}
        setShowFuturePlanning={setShowFuturePlanning}
        closeOtherFeatures={closeOtherFeatures}
        user={user}
      />

      {/* データ分析コンポーネント */}
      <DataAnalysisComponent
        showDataAnalysis={showDataAnalysis}
        setShowDataAnalysis={setShowDataAnalysis}
        closeOtherFeatures={closeOtherFeatures}
        user={user}
      />

      {/* 統合ダッシュボード */}
      {showComprehensiveDashboard && user && (
        <ComprehensiveDashboard
          userId={user.id}
          onClose={() => setShowComprehensiveDashboard(false)}
        />
      )}

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="記録を削除"
        message={`この${deletingRecordType === "diary" ? "日記" : "記録"}を削除しますか？`}
        itemName={deletingRecordType === "diary" ? "日記" : "記録"}
        itemType={deletingRecordType === "diary" ? "diary" : "record"}
      />
    </div>
  );
};

export default WorkRecordsComponent;
