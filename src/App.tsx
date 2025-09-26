import React, { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import MainLayout from "./components/MainLayout";
import { useAuth } from "./hooks/useAuth";
import { useErrorHandling } from "./hooks/useErrorHandling";
import { useDataFetching } from "./hooks/useDataFetching";
import { useUIState } from "./hooks/useUIState";
import {
  LoadingStateProvider,
  useLoadingState,
} from "./components/LoadingStateManager";
import {
  TimeTrackingStateProvider,
  useTimeTrackingState,
  useTimeTrackingHelpers,
} from "./components/TimeTrackingStateManager";
import { TimerPresetProvider } from "./components/TimerPresetManager";
import {
  FontSettings,
  DEFAULT_FONT_SETTINGS,
  generateFontCSS,
} from "./constants/fonts";
import LanguageFontSettings from "./components/LanguageFontSettings";
import {
  MoodLogProvider,
  useMoodLogState,
  useMoodLogHelpers,
} from "./components/MoodLogManager";
import SimpleErrorReportingModal from "./components/SimpleErrorReportingModal";
import UpdateRequestModal from "./components/UpdateRequestModal";
import BugReportModal from "./components/BugReportModal";
import { setErrorReportCallback } from "./utils/apiClient";
import {
  User,
  TimeEntry,
  Project,
  Book,
  Memo,
  IncomeExpenseRecord,
  WorkDiary,
  AdminUser,
} from "./types";

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

  // タイマープリセット状態の管理（TimerPresetProviderから提供される）

  // 感情ログ状態の管理
  const moodLogState = useMoodLogState();
  const moodLogHelpers = useMoodLogHelpers();

  // カスタムフックの使用
  const auth = useAuth();
  const errorHandling = useErrorHandling();
  const dataFetching = useDataFetching(auth.isLoggedIn, auth.user);
  const uiState = useUIState();

  // データフェッチングの状態（useDataFetchingフックから取得）
  const {
    projects,
    setProjects,
    books,
    setBooks,
    memos,
    setMemos,
    publicMemos,
    setPublicMemos,
    incomeExpenseRecords,
    setIncomeExpenseRecords,
    workDiaries,
    setWorkDiaries,
    adminUsers,
    setAdminUsers,
    reportSummary,
    setReportSummary,
    loadMemos,
    loadPublicMemos,
    loadProjects,
    loadBooks,
    loadIncomeExpenseRecords,
    loadWorkDiaries,
    loadAdminUsers,
    loadReportSummary,
  } = dataFetching;

  // workRecordsの状態を独自に定義
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);

  // loadWorkRecords関数を独自に定義（必要な場合）
  const loadWorkRecords = async () => {
    console.log("App.tsx - Loading work records");
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/work-records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setWorkRecords(data.records || []);
      }
    } catch (error) {
      console.error("Failed to load work records:", error);
    }
  };

  // loadTimeEntries関数も定義（必要な場合）
  const loadTimeEntries = async () => {
    console.log("App.tsx - Loading time entries");
    // 実装は後で追加
  };

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
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerTime, setCustomTimerTime] = useState(0);
  const [customTimerInterval, setCustomTimerInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerName, setCustomTimerName] = useState("");
  const [customTimerSound, setCustomTimerSound] = useState<
    "bell" | "chime" | "beep" | "alarm"
  >("bell");
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
  const [timerHistory, setTimerHistory] = useState<
    Array<{
      id: string;
      name: string;
      duration: number;
      completedAt: Date;
      type: "custom" | "egg" | "preset";
    }>
  >([]);

  // 料理タイマーの状態
  const [selectedRecipe, setSelectedRecipe] = useState<string>("egg");
  const [selectedEggType, setSelectedEggType] = useState<
    "soft" | "medium" | "hard"
  >("medium");
  const [eggTimerActive, setEggTimerActive] = useState(false);
  const [eggTimerPaused, setEggTimerPaused] = useState(false);
  const [eggTimerTime, setEggTimerTime] = useState(0);
  const [eggTimerInterval, setEggTimerInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [eggTimerType, setEggTimerType] = useState<"soft" | "medium" | "hard">(
    "medium"
  );
  const [eggTimerSound, setEggTimerSound] = useState<
    "bell" | "chime" | "beep" | "alarm"
  >("bell");
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = useState(0);
  const [eggTimerPhase, setEggTimerPhase] = useState<
    "heating" | "boiling" | "cooking"
  >("heating");
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = useState(0);
  const [eggTimerPhaseName, setEggTimerPhaseName] = useState("");

  // 音声ループ再生の状態
  const [soundLoopInterval, setSoundLoopInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // バックグラウンドタイマー関連の状態
  const [backgroundTimerActive, setBackgroundTimerActive] = useState(false);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(
    null
  );
  const [isMannerMode, setIsMannerMode] = useState(false);

  // タイマー設定の状態
  const [timerSettings, setTimerSettings] = useState({
    eggTimerSound: "bell" as "bell" | "chime" | "beep" | "alarm",
    customTimerSound: "bell" as "bell" | "chime" | "beep" | "alarm",
    enableNotifications: true,
    enableSounds: true,
    defaultCustomMinutes: 5,
    defaultCustomSeconds: 0,
    theme: "default" as "default" | "dark" | "colorful" | "minimal",
    customColors: {
      primary: "#3b82f6",
      secondary: "#10b981",
      accent: "#f59e0b",
      background: "#ffffff",
    },
  });

  // フォント設定関連の状態
  const [selectedFont, setSelectedFont] = useState("system");
  const [fontSettings, setFontSettings] = useState<FontSettings>(
    DEFAULT_FONT_SETTINGS
  );
  const [showFontSettings, setShowFontSettings] = useState(false);
  const [showLanguageFontSettings, setShowLanguageFontSettings] =
    useState(false);

  // テーマ設定関連の状態
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showFeatureSettings, setShowFeatureSettings] = useState(false);

  // 利用可能なテーマの定義
  const availableThemes = [
    { value: "default", label: "デフォルト", preview: "🎨" },
    { value: "dark", label: "ダーク", preview: "🌙" },
    { value: "ocean", label: "オーシャン", preview: "🌊" },
    { value: "forest", label: "フォレスト", preview: "🌲" },
    { value: "sunset", label: "サンセット", preview: "🌅" },
    { value: "rainbow", label: "レインボー", preview: "🌈" },
    { value: "space", label: "スペース", preview: "🚀" },
    { value: "candy", label: "キャンディ", preview: "🍭" },
    { value: "pastel", label: "パステル", preview: "🎀" },
    { value: "neon", label: "ネオン", preview: "💡" },
    { value: "simple", label: "シンプル", preview: "📝" },
  ];

  // 利用可能なフォントの定義
  const availableFonts = [
    { value: "system", label: "システムフォント" },
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Trebuchet MS", label: "Trebuchet MS" },
    { value: "Arial Black", label: "Arial Black" },
    { value: "Impact", label: "Impact" },
    { value: "Comic Sans MS", label: "Comic Sans MS" },
    { value: "Courier New", label: "Courier New" },
    { value: "Lucida Console", label: "Lucida Console" },
    { value: "Palatino", label: "Palatino" },
    { value: "Garamond", label: "Garamond" },
    { value: "Bookman", label: "Bookman" },
    { value: "Avant Garde", label: "Avant Garde" },
    { value: "Helvetica Neue", label: "Helvetica Neue" },
    { value: "Futura", label: "Futura" },
    { value: "Gill Sans", label: "Gill Sans" },
    { value: "Optima", label: "Optima" },
    { value: "Baskerville", label: "Baskerville" },
    { value: "Didot", label: "Didot" },
    { value: "Bodoni", label: "Bodoni" },
    { value: "Calibri", label: "Calibri" },
    { value: "Cambria", label: "Cambria" },
    { value: "Candara", label: "Candara" },
    { value: "Consolas", label: "Consolas" },
    { value: "Constantia", label: "Constantia" },
    { value: "Corbel", label: "Corbel" },
    { value: "Franklin Gothic", label: "Franklin Gothic" },
    { value: "Segoe UI", label: "Segoe UI" },
    { value: "Tahoma", label: "Tahoma" },
    { value: "Yu Gothic", label: "游ゴシック" },
    { value: "Hiragino Sans", label: "ヒラギノ角ゴ" },
    { value: "Noto Sans JP", label: "Noto Sans JP" },
    { value: "Meiryo", label: "メイリオ" },
    { value: "MS Gothic", label: "MS ゴシック" },
    { value: "MS Mincho", label: "MS 明朝" },
  ];

  // 追加のUI状態（App_backup.tsxから復元）
  const [showDiaryReminderSettings, setShowDiaryReminderSettings] =
    useState(false);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [diaryReminderSnoozeUntil, setDiaryReminderSnoozeUntil] = useState<
    number | null
  >(null);

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
  const [editingIncomeExpenseRecord, setEditingIncomeExpenseRecord] =
    useState<any>(null);
  const [editingDiary, setEditingDiary] = useState<any>(null);

  // 収入・支出記録フォームの状態
  const [incomeExpenseDate, setIncomeExpenseDate] = useState("");
  const [incomeExpenseAmount, setIncomeExpenseAmount] = useState("");
  const [incomeExpenseType, setIncomeExpenseType] = useState<
    "income" | "expense"
  >("income");
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
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);

  // カレンダーの状態
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<
    "income" | "expense" | "diary" | null
  >("income");

  // 月収支メモの状態
  const [monthlyMemo, setMonthlyMemo] = useState("");
  const [editingMonthlyMemo, setEditingMonthlyMemo] = useState(false);

  // ジャンル管理の状態
  const [showGenreManagement, setShowGenreManagement] = useState(false);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");

  // お仕事記録の状態
  const [showWorkRecords, setShowWorkRecords] = useState(false);

  // EggTimerComponent用の状態
  const [showEggTimer, setShowEggTimer] = useState(false);

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
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] =
    useState("all");
  const [publicMemoCurrentDate, setPublicMemoCurrentDate] = useState(
    new Date()
  );
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] =
    useState<Date | null>(null);

  // 本棚関連の状態
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookPublishedYear, setBookPublishedYear] = useState(
    new Date().getFullYear()
  );
  const [bookTotalPages, setBookTotalPages] = useState(0);
  const [bookCategory, setBookCategory] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [selectedBookCategory, setSelectedBookCategory] = useState("all");

  // エラーレポートコールバックの設定
  useEffect(() => {
    setErrorReportCallback(errorHandling.handleApiErrorReport);
  }, [errorHandling.handleApiErrorReport]);

  // 音声とタイマー設定の初期化
  useEffect(() => {
    initializeAudio();
    loadTimerSettings();
    loadTimerHistory();
  }, []);

  // フォント設定の読み込みと適用
  useEffect(() => {
    const savedFont = localStorage.getItem("selectedFont");
    const savedFontSettings = localStorage.getItem("fontSettings");

    if (savedFontSettings) {
      try {
        const settings = JSON.parse(savedFontSettings);
        setFontSettings(settings);
        applyLanguageFonts(settings);
      } catch (error) {
        console.error("フォント設定の読み込みに失敗しました:", error);
      }
    } else if (savedFont) {
      setSelectedFont(savedFont);
      // 少し遅延してからフォントを適用（DOMが完全に読み込まれてから）
      setTimeout(() => {
        applyFont(savedFont);
      }, 100);
    }
  }, []);

  // テーマ設定の読み込みと適用
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // 更新要望のハンドラー
  const handleUpdateRequest = async (updateRequest: {
    title: string;
    content: string;
    priority: string;
    category: string;
  }) => {
    console.log("App.tsx - Update request submitted:", updateRequest);
    try {
      // API呼び出しの実装
      console.log("Update request sent successfully");
    } catch (error) {
      console.error("Failed to send update request:", error);
    }
  };

  // 不具合報告のハンドラー
  const handleBugReport = async (bugReport: {
    title: string;
    content: string;
    severity: string;
    category: string;
  }) => {
    console.log("App.tsx - Bug report submitted:", bugReport);
    try {
      // API呼び出しの実装
      console.log("Bug report sent successfully");
    } catch (error) {
      console.error("Failed to send bug report:", error);
    }
  };

  // 収入・支出記録の作成（App_backup.tsxから復元）
  const handleCreateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("App.tsx - Creating income/expense record");
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
        console.log("Income/expense record created successfully");
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error("Failed to create income/expense record:", data.message);
      }
    } catch (error) {
      console.error("Error creating income/expense record:", error);
    }
  };

  // 日記の作成（App_backup.tsxから復元）
  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("App.tsx - Creating diary");
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
          tags: diaryTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
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
        console.log("Diary created successfully");
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
        console.error("Failed to create diary:", data.message);
      }
    } catch (error) {
      console.error("Error creating diary:", error);
    }
  };

  // 収入・支出記録の更新（App_backup.tsxから復元）
  const handleUpdateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncomeExpenseRecord) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/work-records/salary/${editingIncomeExpenseRecord.id}`,
        {
          method: "PUT",
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
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("Income/expense record updated successfully");
        setEditingIncomeExpenseRecord(null);
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error("Failed to update income/expense record:", data.message);
      }
    } catch (error) {
      console.error("Error updating income/expense record:", error);
    }
  };

  // 日記の更新（App_backup.tsxから復元）
  const handleUpdateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiary) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `/api/work-records/diary/${editingDiary.id}`,
        {
          method: "PUT",
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
            tags: diaryTags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
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
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("Diary updated successfully");
        setEditingDiary(null);
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
        console.error("Failed to update diary:", data.message);
      }
    } catch (error) {
      console.error("Error updating diary:", error);
    }
  };

  // 収入・支出記録の削除（App_backup.tsxから復元）
  const handleDeleteIncomeExpenseRecord = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/work-records/salary/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log("Income/expense record deleted successfully");
        loadIncomeExpenseRecords();
      } else {
        console.error("Failed to delete income/expense record:", data.message);
      }
    } catch (error) {
      console.error("Error deleting income/expense record:", error);
    }
  };

  // 日記の削除（App_backup.tsxから復元）
  const handleDeleteDiary = async (id: string) => {
    if (!confirm("この日記を削除しますか？")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/work-records/diary/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log("Diary deleted successfully");
        loadWorkDiaries();
      } else {
        console.error("Failed to delete diary:", data.message);
      }
    } catch (error) {
      console.error("Error deleting diary:", error);
    }
  };

  // 時間記録ハンドラー（App_backup.tsxから復元）
  const handleStartTracking = async () => {
    console.log("App.tsx - Starting time tracking");
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
        console.log("Time tracking started successfully");
        loadTimeEntries();
      } else {
        console.error("Failed to start time tracking:", data.message);
      }
    } catch (error) {
      console.error("Error starting time tracking:", error);
    }
  };

  const handleStopTracking = async () => {
    console.log("App.tsx - Stopping time tracking");
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
        console.log("Time tracking stopped successfully");
        loadTimeEntries();
      } else {
        console.error("Failed to stop time tracking:", data.message);
      }
    } catch (error) {
      console.error("Error stopping time tracking:", error);
    }
  };

  const handleResetTracking = () => {
    console.log("App.tsx - Resetting time tracking");
    // 時間記録リセット処理
  };

  // プロジェクト作成ハンドラー（App_backup.tsxから復元）
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("App.tsx - Creating project");
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
        console.log("Project created successfully");
        setProjectName("");
        setProjectDescription("");
        setProjectColor("#3b82f6");
        setShowProjectForm(false);
        loadProjects();
      } else {
        console.error("Failed to create project:", data.message);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // 本作成ハンドラー（App_backup.tsxから復元）
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("App.tsx - Creating book");
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
        console.log("Book created successfully");
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
        console.error("Failed to create book:", data.message);
      }
    } catch (error) {
      console.error("Error creating book:", error);
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !bookTitle.trim()) {
      return;
    }

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
    if (!confirm("この本を削除しますか？")) {
      return;
    }

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
    if (!book.totalPages || book.totalPages === 0) {
      return 0;
    }
    return Math.round(((book.currentPage || 0) / book.totalPages) * 100);
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
    setEggTimerTime(
      getEggTimerDuration(eggTimerType as "soft" | "medium" | "hard")
    );
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
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1.0
    );

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
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.8
    );

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
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1.0
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    if (!timerSettings.enableSounds || isSoundPlaying) {
      return;
    }

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
        playFallbackSound();
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

  // フォールバック音声の再生
  const playFallbackSound = () => {
    try {
      // より確実なフォールバック音声
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU4k9n1unEiBS13yO/eizEIHWq+8+OWT"
      );
      audio.play().catch((error) => {
        console.error("フォールバック音声再生エラー:", error);
      });
    } catch (error) {
      console.error("フォールバック音声作成エラー:", error);
    }
  };

  // 音声再生の初期化（ユーザージェスチャー後に実行）
  const initializeAudio = () => {
    // AudioContextの初期化は遅延させる
    const initAudioOnUserGesture = () => {
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        if (audioContext.state === "suspended") {
          audioContext.resume();
        }
        console.log("AudioContext初期化完了");
      } catch (error) {
        console.warn("AudioContext初期化エラー:", error);
      }
    };

    // ユーザーの最初の操作でAudioContextを初期化
    const events = ["click", "touchstart", "keydown"];
    const initOnce = () => {
      initAudioOnUserGesture();
      events.forEach((event) => {
        document.removeEventListener(event, initOnce);
      });
    };

    events.forEach((event) => {
      document.addEventListener(event, initOnce, { once: true });
    });
  };

  // タイマー履歴の保存
  const saveTimerHistory = (history: typeof timerHistory) => {
    const serializedHistory = history.map((item) => ({
      ...item,
      completedAt: item.completedAt.toISOString(),
    }));
    localStorage.setItem("timerHistory", JSON.stringify(serializedHistory));
  };

  // タイマー履歴の読み込み
  const loadTimerHistory = () => {
    try {
      const saved = localStorage.getItem("timerHistory");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimerHistory(
          parsed.map((item: any) => ({
            ...item,
            completedAt: new Date(item.completedAt),
          }))
        );
      }
    } catch (error) {
      console.error("タイマー履歴の読み込みエラー:", error);
    }
  };

  // フォント適用関数
  const applyFont = (fontValue: string) => {
    const { documentElement: root, body } = document;

    if (fontValue === "system") {
      root.style.setProperty("--app-font-family", "");
      body.style.fontFamily = "";
      // すべての要素にフォントをリセット
      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        (el as HTMLElement).style.fontFamily = "";
      });
    } else {
      root.style.setProperty("--app-font-family", fontValue);
      body.style.fontFamily = fontValue;
      // すべての要素に直接フォントを適用
      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        (el as HTMLElement).style.fontFamily = fontValue;
      });
    }
  };

  // 言語別フォント適用関数
  const applyLanguageFonts = (settings: FontSettings) => {
    const root = document.documentElement;
    const css = generateFontCSS(settings);

    // 既存のフォントCSSを削除
    const existingStyle = document.getElementById("language-font-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // 新しいフォントCSSを追加
    const style = document.createElement("style");
    style.id = "language-font-styles";
    style.textContent = css;
    document.head.appendChild(style);

    // 日本語テキストに日本語フォントを適用
    const japaneseFont =
      settings.japanese === "system"
        ? "var(--japanese-font)"
        : settings.japanese;

    // 英語テキストに英語フォントを適用
    const englishFont =
      settings.english === "system" ? "var(--english-font)" : settings.english;

    // 全要素に言語別フォントを適用
    const allElements = document.querySelectorAll("*");
    allElements.forEach((element) => {
      const text = element.textContent || "";
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
        text
      );
      const hasEnglish = /[a-zA-Z]/.test(text);

      if (hasJapanese && hasEnglish) {
        // 日本語と英語が混在する場合は日本語フォントを優先
        (element as HTMLElement).style.fontFamily = japaneseFont;
      } else if (hasJapanese) {
        (element as HTMLElement).style.fontFamily = japaneseFont;
      } else if (hasEnglish) {
        (element as HTMLElement).style.fontFamily = englishFont;
      }
    });
  };

  // フォント変更ハンドラー
  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    applyFont(fontValue);
    localStorage.setItem("selectedFont", fontValue);

    // より強力なフォント適用 - 少し遅延して再適用
    setTimeout(() => {
      applyFont(fontValue);
    }, 100);

    // さらに遅延して最終確認
    setTimeout(() => {
      applyFont(fontValue);
    }, 500);
  };

  // 言語別フォント設定保存ハンドラー
  const handleLanguageFontSave = (settings: FontSettings) => {
    setFontSettings(settings);
    applyLanguageFonts(settings);
    localStorage.setItem("fontSettings", JSON.stringify(settings));
  };

  // テーマ適用関数
  const applyTheme = (themeValue: string) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeValue);

    // 強制的にCSS変数を適用
    if (themeValue === "dark") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #68d391 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #4a5568 0%, #68d391 100%)"
      );
      root.style.setProperty("--accent-color", "#68d391");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#1a202c");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #2d3748 0%, #4a5568 100%)"
      );
    } else if (themeValue === "ocean") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #06b6d4 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #0284c7 0%, #06b6d4 100%)"
      );
      root.style.setProperty("--accent-color", "#06b6d4");
      root.style.setProperty("--text-color", "#0f172a");
      root.style.setProperty("--bg-color", "#f0f9ff");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)"
      );
    } else if (themeValue === "forest") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #22c55e 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #15803d 0%, #22c55e 100%)"
      );
      root.style.setProperty("--accent-color", "#22c55e");
      root.style.setProperty("--text-color", "#14532d");
      root.style.setProperty("--bg-color", "#f0fdf4");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)"
      );
    } else if (themeValue === "sunset") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #ea580c 0%, #fb923c 100%)"
      );
      root.style.setProperty("--accent-color", "#fb923c");
      root.style.setProperty("--text-color", "#9a3412");
      root.style.setProperty("--bg-color", "#fff7ed");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #fed7aa 0%, #fdba74 100%)"
      );
    } else if (themeValue === "rainbow") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #a78bfa 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #7c3aed 0%, #a78bfa 100%)"
      );
      root.style.setProperty("--accent-color", "#a78bfa");
      root.style.setProperty("--text-color", "#581c87");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #e9d5ff 0%, #ddd6fe 100%)"
      );
    } else if (themeValue === "space") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #1e293b 0%, #334155 50%, #6366f1 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #334155 0%, #6366f1 100%)"
      );
      root.style.setProperty("--accent-color", "#6366f1");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#0f172a");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #1e293b 0%, #334155 100%)"
      );
    } else if (themeValue === "candy") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f472b6 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #db2777 0%, #f472b6 100%)"
      );
      root.style.setProperty("--accent-color", "#f472b6");
      root.style.setProperty("--text-color", "#831843");
      root.style.setProperty("--bg-color", "#fdf2f8");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #fce7f3 0%, #fbcfe8 100%)"
      );
    } else if (themeValue === "pastel") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #c4b5fd 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #8b5cf6 0%, #c4b5fd 100%)"
      );
      root.style.setProperty("--accent-color", "#c4b5fd");
      root.style.setProperty("--text-color", "#581c87");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #f3e8ff 0%, #ede9fe 100%)"
      );
    } else if (themeValue === "neon") {
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #059669 0%, #34d399 100%)"
      );
      root.style.setProperty("--accent-color", "#34d399");
      root.style.setProperty("--text-color", "#064e3b");
      root.style.setProperty("--bg-color", "#ecfdf5");
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%)"
      );
    } else if (themeValue === "simple") {
      root.style.setProperty("--primary-color", "#f8f6f0");
      root.style.setProperty("--secondary-color", "#e0ddd6");
      root.style.setProperty("--accent-color", "#6b7280");
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty("--bg-color", "#ffffff");
      root.style.setProperty("--card-bg", "#f9f9f9");
    } else {
      // デフォルトテーマ
      root.style.setProperty("--primary-color", "");
      root.style.setProperty("--secondary-color", "");
      root.style.setProperty("--accent-color", "");
      root.style.setProperty("--text-color", "");
      root.style.setProperty("--bg-color", "");
      root.style.setProperty("--card-bg", "");
    }
  };

  // テーマ変更ハンドラー
  const handleThemeChange = (themeValue: string) => {
    setSelectedTheme(themeValue);
    applyTheme(themeValue);
    localStorage.setItem("selectedTheme", themeValue);

    // 強制的にスタイルを再適用
    setTimeout(() => {
      applyTheme(themeValue);
      // さらに強制的にDOM要素のスタイルを更新
      const { body } = document;
      const dashboard = document.querySelector(".dashboard");
      const header = document.querySelector(".dashboard-header");
      const timeSection = document.querySelector(".time-tracking-section");

      if (dashboard) {
        (dashboard as HTMLElement).style.background = "";
      }
      if (header) {
        (header as HTMLElement).style.background = "";
      }
      if (timeSection) {
        (timeSection as HTMLElement).style.background = "";
      }
    }, 100);
  };

  // メモ作成ハンドラー（App_backup.tsxから復元）
  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("App.tsx - Creating memo");
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
        console.log("Memo created successfully");
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
        console.error("Failed to create memo:", data.message);
      }
    } catch (error) {
      console.error("Error creating memo:", error);
    }
  };

  // タイマー関連のハンドラー（App_backup.tsxから復元）
  const startCustomTimer = () => {
    if (customTimerActive && !customTimerPaused) {
      return;
    }

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
    if (eggTimerActive && !eggTimerPaused) {
      return;
    }

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
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

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
      playFallbackSound();
    }
  };

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatEggTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // タイマー履歴の管理
  const addToTimerHistory = (
    name: string,
    duration: number,
    type: "custom" | "egg" | "preset"
  ) => {
    const newEntry = {
      id: Date.now().toString(),
      name,
      duration,
      completedAt: new Date(),
      type,
    };
    const newHistory = [newEntry, ...timerHistory.slice(0, 49)]; // 最新50件まで保持
    setTimerHistory(newHistory);
    saveTimerHistory(newHistory);
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
    if (
      newGenreName.trim() &&
      !customCategories.includes(newGenreName.trim())
    ) {
      const updatedCategories = [...customCategories, newGenreName.trim()];
      setCustomCategories(updatedCategories);
      localStorage.setItem(
        "customCategories",
        JSON.stringify(updatedCategories)
      );
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
    console.log("App.tsx - Loading user settings");
    // ユーザー設定の読み込み
  };

  // タイマー設定の保存
  const saveTimerSettings = (newSettings: typeof timerSettings) => {
    setTimerSettings(newSettings);
    localStorage.setItem("timerSettings", JSON.stringify(newSettings));
  };

  // タイマー設定の読み込み
  const loadTimerSettings = () => {
    try {
      const saved = localStorage.getItem("timerSettings");
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setTimerSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Failed to load timer settings:", error);
    }
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
    { id: "sound-app", name: "サウンドアプリ", icon: "🎵" },
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
    <TimerPresetProvider
      onStartTimer={(minutes: number, seconds: number, name: string) => {
        const totalSeconds = minutes * 60 + seconds;
        setCustomTimerTime(totalSeconds);
        setCustomTimerOriginalTime(totalSeconds);
        setCustomTimerName(name);
        startCustomTimer();
      }}
      onStopTimer={stopCustomTimer}
      onResetTimer={resetCustomTimer}
      isTimerActive={customTimerActive}
    >
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
        showEggTimer={showEggTimer}
        showPublicMemos={uiState.showPublicMemos}
        showWorkRecords={uiState.showWorkRecords}
        showSoundApp={uiState.showSoundApp}
        showNotifications={uiState.showNotifications}
        showVersionInfo={uiState.showVersionInfo}
        showThemeSettings={uiState.showThemeSettings}
        showFontSettings={uiState.showFontSettings}
        showFeatureSettings={uiState.showFeatureSettings}
        showDiaryReminderSettings={showDiaryReminderSettings}
        setShowDiaryReminderSettings={setShowDiaryReminderSettings}
        showMoodForm={showMoodForm}
        setShowMoodForm={setShowMoodForm}
        showGoalForm={showGoalForm}
        setShowGoalForm={setShowGoalForm}
        // 日記リマインダー関連
        diaryReminderSnoozeUntil={diaryReminderSnoozeUntil}
        setDiaryReminderSnoozeUntil={setDiaryReminderSnoozeUntil}
        openDiaryForm={openDiaryForm}
        // UI設定関連
        selectedTheme={selectedTheme}
        selectedFont={selectedFont}
        fontSettings={fontSettings}
        showLanguageFontSettings={showLanguageFontSettings}
        setShowLanguageFontSettings={setShowLanguageFontSettings}
        handleThemeChange={handleThemeChange}
        handleFontChange={handleFontChange}
        handleLanguageFontSave={handleLanguageFontSave}
        availableThemes={availableThemes}
        availableFonts={availableFonts}
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
        setShowEggTimer={setShowEggTimer}
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
        handleUpdateIncomeExpenseRecord={handleUpdateIncomeExpenseRecord}
        handleUpdateDiary={handleUpdateDiary}
        handleDeleteIncomeExpenseRecord={handleDeleteIncomeExpenseRecord}
        handleDeleteDiary={handleDeleteDiary}
        loadUserSettings={loadUserSettings}
        getVisibleFeatures={getVisibleFeatures}
        // 追加のプロパティ（App_backup.tsxから復元）
        projects={projects}
        books={books}
        memos={memos}
        publicMemos={publicMemos}
        adminUsers={adminUsers}
        reportSummary={reportSummary}
        incomeExpenseRecords={incomeExpenseRecords}
        workDiaries={workDiaries}
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
        eggTimerType={eggTimerType}
        setEggTimerType={setEggTimerType}
        startEggTimer={startEggTimer}
        // 音声関連のプロパティ
        soundLoopInterval={soundLoopInterval}
        setSoundLoopInterval={setSoundLoopInterval}
        isSoundPlaying={isSoundPlaying}
        setIsSoundPlaying={setIsSoundPlaying}
        playEggTimerSound={playEggTimerSound}
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
        // 月収支メモ関連のプロパティ
        loadMonthlyMemo={loadMonthlyMemo}
        saveMonthlyMemo={saveMonthlyMemo}
        startEditingMonthlyMemo={startEditingMonthlyMemo}
        cancelEditingMonthlyMemo={cancelEditingMonthlyMemo}
        // カレンダー操作関数
        navigateMonth={navigateMonth}
        openIncomeExpenseForm={openIncomeExpenseForm}
        // カスタムカテゴリ管理
        customCategories={customCategories}
        setCustomCategories={setCustomCategories}
        newGenreName={newGenreName}
        setNewGenreName={setNewGenreName}
        handleAddCategory={handleAddCategory}
        handleDeleteCategory={handleDeleteCategory}
        getAllGenres={getAllGenres}
        timerSettings={timerSettings}
      />
    </TimerPresetProvider>
  );
}

const AppWithProviders = () => {
  return (
    <LoadingStateProvider>
      <TimeTrackingStateProvider user={null}>
        <MoodLogProvider>
          <App />
        </MoodLogProvider>
      </TimeTrackingStateProvider>
    </LoadingStateProvider>
  );
};

export default AppWithProviders;
