import React, { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import MainLayout from "./components/MainLayout";
import { useAuth } from "./hooks/useAuth";
import { useErrorHandling } from "./hooks/useErrorHandling";
import { useDataFetching } from "./hooks/useDataFetching";
import { useUIState } from "./hooks/useUIState";
import { LoadingStateProvider, useLoadingState } from "./components/LoadingStateManager";
import { TimeTrackingStateProvider, useTimeTrackingState, useTimeTrackingHelpers } from "./components/TimeTrackingStateManager";
import { TimerPresetProvider, useTimerPresetState } from "./components/TimerPresetManager";
import { MoodLogProvider, useMoodLogState, useMoodLogHelpers } from "./components/MoodLogManager";
import SimpleErrorReportingModal from "./components/SimpleErrorReportingModal";
import UpdateRequestModal from "./components/UpdateRequestModal";
import BugReportModal from "./components/BugReportModal";
import { setErrorReportCallback } from "./utils/apiClient";
import { User, TimeEntry, Project, Book, Memo, IncomeExpenseRecord, WorkDiary, AdminUser } from "./types";

// 機能の型定義
interface Feature {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any> | null;
  icon: string;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
}

// WorkRecordの型定義
interface WorkRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  workTime: number;
  hourlyWage: number;
  dailyWage: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  // ローディング状態の管理
  const loadingState = useLoadingState();
  
  // 時間記録状態の管理
  const timeTrackingState = useTimeTrackingState();
  const timeTrackingHelpers = useTimeTrackingHelpers();
  
  // タイマープリセット状態の管理
  const timerPresetState = useTimerPresetState();
  
  // 感情ログ状態の管理
  const moodLogState = useMoodLogState();
  const moodLogHelpers = useMoodLogHelpers();

  // カスタムフックの使用
  const auth = useAuth();
  const errorHandling = useErrorHandling();
  const dataFetching = useDataFetching(auth.isLoggedIn, auth.user);
  const uiState = useUIState();

  // データフェッチングの状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [incomeExpenseRecords, setIncomeExpenseRecords] = useState<IncomeExpenseRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [reportSummary, setReportSummary] = useState<any>({});

  // 追加の状態変数（App_backup.tsxから復元）
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#3b82f6");

  // キャラクター関連の状態
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<any>(null);

  // タイマー関連の状態
  const [showTimers, setShowTimers] = useState(false);
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerTime, setCustomTimerTime] = useState(0);
  const [customTimerInterval, setCustomTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerName, setCustomTimerName] = useState("");
  const [customTimerSound, setCustomTimerSound] = useState<"bell" | "chime" | "beep" | "alarm">("bell");
  const [customTimerOriginalTime, setCustomTimerOriginalTime] = useState(0);

  // タイマープリセットの状態
  const [timerPresets, setTimerPresets] = useState([
    { id: 1, name: "ポモドーロ", minutes: 25, seconds: 0, color: "#ef4444" },
    { id: 2, name: "短い休憩", minutes: 5, seconds: 0, color: "#10b981" },
    { id: 3, name: "長い休憩", minutes: 15, seconds: 0, color: "#3b82f6" },
    { id: 4, name: "料理タイマー", minutes: 10, seconds: 0, color: "#f59e0b" },
    { id: 5, name: "運動タイマー", minutes: 30, seconds: 0, color: "#8b5cf6" },
  ]);

  // タイマー履歴の状態
  const [timerHistory, setTimerHistory] = useState<Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: Date;
    type: "custom" | "egg" | "preset";
  }>>([]);

  // 料理タイマーの状態
  const [selectedRecipe, setSelectedRecipe] = useState<string>("egg");
  const [selectedEggType, setSelectedEggType] = useState<"soft" | "medium" | "hard">("medium");
  const [eggTimerActive, setEggTimerActive] = useState(false);
  const [eggTimerPaused, setEggTimerPaused] = useState(false);
  const [eggTimerTime, setEggTimerTime] = useState(0);
  const [eggTimerInterval, setEggTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [eggTimerType, setEggTimerType] = useState<"soft" | "medium" | "hard">("medium");
  const [eggTimerSound, setEggTimerSound] = useState<"bell" | "chime" | "beep" | "alarm">("bell");
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = useState(0);
  const [eggTimerPhase, setEggTimerPhase] = useState<"heating" | "boiling" | "cooking">("heating");
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = useState(0);
  const [eggTimerPhaseName, setEggTimerPhaseName] = useState("");

  // 音声ループ再生の状態
  const [soundLoopInterval, setSoundLoopInterval] = useState<NodeJS.Timeout | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // バックグラウンドタイマー関連の状態
  const [backgroundTimerActive, setBackgroundTimerActive] = useState(false);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(null);
  const [isMannerMode, setIsMannerMode] = useState(false);

  // フォント設定関連の状態
  const [selectedFont, setSelectedFont] = useState("system");
  const [fontSettings, setFontSettings] = useState<any>({});
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showLanguageFontSettings, setShowLanguageFontSettings] = useState(false);

  // テーマ設定関連の状態
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // カスタムカテゴリ管理の状態
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  // 返信機能の状態
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // お仕事記録の状態
  const [showIncomeExpenseForm, setShowIncomeExpenseForm] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [editingIncomeExpenseRecord, setEditingIncomeExpenseRecord] = useState<any>(null);
  const [editingDiary, setEditingDiary] = useState<any>(null);

  // 収入・支出記録フォームの状態
  const [incomeExpenseDate, setIncomeExpenseDate] = useState("");
  const [incomeExpenseAmount, setIncomeExpenseAmount] = useState("");
  const [incomeExpenseType, setIncomeExpenseType] = useState<"income" | "expense">("income");
  const [incomeExpenseNotes, setIncomeExpenseNotes] = useState("");

  // 日記フォームの状態
  const [diaryDate, setDiaryDate] = useState("");
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryMood, setDiaryMood] = useState("4");
  const [diaryActivities, setDiaryActivities] = useState<string[]>([]);
  const [diaryTags, setDiaryTags] = useState("");
  const [diaryIsPrivate, setDiaryIsPrivate] = useState(true);

  // 新しい日記項目の状態
  const [diaryWorkSummary, setDiaryWorkSummary] = useState("");
  const [diaryAchievements, setDiaryAchievements] = useState<string[]>([]);
  const [diaryChallenges, setDiaryChallenges] = useState<string[]>([]);
  const [diaryLearnings, setDiaryLearnings] = useState<string[]>([]);
  const [diaryNextGoals, setDiaryNextGoals] = useState<string[]>([]);
  const [diaryEnergyLevel, setDiaryEnergyLevel] = useState(5);
  const [diaryStressLevel, setDiaryStressLevel] = useState(5);
  const [diaryWorkHours, setDiaryWorkHours] = useState(0);
  const [diaryBreakTime, setDiaryBreakTime] = useState(0);
  const [diaryProductivity, setDiaryProductivity] = useState(5);
  const [diaryNotes, setDiaryNotes] = useState("");
  const [diaryGratitude, setDiaryGratitude] = useState("");
  const [diaryReflection, setDiaryReflection] = useState("");

  // 配列項目の一時入力状態
  const [newAchievement, setNewAchievement] = useState("");
  const [newChallenge, setNewChallenge] = useState("");
  const [newLearning, setNewLearning] = useState("");
  const [newNextGoal, setNewNextGoal] = useState("");

  // 機能設定の状態
  const [userSettings, setUserSettings] = useState<any>(null);
  const [showFeatureSettings, setShowFeatureSettings] = useState(false);
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);
  const [showDiaryReminderSettings, setShowDiaryReminderSettings] = useState(false);
  const [diaryReminderSnoozeUntil, setDiaryReminderSnoozeUntil] = useState<number | null>(null);

  // カレンダーの状態
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<"income" | "diary">("income");

  // 月収支メモの状態
  const [monthlyMemo, setMonthlyMemo] = useState("");
  const [editingMonthlyMemo, setEditingMonthlyMemo] = useState(false);

  // ジャンル管理の状態
  const [showGenreManagement, setShowGenreManagement] = useState(false);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");


  // お仕事記録の状態
  const [showWorkRecords, setShowWorkRecords] = useState(false);


  // メモ関連の状態
  const [showMemos, setShowMemos] = useState(false);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoTags, setMemoTags] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [memoIsFamilyOnly, setMemoIsFamilyOnly] = useState(false);
  const [memoIsAdminOnly, setMemoIsAdminOnly] = useState(false);
  const [memoSearchTerm, setMemoSearchTerm] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");

  // 公開メモ関連の状態
  const [showPublicMemos, setShowPublicMemos] = useState(false);
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] = useState("all");
  const [publicMemoCurrentDate, setPublicMemoCurrentDate] = useState(new Date());
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] = useState<Date | null>(null);

  // 本棚関連の状態
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookPublishedYear, setBookPublishedYear] = useState(new Date().getFullYear());
  const [bookTotalPages, setBookTotalPages] = useState(0);
  const [bookCategory, setBookCategory] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [selectedBookCategory, setSelectedBookCategory] = useState("all");

  // エラーレポートコールバックの設定
  useEffect(() => {
    setErrorReportCallback(errorHandling.handleApiErrorReport);
  }, [errorHandling.handleApiErrorReport]);

  // 更新要望のハンドラー
  const handleUpdateRequest = async (updateRequest: { title: string; content: string; priority: string; category: string }) => {
    console.log('App.tsx - Update request submitted:', updateRequest);
    try {
      // API呼び出しの実装
      console.log('Update request sent successfully');
    } catch (error) {
      console.error('Failed to send update request:', error);
    }
  };

  // 不具合報告のハンドラー
  const handleBugReport = async (bugReport: { title: string; content: string; severity: string; category: string }) => {
    console.log('App.tsx - Bug report submitted:', bugReport);
    try {
      // API呼び出しの実装
      console.log('Bug report sent successfully');
    } catch (error) {
      console.error('Failed to send bug report:', error);
    }
  };

  // データローディング関数（App_backup.tsxから復元）
  const loadProjects = async () => {
    console.log('App.tsx - Loading projects');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTimeEntries = async () => {
    console.log('App.tsx - Loading time entries');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/time/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // 時間記録データの処理
        console.log('Time entries loaded:', data.entries);
      }
    } catch (error) {
      console.error('Failed to load time entries:', error);
    }
  };

  const loadBooks = async () => {
    console.log('App.tsx - Loading books');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadMemos = async () => {
    console.log('App.tsx - Loading memos');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/memos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMemos(data.memos || []);
      }
    } catch (error) {
      console.error('Failed to load memos:', error);
    }
  };

  const loadPublicMemos = async () => {
    console.log('App.tsx - Loading public memos');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/memos/public", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPublicMemos(data.memos || []);
      }
    } catch (error) {
      console.error('Failed to load public memos:', error);
    }
  };

  const loadAdminUsers = async () => {
    console.log('App.tsx - Loading admin users');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAdminUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load admin users:', error);
    }
  };

  const loadReportSummary = async () => {
    console.log('App.tsx - Loading report summary');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/reports/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReportSummary(data.summary || {});
      }
    } catch (error) {
      console.error('Failed to load report summary:', error);
    }
  };

  // 収入・支出記録の読み込み（App_backup.tsxから復元）
  const loadIncomeExpenseRecords = async () => {
    console.log('App.tsx - Loading income/expense records');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/work-records/salary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIncomeExpenseRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to load income/expense records:', error);
    }
  };

  // 日記の読み込み（App_backup.tsxから復元）
  const loadWorkDiaries = async () => {
    console.log('App.tsx - Loading work diaries');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/work-records/diary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setWorkDiaries(data.diaries || []);
      }
    } catch (error) {
      console.error('Failed to load work diaries:', error);
    }
  };

  // 収入・支出記録の作成（App_backup.tsxから復元）
  const handleCreateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App.tsx - Creating income/expense record');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/work-records/salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: incomeExpenseDate,
          amount: parseFloat(incomeExpenseAmount) || 0,
          type: incomeExpenseType,
          notes: incomeExpenseNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Income/expense record created successfully');
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error('Failed to create income/expense record:', data.message);
      }
    } catch (error) {
      console.error('Error creating income/expense record:', error);
    }
  };

  // 日記の作成（App_backup.tsxから復元）
  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App.tsx - Creating diary');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/work-records/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: diaryDate,
          title: diaryTitle,
          content: diaryContent,
          mood: parseInt(diaryMood),
          activities: diaryActivities,
          tags: diaryTags.split(",").map(tag => tag.trim()).filter(tag => tag),
          isPrivate: diaryIsPrivate,
          workSummary: diaryWorkSummary,
          achievements: diaryAchievements,
          challenges: diaryChallenges,
          learnings: diaryLearnings,
          nextGoals: diaryNextGoals,
          energyLevel: diaryEnergyLevel,
          stressLevel: diaryStressLevel,
          workHours: diaryWorkHours,
          breakTime: diaryBreakTime,
          productivity: diaryProductivity,
          notes: diaryNotes,
          gratitude: diaryGratitude,
          reflection: diaryReflection,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Diary created successfully');
        setDiaryDate("");
        setDiaryTitle("");
        setDiaryContent("");
        setDiaryMood("4");
        setDiaryActivities([]);
        setDiaryTags("");
        setDiaryIsPrivate(true);
        setDiaryWorkSummary("");
        setDiaryAchievements([]);
        setDiaryChallenges([]);
        setDiaryLearnings([]);
        setDiaryNextGoals([]);
        setDiaryEnergyLevel(5);
        setDiaryStressLevel(5);
        setDiaryWorkHours(0);
        setDiaryBreakTime(0);
        setDiaryProductivity(5);
        setDiaryNotes("");
        setDiaryGratitude("");
        setDiaryReflection("");
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        console.error('Failed to create diary:', data.message);
      }
    } catch (error) {
      console.error('Error creating diary:', error);
    }
  };

  // 時間記録ハンドラー（App_backup.tsxから復元）
  const handleStartTracking = async () => {
    console.log('App.tsx - Starting time tracking');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/time/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject || "",
          description: "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Time tracking started successfully');
        loadTimeEntries();
      } else {
        console.error('Failed to start time tracking:', data.message);
      }
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  };

  const handleStopTracking = async () => {
    console.log('App.tsx - Stopping time tracking');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/time/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log('Time tracking stopped successfully');
        loadTimeEntries();
      } else {
        console.error('Failed to stop time tracking:', data.message);
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
    }
  };

  const handleResetTracking = () => {
    console.log('App.tsx - Resetting time tracking');
    // 時間記録リセット処理
  };

  // プロジェクト作成ハンドラー（App_backup.tsxから復元）
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App.tsx - Creating project');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName || "",
          description: projectDescription || "",
          color: projectColor || "#3b82f6",
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Project created successfully');
        setProjectName("");
        setProjectDescription("");
        setProjectColor("#3b82f6");
        setShowProjectForm(false);
        loadProjects();
      } else {
        console.error('Failed to create project:', data.message);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // 本作成ハンドラー（App_backup.tsxから復元）
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App.tsx - Creating book');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle || "",
          author: bookAuthor || "",
          isbn: bookIsbn || "",
          publishedYear: bookPublishedYear || new Date().getFullYear(),
          totalPages: bookTotalPages || 0,
          category: bookCategory || "",
          notes: bookNotes || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Book created successfully');
        setBookTitle("");
        setBookAuthor("");
        setBookIsbn("");
        setBookPublishedYear(new Date().getFullYear());
        setBookTotalPages(0);
        setBookCategory("");
        setBookNotes("");
        setShowBookForm(false);
        loadBooks();
      } else {
        console.error('Failed to create book:', data.message);
      }
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !bookTitle.trim()) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publishedYear: bookPublishedYear,
          totalPages: bookTotalPages,
          category: bookCategory,
          notes: bookNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEditingBook(null);
        setBookTitle("");
        setBookAuthor("");
        setBookIsbn("");
        setBookPublishedYear(new Date().getFullYear());
        setBookTotalPages(0);
        setBookCategory("");
        setBookNotes("");
        setShowBookForm(false);
        loadBooks();
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleEditBook = (book: any) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookIsbn(book.isbn);
    setBookPublishedYear(book.publishedYear);
    setBookTotalPages(book.totalPages);
    setBookCategory(book.category);
    setBookNotes(book.notes);
    setShowBookForm(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('この本を削除しますか？')) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        loadBooks();
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleBookCategoryChange = (category: string) => {
    setSelectedBookCategory(category);
  };

  const getReadingProgress = (book: any) => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.round((book.currentPage || 0) / book.totalPages * 100);
  };

  // 料理タイマー関連のハンドラー関数
  const getEggTimerDuration = (type: "soft" | "medium" | "hard") => {
    switch (type) {
      case "soft":
        return 6 * 60; // 6分
      case "medium":
        return 8 * 60; // 8分
      case "hard":
        return 10 * 60; // 10分
      default:
        return 8 * 60;
    }
  };

  const pauseEggTimer = () => {
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerPaused(true);
  };

  const stopEggTimer = () => {
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerActive(false);
    setEggTimerPaused(false);
    setEggTimerTime(0);
    setEggTimerPhase("heating");
    setEggTimerPhaseTime(0);
    setEggTimerPhaseName("");
  };

  const resetEggTimer = () => {
    stopEggTimer();
    setEggTimerTime(getEggTimerDuration(eggTimerType as "soft" | "medium" | "hard"));
  };

  // 音響関連のハンドラー関数
  const playBellSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 鐘の音: 低い音から高い音へ
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5

    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const playChimeSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // チャイム音: 上昇する音階
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.15); // C#5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.3); // E5

    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  };

  const playBeepSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // ビープ音: 短い連続音
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    oscillator.type = "square";
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.25);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  };

  const playAlarmSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // アラーム音: 高音の連続音
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.4);

    oscillator.type = "square";
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    if (isSoundPlaying) return;

    setIsSoundPlaying(true);

    const playSound = async () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        switch (soundType) {
          case "bell":
            playBellSound(audioContext);
            break;
          case "chime":
            playChimeSound(audioContext);
            break;
          case "beep":
            playBeepSound(audioContext);
            break;
          case "alarm":
            playAlarmSound(audioContext);
            break;
          default:
            playBellSound(audioContext);
        }
      } catch (error) {
        console.error("音声ループ再生エラー:", error);
      }
    };

    // 即座に1回再生
    playSound();

    // 3秒間隔でループ再生
    const interval = setInterval(playSound, 3000);
    setSoundLoopInterval(interval);
  };

  const stopSoundLoop = () => {
    if (soundLoopInterval) {
      clearInterval(soundLoopInterval);
      setSoundLoopInterval(null);
    }
    setIsSoundPlaying(false);
  };

  // メモ作成ハンドラー（App_backup.tsxから復元）
  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('App.tsx - Creating memo');
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: memoTitle || "",
          content: memoContent || "",
          category: memoCategory || "",
          tags: memoTags || "",
          isPublic: memoIsPublic || false,
          isFamilyOnly: memoIsFamilyOnly || false,
          isAdminOnly: memoIsAdminOnly || false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Memo created successfully');
        setMemoTitle("");
        setMemoContent("");
        setMemoCategory("");
        setMemoTags("");
        setMemoIsPublic(false);
        setMemoIsFamilyOnly(false);
        setMemoIsAdminOnly(false);
        setShowMemoForm(false);
        loadMemos();
      } else {
        console.error('Failed to create memo:', data.message);
      }
    } catch (error) {
      console.error('Error creating memo:', error);
    }
  };

  // タイマー関連のハンドラー（App_backup.tsxから復元）
  const startCustomTimer = () => {
    if (customTimerActive && !customTimerPaused) return;

    if (customTimerPaused) {
      // 一時停止から再開
      setCustomTimerPaused(false);
      const interval = setInterval(() => {
        setCustomTimerTime((prev) => {
          if (prev <= 1) {
            setCustomTimerActive(false);
            setCustomTimerPaused(false);
            clearInterval(interval);
            setCustomTimerInterval(null);
            // タイマー終了時の通知
            const timerName = customTimerName || "カスタムタイマー";
            console.log(`${timerName}終了！`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCustomTimerInterval(interval);
    } else {
      // 新規開始
      const totalSeconds = customTimerMinutes * 60 + customTimerSeconds;
      if (totalSeconds <= 0) {
        console.log("タイマー時間を設定してください");
        return;
      }

      setCustomTimerTime(totalSeconds);
      setCustomTimerOriginalTime(totalSeconds);
      setCustomTimerActive(true);
      setCustomTimerPaused(false);

      const interval = setInterval(() => {
        setCustomTimerTime((prev) => {
          if (prev <= 1) {
            setCustomTimerActive(false);
            setCustomTimerPaused(false);
            clearInterval(interval);
            setCustomTimerInterval(null);
            // タイマー終了時の通知
            const timerName = customTimerName || "カスタムタイマー";
            console.log(`${timerName}終了！`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setCustomTimerInterval(interval);
    }
  };

  const pauseCustomTimer = () => {
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
      setCustomTimerInterval(null);
      setCustomTimerPaused(true);
    }
  };

  const stopCustomTimer = () => {
    setCustomTimerActive(false);
    setCustomTimerPaused(false);
    setCustomTimerTime(0);
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
      setCustomTimerInterval(null);
    }
  };

  const resetCustomTimer = () => {
    setCustomTimerTime(customTimerOriginalTime);
    setCustomTimerPaused(false);
  };

  // 料理タイマーのハンドラー（App_backup.tsxから復元）
  const startEggTimer = () => {
    if (eggTimerActive && !eggTimerPaused) return;

    if (eggTimerPaused) {
      // 一時停止から再開
      setEggTimerPaused(false);
      const interval = setInterval(() => {
        setEggTimerTime((prev) => {
          if (prev <= 1) {
            setEggTimerActive(false);
            setEggTimerPaused(false);
            clearInterval(interval);
            setEggTimerInterval(null);
            console.log("ゆでたまごタイマー終了！");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setEggTimerInterval(interval);
    } else {
      // 新規開始
      const duration = getEggTimerDuration(selectedEggType);
      setEggTimerTime(duration);
      setEggTimerOriginalTime(duration);
      setEggTimerActive(true);
      setEggTimerPaused(false);

      const interval = setInterval(() => {
        setEggTimerTime((prev) => {
          if (prev <= 1) {
            setEggTimerActive(false);
            setEggTimerPaused(false);
            clearInterval(interval);
            setEggTimerInterval(null);
            console.log("ゆでたまごタイマー終了！");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setEggTimerInterval(interval);
    }
  };









  const playEggTimerSound = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      switch (eggTimerSound) {
        case "bell":
          playBellSound(audioContext);
          break;
        case "chime":
          playChimeSound(audioContext);
          break;
        case "beep":
          playBeepSound(audioContext);
          break;
        case "alarm":
          playAlarmSound(audioContext);
          break;
      }
    } catch (error) {
      console.error("音声再生エラー:", error);
    }
  };

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEggTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // タイマー履歴の管理
  const addToTimerHistory = (name: string, duration: number, type: "custom" | "egg" | "preset") => {
    const newEntry = {
      id: Date.now().toString(),
      name,
      duration,
      completedAt: new Date(),
      type
    };
    setTimerHistory(prev => [newEntry, ...prev.slice(0, 49)]); // 最新50件まで保持
  };

  // 通知機能
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon });
    }
  };

  // カレンダー関連のハンドラー（App_backup.tsxから復元）
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const openDiaryForm = () => {
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(true);
    setShowCalendar(false);
    setShowWorkRecords(true);
    // 今日の日付を設定
    const today = new Date();
    setDiaryDate(today.toISOString().split("T")[0]);
    // フォームをリセット
    setDiaryTitle("");
    setDiaryContent("");
    setDiaryMood("4");
    setDiaryActivities([]);
    setDiaryNotes("");
    setDiaryNextGoals([]);
    setDiaryChallenges([]);
    setDiaryAchievements([]);
    setEditingDiary(null);
  };

  const openIncomeExpenseForm = () => {
    setShowDiaryForm(false);
    setShowIncomeExpenseForm(true);
    setShowCalendar(false);
    setShowWorkRecords(true);
    // 今日の日付を設定
    const today = new Date();
    setIncomeExpenseDate(today.toISOString().split("T")[0]);
    // フォームをリセット
    setIncomeExpenseAmount("");
    setIncomeExpenseType("income");
    setIncomeExpenseNotes("");
    setEditingIncomeExpenseRecord(null);
  };

  // 月収支メモの管理（App_backup.tsxから復元）
  const loadMonthlyMemo = () => {
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const savedMemo = localStorage.getItem(`monthlyMemo_${currentMonth}`);
    setMonthlyMemo(savedMemo || "");
  };

  const saveMonthlyMemo = () => {
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    localStorage.setItem(`monthlyMemo_${currentMonth}`, monthlyMemo);
    setEditingMonthlyMemo(false);
    console.log("月収支メモを保存しました");
  };

  const startEditingMonthlyMemo = () => {
    setEditingMonthlyMemo(true);
  };

  const cancelEditingMonthlyMemo = () => {
    loadMonthlyMemo();
    setEditingMonthlyMemo(false);
  };

  // カスタムカテゴリ管理の関数（App_backup.tsxから復元）
  const handleAddCategory = () => {
    if (newGenreName.trim() && !customCategories.includes(newGenreName.trim())) {
      const updatedCategories = [...customCategories, newGenreName.trim()];
      setCustomCategories(updatedCategories);
      localStorage.setItem("customCategories", JSON.stringify(updatedCategories));
      setNewGenreName("");
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = customCategories.filter(
      (category) => category !== categoryToDelete
    );
    setCustomCategories(updatedCategories);
    localStorage.setItem("customCategories", JSON.stringify(updatedCategories));
  };

  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    const defaultGenres = [
      "仕事",
      "学習",
      "趣味",
      "健康",
      "家族",
      "旅行",
      "読書",
      "映画",
      "音楽",
      "スポーツ",
      "料理",
      "要望、リクエスト",
      "その他",
    ];
    return [...defaultGenres, ...customCategories];
  };

  // ユーザー設定の読み込み
  const loadUserSettings = async () => {
    console.log('App.tsx - Loading user settings');
    // ユーザー設定の読み込み
  };

  // 機能の定義（簡易版）
  const features = [
    { id: "time-tracking", name: "時間管理", icon: "⏰" },
    { id: "cooking-timer", name: "料理タイマー", icon: "🍳" },
    { id: "projects", name: "プロジェクト", icon: "📋" },
    { id: "self-analysis", name: "じぶん図鑑", icon: "📊" },
    { id: "bookshelf", name: "本棚", icon: "📚" },
    { id: "memos", name: "メモ", icon: "📝" },
    { id: "reports", name: "レポート", icon: "📈" },
    { id: "admin-panel", name: "管理パネル", icon: "⚙️" },
    { id: "timers", name: "タイマー", icon: "⏲️" },
    { id: "public-memos", name: "公開メモ", icon: "🌐" },
    { id: "work-records", name: "勤務記録", icon: "💼" },
    { id: "sound-app", name: "サウンドアプリ", icon: "🎵" }
  ];

  // 表示する機能を取得
  const getVisibleFeatures = () => {
    return features;
  };

  // 認証チェック中はローディング表示
  if (auth.isCheckingAuth) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>認証を確認中...</p>
      </div>
    );
  }

  // ログインしていない場合はログインフォームを表示
  if (!auth.isLoggedIn) {
    return (
      <div className="app">
        <LoginForm
          email={auth.email}
          setEmail={auth.setEmail}
          password={auth.password}
          setPassword={auth.setPassword}
          displayName={auth.displayName}
          setDisplayName={auth.setDisplayName}
          loading={auth.loading}
          message={auth.message}
          isRegisterMode={auth.isRegisterMode}
          setIsRegisterMode={auth.setIsRegisterMode}
          handleLogin={auth.handleLogin}
          handleRegister={auth.handleRegister}
        />
        <SimpleErrorReportingModal
          isOpen={errorHandling.showErrorModal}
          onClose={() => errorHandling.setShowErrorModal(false)}
          onSubmit={errorHandling.handleSimpleErrorReport}
        />
      </div>
    );
  }

  // ログイン済みの場合はメインレイアウトを表示
  return (
    <MainLayout
      user={auth.user}
      isLoggedIn={auth.isLoggedIn}
      showCharacterHome={uiState.showCharacterHome}
      showProjects={uiState.showProjects}
      showCookingTimer={uiState.showCookingTimer}
      showSelfAnalysis={uiState.showSelfAnalysis}
      showBookshelf={uiState.showBookshelf}
      showMemos={uiState.showMemos}
      showReports={uiState.showReports}
      showAdminPanel={uiState.showAdminPanel}
      showTimeTracking={uiState.showTimeTracking}
      showTimers={uiState.showTimers}
      showPublicMemos={uiState.showPublicMemos}
      showWorkRecords={uiState.showWorkRecords}
      showSoundApp={uiState.showSoundApp}
      showNotifications={uiState.showNotifications}
      showVersionInfo={uiState.showVersionInfo}
      showThemeSettings={uiState.showThemeSettings}
      showFontSettings={uiState.showFontSettings}
      showFeatureSettings={uiState.showFeatureSettings}
      // お仕事記録関連の状態
      showIncomeExpenseForm={showIncomeExpenseForm}
      setShowIncomeExpenseForm={setShowIncomeExpenseForm}
      showDiaryForm={showDiaryForm}
      setShowDiaryForm={setShowDiaryForm}
      editingIncomeExpenseRecord={editingIncomeExpenseRecord}
      setEditingIncomeExpenseRecord={setEditingIncomeExpenseRecord}
      editingDiary={editingDiary}
      setEditingDiary={setEditingDiary}
      // 収入・支出記録フォームの状態
      incomeExpenseDate={incomeExpenseDate}
      setIncomeExpenseDate={setIncomeExpenseDate}
      incomeExpenseAmount={incomeExpenseAmount}
      setIncomeExpenseAmount={setIncomeExpenseAmount}
      incomeExpenseType={incomeExpenseType}
      setIncomeExpenseType={setIncomeExpenseType}
      incomeExpenseNotes={incomeExpenseNotes}
      setIncomeExpenseNotes={setIncomeExpenseNotes}
      // 日記フォームの状態
      diaryDate={diaryDate}
      setDiaryDate={setDiaryDate}
      diaryTitle={diaryTitle}
      setDiaryTitle={setDiaryTitle}
      diaryContent={diaryContent}
      setDiaryContent={setDiaryContent}
      diaryMood={diaryMood}
      setDiaryMood={setDiaryMood}
      diaryActivities={diaryActivities}
      setDiaryActivities={setDiaryActivities}
      diaryTags={diaryTags}
      setDiaryTags={setDiaryTags}
      diaryIsPrivate={diaryIsPrivate}
      setDiaryIsPrivate={setDiaryIsPrivate}
      // 新しい日記項目の状態
      diaryWorkSummary={diaryWorkSummary}
      setDiaryWorkSummary={setDiaryWorkSummary}
      diaryAchievements={diaryAchievements}
      setDiaryAchievements={setDiaryAchievements}
      diaryChallenges={diaryChallenges}
      setDiaryChallenges={setDiaryChallenges}
      diaryLearnings={diaryLearnings}
      setDiaryLearnings={setDiaryLearnings}
      diaryNextGoals={diaryNextGoals}
      setDiaryNextGoals={setDiaryNextGoals}
      diaryEnergyLevel={diaryEnergyLevel}
      setDiaryEnergyLevel={setDiaryEnergyLevel}
      diaryStressLevel={diaryStressLevel}
      setDiaryStressLevel={setDiaryStressLevel}
      diaryWorkHours={diaryWorkHours}
      setDiaryWorkHours={setDiaryWorkHours}
      diaryBreakTime={diaryBreakTime}
      setDiaryBreakTime={setDiaryBreakTime}
      diaryProductivity={diaryProductivity}
      setDiaryProductivity={setDiaryProductivity}
      diaryNotes={diaryNotes}
      setDiaryNotes={setDiaryNotes}
      diaryGratitude={diaryGratitude}
      setDiaryGratitude={setDiaryGratitude}
      diaryReflection={diaryReflection}
      setDiaryReflection={setDiaryReflection}
      // 配列項目の一時入力状態
      newAchievement={newAchievement}
      setNewAchievement={setNewAchievement}
      newChallenge={newChallenge}
      setNewChallenge={setNewChallenge}
      newLearning={newLearning}
      setNewLearning={setNewLearning}
      newNextGoal={newNextGoal}
      setNewNextGoal={setNewNextGoal}
      // メモ関連の状態
      setShowMemos={uiState.setShowMemos}
      showMemoForm={showMemoForm}
      setShowMemoForm={setShowMemoForm}
      editingMemo={editingMemo}
      setEditingMemo={setEditingMemo}
      memoTitle={memoTitle}
      setMemoTitle={setMemoTitle}
      memoContent={memoContent}
      setMemoContent={setMemoContent}
      memoCategory={memoCategory}
      setMemoCategory={setMemoCategory}
      memoTags={memoTags}
      setMemoTags={setMemoTags}
      memoIsPublic={memoIsPublic}
      setMemoIsPublic={setMemoIsPublic}
      memoIsFamilyOnly={memoIsFamilyOnly}
      setMemoIsFamilyOnly={setMemoIsFamilyOnly}
      memoIsAdminOnly={memoIsAdminOnly}
      setMemoIsAdminOnly={setMemoIsAdminOnly}
      memoSearchTerm={memoSearchTerm}
      setMemoSearchTerm={setMemoSearchTerm}
      selectedMemoCategory={selectedMemoCategory}
      setSelectedMemoCategory={setSelectedMemoCategory}
      // 公開メモ関連の状態
      setShowPublicMemos={uiState.setShowPublicMemos}
      publicMemoSearchTerm={publicMemoSearchTerm}
      setPublicMemoSearchTerm={setPublicMemoSearchTerm}
      selectedPublicMemoCategory={selectedPublicMemoCategory}
      setSelectedPublicMemoCategory={setSelectedPublicMemoCategory}
      publicMemoCurrentDate={publicMemoCurrentDate}
      setPublicMemoCurrentDate={setPublicMemoCurrentDate}
      publicMemoSelectedDate={publicMemoSelectedDate}
      setPublicMemoSelectedDate={setPublicMemoSelectedDate}
      // 返信機能の状態
      replyingToMemo={replyingToMemo}
      setReplyingToMemo={setReplyingToMemo}
      replyContent={replyContent}
      setReplyContent={setReplyContent}
      editingReply={editingReply}
      setEditingReply={setEditingReply}
      editReplyContent={editReplyContent}
      setEditReplyContent={setEditReplyContent}
      // 本棚関連の状態
      setShowBookshelf={uiState.setShowBookshelf}
      showBookForm={showBookForm}
      setShowBookForm={setShowBookForm}
      editingBook={editingBook}
      setEditingBook={setEditingBook}
      bookTitle={bookTitle}
      setBookTitle={setBookTitle}
      bookAuthor={bookAuthor}
      setBookAuthor={setBookAuthor}
      bookIsbn={bookIsbn}
      setBookIsbn={setBookIsbn}
      bookPublishedYear={bookPublishedYear}
      setBookPublishedYear={setBookPublishedYear}
      bookTotalPages={bookTotalPages}
      setBookTotalPages={setBookTotalPages}
      bookCategory={bookCategory}
      setBookCategory={setBookCategory}
      bookNotes={bookNotes}
      setBookNotes={setBookNotes}
      selectedBookCategory={selectedBookCategory}
      setSelectedBookCategory={setSelectedBookCategory}
      // カレンダー関連の状態
      showCalendar={showCalendar}
      setShowCalendar={setShowCalendar}
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      showRecordDetail={showRecordDetail}
      setShowRecordDetail={setShowRecordDetail}
      selectedRecord={selectedRecord}
      setSelectedRecord={setSelectedRecord}
      selectedRecordType={selectedRecordType}
      setSelectedRecordType={setSelectedRecordType}
      // 月収支メモの状態
      monthlyMemo={monthlyMemo}
      setMonthlyMemo={setMonthlyMemo}
      editingMonthlyMemo={editingMonthlyMemo}
      setEditingMonthlyMemo={setEditingMonthlyMemo}
      // 料理タイマー関連の状態
      selectedRecipe={selectedRecipe}
      setSelectedRecipe={setSelectedRecipe}
      selectedEggType={selectedEggType}
      setSelectedEggType={setSelectedEggType}
      eggTimerActive={eggTimerActive}
      setEggTimerActive={setEggTimerActive}
      eggTimerPaused={eggTimerPaused}
      setEggTimerPaused={setEggTimerPaused}
      eggTimerTime={eggTimerTime}
      setEggTimerTime={setEggTimerTime}
      eggTimerInterval={eggTimerInterval}
      setEggTimerInterval={setEggTimerInterval}
      eggTimerSound={eggTimerSound}
      setEggTimerSound={setEggTimerSound}
      eggTimerOriginalTime={eggTimerOriginalTime}
      setEggTimerOriginalTime={setEggTimerOriginalTime}
      eggTimerPhase={eggTimerPhase}
      setEggTimerPhase={setEggTimerPhase}
      eggTimerPhaseTime={eggTimerPhaseTime}
      setEggTimerPhaseTime={setEggTimerPhaseTime}
      eggTimerPhaseName={eggTimerPhaseName}
      setEggTimerPhaseName={setEggTimerPhaseName}
      pauseEggTimer={pauseEggTimer}
      stopEggTimer={stopEggTimer}
      resetEggTimer={resetEggTimer}
      getEggTimerDuration={getEggTimerDuration}
      // 音響関連のハンドラー関数
      playBellSound={playBellSound}
      playChimeSound={playChimeSound}
      playBeepSound={playBeepSound}
      playAlarmSound={playAlarmSound}
      startSoundLoop={startSoundLoop}
      stopSoundLoop={stopSoundLoop}
      showBugReportModal={errorHandling.showBugReportModal}
      showUpdateRequestModal={errorHandling.showUpdateRequestModal}
      setShowCharacterHome={uiState.setShowCharacterHome}
      setShowProjects={uiState.setShowProjects}
      setShowCookingTimer={uiState.setShowCookingTimer}
      setShowSelfAnalysis={uiState.setShowSelfAnalysis}
      setShowReports={uiState.setShowReports}
      setShowAdminPanel={uiState.setShowAdminPanel}
      setShowTimeTracking={uiState.setShowTimeTracking}
      setShowTimers={uiState.setShowTimers}
      setShowWorkRecords={uiState.setShowWorkRecords}
      setShowSoundApp={uiState.setShowSoundApp}
      setShowNotifications={uiState.setShowNotifications}
      setShowVersionInfo={uiState.setShowVersionInfo}
      setShowThemeSettings={uiState.setShowThemeSettings}
      setShowFontSettings={uiState.setShowFontSettings}
      setShowFeatureSettings={uiState.setShowFeatureSettings}
      setShowBugReportModal={errorHandling.setShowBugReportModal}
      setShowUpdateRequestModal={errorHandling.setShowUpdateRequestModal}
      closeOtherFeatures={uiState.closeOtherFeatures}
      onUpdateRequestSubmit={handleUpdateRequest}
      onBugReportSubmit={handleBugReport}
      loadProjects={loadProjects}
      loadTimeEntries={loadTimeEntries}
      loadBooks={loadBooks}
      loadMemos={loadMemos}
      loadPublicMemos={loadPublicMemos}
      loadAdminUsers={loadAdminUsers}
      loadReportSummary={loadReportSummary}
      loadIncomeExpenseRecords={loadIncomeExpenseRecords}
      loadWorkDiaries={loadWorkDiaries}
      handleStartTracking={handleStartTracking}
      handleStopTracking={handleStopTracking}
      handleResetTracking={handleResetTracking}
      handleCreateIncomeExpenseRecord={handleCreateIncomeExpenseRecord}
      handleCreateDiary={handleCreateDiary}
      loadUserSettings={loadUserSettings}
      getVisibleFeatures={getVisibleFeatures}
      // 追加のプロパティ（App_backup.tsxから復元）
      projects={projects}
      books={books}
      memos={memos}
      publicMemos={publicMemos}
      adminUsers={adminUsers}
      reportSummary={reportSummary}
      selectedProject={selectedProject}
      setSelectedProject={setSelectedProject}
      showProjectForm={showProjectForm}
      setShowProjectForm={setShowProjectForm}
      projectName={projectName}
      setProjectName={setProjectName}
      projectDescription={projectDescription}
      setProjectDescription={setProjectDescription}
      projectColor={projectColor}
      setProjectColor={setProjectColor}
      handleCreateProject={handleCreateProject}
      handleCreateBook={handleCreateBook}
      handleUpdateBook={handleUpdateBook}
      handleEditBook={handleEditBook}
      handleDeleteBook={handleDeleteBook}
      handleBookCategoryChange={handleBookCategoryChange}
      getReadingProgress={getReadingProgress}
      handleCreateMemo={handleCreateMemo}
      // タイマー関連のプロパティ
      customTimerActive={customTimerActive}
      setCustomTimerActive={setCustomTimerActive}
      customTimerPaused={customTimerPaused}
      setCustomTimerPaused={setCustomTimerPaused}
      customTimerTime={customTimerTime}
      setCustomTimerTime={setCustomTimerTime}
      customTimerInterval={customTimerInterval}
      setCustomTimerInterval={setCustomTimerInterval}
      customTimerMinutes={customTimerMinutes}
      setCustomTimerMinutes={setCustomTimerMinutes}
      customTimerSeconds={customTimerSeconds}
      setCustomTimerSeconds={setCustomTimerSeconds}
      customTimerName={customTimerName}
      setCustomTimerName={setCustomTimerName}
      customTimerSound={customTimerSound}
      setCustomTimerSound={setCustomTimerSound}
      customTimerOriginalTime={customTimerOriginalTime}
      setCustomTimerOriginalTime={setCustomTimerOriginalTime}
      startCustomTimer={startCustomTimer}
      pauseCustomTimer={pauseCustomTimer}
      stopCustomTimer={stopCustomTimer}
      resetCustomTimer={resetCustomTimer}
      // 料理タイマー関連のプロパティ
      selectedEggType={selectedEggType}
      setSelectedEggType={setSelectedEggType}
      eggTimerActive={eggTimerActive}
      setEggTimerActive={setEggTimerActive}
      eggTimerPaused={eggTimerPaused}
      setEggTimerPaused={setEggTimerPaused}
      eggTimerTime={eggTimerTime}
      setEggTimerTime={setEggTimerTime}
      eggTimerInterval={eggTimerInterval}
      setEggTimerInterval={setEggTimerInterval}
      eggTimerType={eggTimerType}
      setEggTimerType={setEggTimerType}
      eggTimerSound={eggTimerSound}
      setEggTimerSound={setEggTimerSound}
      eggTimerOriginalTime={eggTimerOriginalTime}
      setEggTimerOriginalTime={setEggTimerOriginalTime}
      eggTimerPhase={eggTimerPhase}
      setEggTimerPhase={setEggTimerPhase}
      eggTimerPhaseTime={eggTimerPhaseTime}
      setEggTimerPhaseTime={setEggTimerPhaseTime}
      eggTimerPhaseName={eggTimerPhaseName}
      setEggTimerPhaseName={setEggTimerPhaseName}
      startEggTimer={startEggTimer}
      pauseEggTimer={pauseEggTimer}
      stopEggTimer={stopEggTimer}
      resetEggTimer={resetEggTimer}
      getEggTimerDuration={getEggTimerDuration}
      // 音声関連のプロパティ
      soundLoopInterval={soundLoopInterval}
      setSoundLoopInterval={setSoundLoopInterval}
      isSoundPlaying={isSoundPlaying}
      setIsSoundPlaying={setIsSoundPlaying}
      playEggTimerSound={playEggTimerSound}
      startSoundLoop={startSoundLoop}
      stopSoundLoop={stopSoundLoop}
      // タイマープリセット関連のプロパティ
      timerPresets={timerPresets}
      setTimerPresets={setTimerPresets}
      timerHistory={timerHistory}
      setTimerHistory={setTimerHistory}
      addToTimerHistory={addToTimerHistory}
      // 時間フォーマット関数
      formatTime={formatTime}
      formatEggTimerTime={formatEggTimerTime}
      // 通知機能
      sendNotification={sendNotification}
      // カレンダー関連のプロパティ
      showCalendar={showCalendar}
      setShowCalendar={setShowCalendar}
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      showRecordDetail={showRecordDetail}
      setShowRecordDetail={setShowRecordDetail}
      selectedRecord={selectedRecord}
      setSelectedRecord={setSelectedRecord}
      selectedRecordType={selectedRecordType}
      setSelectedRecordType={setSelectedRecordType}
      // 月収支メモ関連のプロパティ
      monthlyMemo={monthlyMemo}
      setMonthlyMemo={setMonthlyMemo}
      editingMonthlyMemo={editingMonthlyMemo}
      setEditingMonthlyMemo={setEditingMonthlyMemo}
      loadMonthlyMemo={loadMonthlyMemo}
      saveMonthlyMemo={saveMonthlyMemo}
      startEditingMonthlyMemo={startEditingMonthlyMemo}
      cancelEditingMonthlyMemo={cancelEditingMonthlyMemo}
      // カレンダー操作関数
      navigateMonth={navigateMonth}
      openDiaryForm={openDiaryForm}
      openIncomeExpenseForm={openIncomeExpenseForm}
      // カスタムカテゴリ管理
      customCategories={customCategories}
      setCustomCategories={setCustomCategories}
      newGenreName={newGenreName}
      setNewGenreName={setNewGenreName}
      handleAddCategory={handleAddCategory}
      handleDeleteCategory={handleDeleteCategory}
      getAllGenres={getAllGenres}
    />
  );
}

const AppWithProviders = () => {
  return (
    <LoadingStateProvider>
      <TimeTrackingStateProvider user={null}>
        <TimerPresetProvider
          onStartTimer={() => {}}
          onStopTimer={() => {}}
          onResetTimer={() => {}}
          isTimerActive={false}
        >
          <MoodLogProvider>
            <App />
          </MoodLogProvider>
        </TimerPresetProvider>
      </TimeTrackingStateProvider>
    </LoadingStateProvider>
  );
};

export default AppWithProviders;
