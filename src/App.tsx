import React, { useState, useEffect } from "react";
import "./App.css";
import CharacterHome from "./components/CharacterHome";
import ProjectsSection from "./components/ProjectsSection";
import CookingTimerSection from "./components/CookingTimerSection";
import LoginForm from "./components/LoginForm";
import SelfAnalysisComponent from "./components/SelfAnalysisComponent";
import BookshelfComponent from "./components/BookshelfComponent";
import HeaderComponent from "./components/HeaderComponent";
import DiaryReminderIntegration from "./components/DiaryReminderIntegration";
import HetamaIconComponent from "./components/HetamaIconComponent";
import MemosComponent from "./components/MemosComponent";
import ReportsComponent from "./components/ReportsComponent";
import AdminPanelComponent from "./components/AdminPanelComponent";
import LoginComponent from "./components/LoginComponent";
import TimeTrackingComponent from "./components/TimeTrackingComponent";
import TimersComponent from "./components/TimersComponent";
import PublicMemosComponent from "./components/PublicMemosComponent";
import WorkRecordsComponent from "./components/WorkRecordsComponent";
import NotificationComponent from "./components/NotificationComponent";
import { ErrorInfo, ERROR_DEFAULTS, buildErrorInfo, getErrorInfo, formatErrorInfo } from './types/errorTypes';
import { getAuthToken, createAuthHeaders, executeAuthenticatedRequest } from './utils/authUtils';
import type { ApiErrorInfo } from './utils/apiErrorHandler';
import { apiFetch } from './utils/apiClient';
import EggTimerComponent from "./components/EggTimerComponent";
import { LoadingStateProvider, useLoadingState } from "./components/LoadingStateManager";
import { TimeTrackingStateProvider, useTimeTrackingState, useTimeTrackingHelpers } from "./components/TimeTrackingStateManager";
import { TimerPresetProvider, useTimerPresetState, useTimerPresetHelpers } from "./components/TimerPresetManager";
import { MoodLogProvider, useMoodLogState, useMoodLogHelpers } from "./components/MoodLogManager";
import { startCookingTimer } from "./utils/cookingTimer";
import { availableThemes } from "./constants/themes";
import {
  availableFonts,
  FontSettings,
  DEFAULT_FONT_SETTINGS,
  generateFontCSS,
} from "./constants/fonts";
import LanguageFontSettings from "./components/LanguageFontSettings";
import { cookingRecipes, getRecipePhases } from "./constants/cookingRecipes";
import SimpleErrorReportingModal from "./components/SimpleErrorReportingModal";
import { setErrorReportCallback, reportApiError } from "./utils/apiClient";
import type { ApiErrorInfo } from "./utils/apiErrorHandler";

import type {
  User,
  TimeEntry,
  Project,
  ReportSummary,
  AdminUser,
  Book,
  Memo,
  Character,
  IncomeExpenseRecord,
  WorkDiary,
  UserSettings,
  Feature,
  Habit,
  MoodLog,
  Goal,
  LearningRecord,
} from "./types";


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
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // エラー報告関連の状態
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState<Error | null>(null);
  const [showSimpleErrorModal, setShowSimpleErrorModal] = useState(false);
  const [errorModalButtonPosition, setErrorModalButtonPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // 各機能のローディング状態（LoadingStateManagerで管理）
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = useState(false);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);

  // 時間記録関連の状態（TimeTrackingStateManagerで管理）
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentProject, setCurrentProject] = useState<string>("");

  // ゆでたまごタイマーの状態（EggTimerComponentで管理）
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

  // カスタムタイマーの状態
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerTime, setCustomTimerTime] = useState(0); // 残り時間（秒）
  const [customTimerInterval, setCustomTimerInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerName, setCustomTimerName] = useState("");
  const [customTimerSound, setCustomTimerSound] = useState<
    "bell" | "chime" | "beep" | "alarm"
  >("bell");
  const [customTimerOriginalTime, setCustomTimerOriginalTime] = useState(0); // 元の時間を保存

  // タイマーセクションの表示状態
  const [showTimers, setShowTimers] = useState(false);

  // タイマープリセットの状態（TimerPresetManagerで管理）
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

  // 選択された料理レシピ
  const [selectedRecipe, setSelectedRecipe] = useState<string>("egg");
  const [selectedEggType, setSelectedEggType] = useState<
    "soft" | "medium" | "hard"
  >("medium");

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

  // 時間記録の進行状態
  const [isTimeTrackingActive, setIsTimeTrackingActive] = useState(false);

  // ジャンル管理の状態
  const [showGenreManagement, setShowGenreManagement] = useState(false);
  const [editingGenre, setEditingGenre] = useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = useState("");

  // 月収支メモの状態
  const [monthlyMemo, setMonthlyMemo] = useState("");
  const [editingMonthlyMemo, setEditingMonthlyMemo] = useState(false);

  // プロジェクト関連の状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#3b82f6");

  // レポート関連の状態
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(
    null
  );
  const [showReports, setShowReports] = useState(false);

  // 管理者関連の状態
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // 本棚関連の状態
  const [books, setBooks] = useState<Book[]>([]);
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

  // メモ関連の状態
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showMemos, setShowMemos] = useState(false);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");

  // キャラクター関連の状態
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );
  const [showCharacterHome, setShowCharacterHome] = useState(false);

  // セクション表示状態（既存の状態変数を使用）
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [showCookingTimer, setShowCookingTimer] = useState(false);
  const [showPresetTimers, setShowPresetTimers] = useState(false);
  const [showTimerStats, setShowTimerStats] = useState(false);
  const [showTimerHistory, setShowTimerHistory] = useState(false);
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoTags, setMemoTags] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [memoIsFamilyOnly, setMemoIsFamilyOnly] = useState(false);
  const [memoIsAdminOnly, setMemoIsAdminOnly] = useState(false);
  const [memoSearchTerm, setMemoSearchTerm] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");

  // 公開メモ関連の状態
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [showPublicMemos, setShowPublicMemos] = useState(false);
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] =
    useState("all");
  const [publicMemoCurrentDate, setPublicMemoCurrentDate] = useState(
    new Date()
  );
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] =
    useState<Date | null>(null);

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
  const [showWorkRecords, setShowWorkRecords] = useState(false);
  const [incomeExpenseRecords, setIncomeExpenseRecords] = useState<IncomeExpenseRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [showIncomeExpenseForm, setShowIncomeExpenseForm] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [editingIncomeExpenseRecord, setEditingIncomeExpenseRecord] =
    useState<IncomeExpenseRecord | null>(null);
  const [editingDiary, setEditingDiary] = useState<WorkDiary | null>(null);

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
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showFeatureSettings, setShowFeatureSettings] = useState(false);
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);
  const [showDiaryReminderSettings, setShowDiaryReminderSettings] =
    useState(false);
  const [diaryReminderSnoozeUntil, setDiaryReminderSnoozeUntil] = useState<
    number | null
  >(null);

  // カレンダーの状態
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);

  // じぶん図鑑関連の状態
  const [showSelfAnalysis, setShowSelfAnalysis] = useState(false);
  const [selfAnalysisTab, setSelfAnalysisTab] = useState("dashboard");
  const [personalProfile, setPersonalProfile] = useState({
    values: [] as string[],
    goals: [] as string[],
    skills: [] as string[],
    interests: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    personality: "",
    lifestyle: "",
    workStyle: "",
    learningStyle: "",
    motivation: "",
    challenges: [] as string[],
    achievements: [] as string[],
    futureVision: "",
    notes: "",
  });

  // 習慣トラッカー関連の状態
  const [newHabit, setNewHabit] = useState("");
  const [habitStreak, setHabitStreak] = useState<{ [key: string]: number }>({});
  const [habitHistory, setHabitHistory] = useState<{ [key: string]: string[] }>(
    {}
  );

  // 感情ログ関連の状態（MoodLogManagerで管理）
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [editingMoodLog, setEditingMoodLog] = useState<string | null>(null);
  const [moodForm, setMoodForm] = useState({
    date: new Date().toISOString().split("T")[0],
    mood: 5,
    energy: 5,
    stress: 5,
    notes: "",
    activities: [] as string[],
    weather: "sunny",
    sleep: 8,
  });
  const [newActivity, setNewActivity] = useState("");

  // 目標管理関連の状態
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "personal",
    priority: "medium" as "low" | "medium" | "high",
    status: "not-started" as
      | "not-started"
      | "in-progress"
      | "completed"
      | "paused",
    startDate: new Date().toISOString().split("T")[0],
    targetDate: "",
    progress: 0,
    milestones: [] as {
      id: string;
      title: string;
      description: string;
      completed: boolean;
    }[],
  });
  const [newMilestone, setNewMilestone] = useState("");

  // 感情ログ管理関数（MoodLogManagerで管理）
  const addMoodLog = () => {
    if (!moodForm.date) return;

    const moodLogId = Date.now().toString();
    const newMoodLog: MoodLog = {
      id: moodLogId,
      date: moodForm.date,
      mood: moodForm.mood,
      energy: moodForm.energy,
      stress: moodForm.stress,
      notes: moodForm.notes,
      activities: moodForm.activities,
      weather: moodForm.weather,
      sleep: moodForm.sleep,
      createdAt: new Date().toISOString(),
    };

    moodLogState.setMoodLogs([...moodLogState.moodLogs, newMoodLog]);
    moodLogState.resetMoodForm();
  };

  const updateMoodLog = (moodLogId: string, updates: Partial<MoodLog>) => {
    moodLogState.updateMoodLog(moodLogId, updates);
  };

  const deleteMoodLog = (moodLogId: string) => {
    moodLogState.deleteMoodLog(moodLogId);
  };

  const resetMoodForm = () => {
    moodLogState.resetMoodForm();
  };

  const addActivity = () => {
    moodLogState.addActivity();
  };

  const removeActivity = (index: number) => {
    moodLogState.removeActivity(index);
  };

  const editMoodLog = (log: MoodLog) => {
    moodLogState.editMoodLog(log);
  };

  const saveMoodLog = () => {
    if (editingMoodLog) {
      updateMoodLog(editingMoodLog, {
        date: moodForm.date,
        mood: moodForm.mood,
        energy: moodForm.energy,
        stress: moodForm.stress,
        notes: moodForm.notes,
        activities: moodForm.activities,
        weather: moodForm.weather,
        sleep: moodForm.sleep,
      });
    } else {
      addMoodLog();
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return "bi-emoji-frown";
    if (mood <= 4) return "bi-emoji-expressionless";
    if (mood <= 6) return "bi-emoji-neutral";
    if (mood <= 8) return "bi-emoji-smile";
    return "bi-emoji-laughing";
  };

  // getAverageMood関数はMoodLogManagerで管理

  // 目標管理関数
  const addGoal = () => {
    if (!goalForm.title.trim()) return;

    const goalId = Date.now().toString();
    const newGoal: Goal = {
      id: goalId,
      title: goalForm.title.trim(),
      description: goalForm.description,
      category: goalForm.category,
      priority: goalForm.priority,
      status: goalForm.status,
      startDate: goalForm.startDate,
      targetDate: goalForm.targetDate,
      progress: goalForm.progress,
      milestones: goalForm.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        completed: m.completed,
        completedDate: m.completed ? new Date().toISOString() : undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => [...prev, newGoal]);
    resetGoalForm();
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      )
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const addLearningRecord = (record: Omit<LearningRecord, "id">) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setLearningRecords([...learningRecords, newRecord]);
  };

  const updateLearningRecord = (
    recordId: string,
    updates: Partial<LearningRecord>
  ) => {
    setLearningRecords(
      learningRecords.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );
  };

  const deleteLearningRecord = (recordId: string) => {
    setLearningRecords((learningRecords || []).filter((r) => r.id !== recordId));
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      status: "not-started",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: "",
      progress: 0,
      milestones: [],
    });
    setNewMilestone("");
    setShowGoalForm(false);
    setEditingGoal(null);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;

    const milestoneId = Date.now().toString();
    setGoalForm((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: milestoneId,
          title: newMilestone.trim(),
          description: "",
          completed: false,
        },
      ],
    }));
    setNewMilestone("");
  };

  const removeMilestone = (milestoneId: string) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestoneId),
    }));
  };

  const toggleMilestone = (milestoneId: string) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const editGoal = (goal: Goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      progress: goal.progress,
      milestones: goal.milestones.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        completed: m.completed,
      })),
    });
    setEditingGoal(goal.id);
    setShowGoalForm(true);
  };

  const saveGoal = () => {
    if (editingGoal) {
      updateGoal(editingGoal, {
        title: goalForm.title,
        description: goalForm.description,
        category: goalForm.category,
        priority: goalForm.priority,
        status: goalForm.status,
        startDate: goalForm.startDate,
        targetDate: goalForm.targetDate,
        progress: goalForm.progress,
        milestones: goalForm.milestones.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          completed: m.completed,
          completedDate: m.completed ? new Date().toISOString() : undefined,
        })),
      });
    } else {
      addGoal();
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "not-started":
        return "#666";
      case "in-progress":
        return "#ff9800";
      case "completed":
        return "#4caf50";
      case "paused":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getGoalStatusText = (status: string) => {
    switch (status) {
      case "not-started":
        return "未開始";
      case "in-progress":
        return "進行中";
      case "completed":
        return "完了";
      case "paused":
        return "一時停止";
      default:
        return "不明";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "低";
      case "medium":
        return "中";
      case "high":
        return "高";
      default:
        return "不明";
    }
  };

  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<
    "income" | "expense" | "diary" | null
  >(null);

  // 機能定義
  const features: Feature[] = [
    {
      id: "time-tracking",
      name: "時間管理",
      description: "作業時間の記録と管理",
      component: null, // 既存の時間管理セクション
    },
    {
      id: "cooking-timer",
      name: "料理タイマー",
      description: "料理の調理時間管理",
      component: null, // 料理タイマーセクション
    },
    {
      id: "projects",
      name: "プロジェクト",
      description: "プロジェクトの管理",
      component: null, // 既存のプロジェクトセクション
    },
    {
      id: "reports",
      name: "レポート",
      description: "作業時間のレポート表示",
      component: null, // 既存のレポートセクション
    },
    {
      id: "admin-panel",
      name: "管理者パネル",
      description: "ユーザー管理とシステム設定",
      component: null, // 既存の管理者パネルセクション
    },
    {
      id: "bookshelf",
      name: "本棚",
      description: "本の管理と記録",
      component: null, // 既存の本棚セクション
    },
    {
      id: "memos",
      name: "メモ",
      description: "個人メモの管理",
      component: null, // 既存のメモセクション
    },
    {
      id: "public-memos",
      name: "公開メモ",
      description: "公開メモの閲覧と投稿",
      component: null, // 既存の公開メモセクション
    },
    {
      id: "work-records",
      name: "お仕事記録",
      description: "給料記録と日記",
      component: null, // 既存のお仕事記録セクション
    },
    {
      id: "timers",
      name: "タイマー",
      description: "カスタムタイマーとプリセットタイマー",
      component: null, // タイマーセクション
    },
    {
      id: "self-analysis",
      name: "じぶん図鑑",
      description: "自分自身を深く理解するための分析ツール",
      component: null, // 自己分析セクション
    },
  ];

  // 機能選択肢の定義
  const featureOptions = [
    { value: "", label: "機能を選択してください", disabled: true },
    { value: "time-tracking", label: "時間管理" },
    { value: "cooking-timer", label: "料理タイマー" },
    { value: "projects", label: "プロジェクト" },
    { value: "reports", label: "レポート" },
    { value: "admin-panel", label: "管理者パネル" },
    { value: "bookshelf", label: "本棚" },
    { value: "memos", label: "メモ" },
    { value: "public-memos", label: "公開メモ" },
    { value: "work-records", label: "お仕事記録" },
    { value: "timers", label: "タイマー" },
    { value: "self-analysis", label: "じぶん図鑑" },
    { value: "general", label: "全般" },
    { value: "other", label: "その他" },
  ];

  // 機能の表示順序を取得
  const getFeatureOrder = () => {
    if (!userSettings) return features.map((f) => f.id);

    // 既存の順序を保持しつつ、新しい機能を追加
    let order = [...userSettings.featureOrder];

    // featuresに存在するが、orderに含まれていない機能を追加
    features.forEach((feature) => {
      if (!order.includes(feature.id)) {
        order.push(feature.id);
      }
    });

    // 存在しない機能を除外
    order = (order || []).filter((id) => features.some((f) => f.id === id));

    return order;
  };

  // 表示する機能を取得

  // PWA Badge機能
  const updateAppBadge = (count: number) => {
    if ("serviceWorker" in navigator && "setAppBadge" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.active) {
            registration.active.postMessage({
              type: "SET_BADGE",
              count: count,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to update app badge:", error);
        });
    }
  };

  // 通知件数を計算する関数
  const calculateNotificationCount = () => {
    let count = 0;

    // 未読の返信数をカウント（例：自分のメモへの返信）
    if (memos) {
      memos.forEach((memo) => {
        if (memo.replies && memo.replies.length > 0) {
          // 今日の返信数をカウント
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayReplies = (memo.replies || []).filter((reply) => {
            const replyDate = new Date(reply.createdAt);
            replyDate.setHours(0, 0, 0, 0);
            return replyDate.getTime() === today.getTime();
          });

          count += todayReplies.length;
        }
      });
    }

    // 公開メモの新しい返信もカウント
    if (publicMemos) {
      publicMemos.forEach((memo) => {
        if (memo.replies && memo.replies.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayReplies = (memo.replies || []).filter((reply) => {
            const replyDate = new Date(reply.createdAt);
            replyDate.setHours(0, 0, 0, 0);
            return replyDate.getTime() === today.getTime();
          });

          count += todayReplies.length;
        }
      });
    }

    return count;
  };

  const getVisibleFeatures = () => {
    const order = getFeatureOrder();
    let hiddenFeatures = userSettings?.hiddenFeatures || [];

    // 「じぶん図鑑」が隠されている場合は表示に戻す
    if ((hiddenFeatures || []).includes("self-analysis")) {
      hiddenFeatures = (hiddenFeatures || []).filter((id) => id !== "self-analysis");
    }

    const visibleFeatures = (order || [])
      .filter((id) => !(hiddenFeatures || []).includes(id))
      .map((id) => features.find((f) => f.id === id))
      .filter(Boolean) as Feature[];

    return visibleFeatures;
  };

  // 401エラーハンドリング用のヘルパー関数
  const handle401Error = (response: Response) => {
    if (response.status === 401) {
      // 認証トークンをクリア
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // 少し遅延してからページをリロードしてログイン画面に遷移
      // これにより障害報告画面が表示される時間を確保
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2秒後にリロード
    }
  };

  // APIエラーハンドリング用のfetchラッパー
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest;
  
  // XMLHttpRequestもラップ
  const WrappedXHR = function(this: any) {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    (xhr as any)._method = '';
    (xhr as any)._url = '';
    
    xhr.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any)._method = method;
      (this as any)._url = url;
      return originalOpen.apply(this, [method, url, args[0] ?? true, args[1], args[2]]);
    };
    
    xhr.send = function(...args: any[]) {
      this.addEventListener('loadend', function() {
        if (this.status >= 400) {
          const errorInfo = {
            url: (this as any)._url || 'Unknown URL',
            status: this.status,
            statusText: this.statusText,
            method: (this as any)._method || 'GET',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          };
          
          console.error('XMLHttpRequestエラーが発生しました:', errorInfo);
          
          const { statusInfo, methodInfo } = formatErrorInfo(errorInfo);
          const errorDetails = `
XMLHttpRequestエラーが発生しました。

エラー詳細:
- URL: ${errorInfo.url}
${statusInfo ? `- ${statusInfo}` : ''}
${methodInfo ? `- ${methodInfo}` : ''}
- 時刻: ${errorInfo.timestamp}
- ユーザーエージェント: ${errorInfo.userAgent}

このエラーは自動的に検出されました。
          `.trim();
          
          setTimeout(() => {
            setShowMemos(true);
            setShowMemoForm(true);
            setMemoCategory('不具合報告');
            setMemoContent(errorDetails);
          }, 2000);
        }
      });
      
      return originalSend.apply(this, [args[0]]);
    };
    
    return xhr;
  };
  
  // XMLHttpRequestのプロパティをコピー
  Object.setPrototypeOf(WrappedXHR, originalXHR);
  Object.defineProperty(WrappedXHR, 'prototype', {
    value: originalXHR.prototype,
    writable: false
  });
  
  // 定数プロパティをコピー
  Object.defineProperty(WrappedXHR, 'UNSENT', { value: 0 });
  Object.defineProperty(WrappedXHR, 'OPENED', { value: 1 });
  Object.defineProperty(WrappedXHR, 'HEADERS_RECEIVED', { value: 2 });
  Object.defineProperty(WrappedXHR, 'LOADING', { value: 3 });
  Object.defineProperty(WrappedXHR, 'DONE', { value: 4 });
  
  (window as any).XMLHttpRequest = WrappedXHR;
  
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // 4xx, 5xxエラーをキャッチ
      if (!response.ok) {
        const errorInfo = {
          url: args[0]?.toString() || 'Unknown URL',
          status: response.status,
          statusText: response.statusText,
          method: args[1]?.method || 'GET',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };
        
        console.error('APIエラーが発生しました:', errorInfo);
        
        // エラー詳細を構築
        const { statusInfo, methodInfo } = formatErrorInfo(errorInfo);
        const errorDetails = `
APIエラーが発生しました。

エラー詳細:
- URL: ${errorInfo.url}
${statusInfo ? `- ${statusInfo}` : ''}
${methodInfo ? `- ${methodInfo}` : ''}
- 時刻: ${errorInfo.timestamp}
- ユーザーエージェント: ${errorInfo.userAgent}

このエラーは自動的に検出されました。
        `.trim();
        
        // 2秒後に不具合報告画面に遷移
        setTimeout(() => {
          setShowMemos(true);
          setShowMemoForm(true);
          setMemoCategory('不具合報告');
          setMemoContent(errorDetails);
        }, 2000);
      }
      
      return response;
    } catch (error) {
      // ネットワークエラーなど
      const errorInfo = {
        url: args[0]?.toString() || 'Unknown URL',
        error: error instanceof Error ? error.message : String(error),
        method: args[1]?.method || 'GET',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      console.error('ネットワークエラーが発生しました:', errorInfo);
      
      // エラー詳細を構築
      const errorDetails = `
ネットワークエラーが発生しました。

エラー詳細:
- URL: ${errorInfo.url}
- エラーメッセージ: ${errorInfo.error}
- メソッド: ${errorInfo.method}
- 時刻: ${errorInfo.timestamp}
- ユーザーエージェント: ${errorInfo.userAgent}

このエラーは自動的に検出されました。
      `.trim();
      
      // 2秒後に不具合報告画面に遷移
      setTimeout(() => {
        setShowMemos(true);
        setShowMemoForm(true);
        setMemoCategory('不具合報告');
        setMemoContent(errorDetails);
      }, 2000);
      
      throw error;
    }
  };

  // グローバルエラーハンドリング
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('グローバルエラーが発生しました:', event.error);
      
      // エラーの詳細情報を収集
      const errorInfo = {
        message: event.error?.message || event.message || 'Unknown error',
        stack: event.error?.stack || event.error?.stackTrace || 'No stack trace available',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        type: event.error?.constructor?.name || 'Error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // エラーオブジェクトに詳細情報を追加
      const enhancedError = new Error(errorInfo.message);
      enhancedError.stack = errorInfo.stack;
      (enhancedError as any).errorInfo = errorInfo;
      
      setCurrentError(enhancedError);
      setErrorModalButtonPosition(undefined); // ボタン位置をリセット
      setShowErrorModal(true);
      
      // エラー発生時に不具合報告ページに遷移
      setTimeout(() => {
        setShowMemos(true);
        setShowMemoForm(true);
        // 不具合報告のカテゴリを設定
        setMemoCategory('不具合報告');
        // エラー情報をメモの内容に自動入力
        const errorDetails = `
エラーが発生しました。

エラーメッセージ: ${errorInfo.message}
ファイル: ${errorInfo.filename}
行番号: ${errorInfo.lineno}
列番号: ${errorInfo.colno}
エラータイプ: ${errorInfo.type}
発生時刻: ${errorInfo.timestamp}
URL: ${errorInfo.url}

スタックトレース:
${errorInfo.stack}

このエラーについて詳細を教えてください。
        `.trim();
        setMemoContent(errorDetails);
      }, 2000); // 2秒後に遷移
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('未処理のPromise拒否が発生しました:', event.reason);
      
      // Promise拒否の詳細情報を収集
      const errorInfo = {
        message: event.reason?.message || String(event.reason) || 'Promise rejection',
        stack: event.reason?.stack || 'No stack trace available',
        type: event.reason?.constructor?.name || 'PromiseRejection',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      error.stack = errorInfo.stack;
      (error as any).errorInfo = errorInfo;
      
      setCurrentError(error);
      setErrorModalButtonPosition(undefined); // ボタン位置をリセット
      setShowErrorModal(true);
      
      // エラー発生時に不具合報告ページに遷移
      setTimeout(() => {
        setShowMemos(true);
        setShowMemoForm(true);
        // 不具合報告のカテゴリを設定
        setMemoCategory('不具合報告');
        // エラー情報をメモの内容に自動入力
        const errorDetails = `
Promise拒否エラーが発生しました。

エラーメッセージ: ${errorInfo.message}
エラータイプ: ${errorInfo.type}
発生時刻: ${errorInfo.timestamp}
URL: ${errorInfo.url}

スタックトレース:
${errorInfo.stack}

このエラーについて詳細を教えてください。
        `.trim();
        setMemoContent(errorDetails);
      }, 2000); // 2秒後に遷移
    };

    // コンソールエラーもキャッチ
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // エラーメッセージに特定のキーワードが含まれている場合
    const errorMessage = args.join(' ').toLowerCase();
    if (errorMessage.includes('referenceerror') ||
          errorMessage.includes('typeerror') || 
          errorMessage.includes('syntaxerror') ||
          errorMessage.includes('is not defined') ||
          errorMessage.includes('cannot read properties') ||
          errorMessage.includes('cannot read property') ||
          errorMessage.includes('reading') ||
          errorMessage.includes('filter') ||
          errorMessage.includes('map') ||
          errorMessage.includes('foreach') ||
          errorMessage.includes('reduce') ||
          errorMessage.includes('find') ||
          errorMessage.includes('some') ||
          errorMessage.includes('every') ||
          errorMessage.includes('includes') ||
          errorMessage.includes('indexof') ||
          errorMessage.includes('push') ||
          errorMessage.includes('pop') ||
          errorMessage.includes('shift') ||
          errorMessage.includes('unshift') ||
          errorMessage.includes('slice') ||
          errorMessage.includes('splice') ||
          errorMessage.includes('sort') ||
          errorMessage.includes('reverse') ||
          errorMessage.includes('join') ||
          errorMessage.includes('split') ||
          errorMessage.includes('replace') ||
          errorMessage.includes('match') ||
          errorMessage.includes('search') ||
          errorMessage.includes('test') ||
          errorMessage.includes('exec') ||
          errorMessage.includes('tostring') ||
          errorMessage.includes('valueof') ||
          errorMessage.includes('hasownproperty') ||
          errorMessage.includes('propertyisenumerable') ||
          errorMessage.includes('tolocalestring') ||
          errorMessage.includes('tojson') ||
          errorMessage.includes('undefined') ||
          errorMessage.includes('null') ||
          errorMessage.includes('is not a function') ||
          errorMessage.includes('is not a constructor') ||
          errorMessage.includes('cannot access') ||
          errorMessage.includes('cannot set') ||
          errorMessage.includes('cannot delete') ||
          errorMessage.includes('loadIncomeExpenseRecords') ||
          errorMessage.includes('loadSalaryRecords') ||
          errorMessage.includes('salaryRecords') ||
          errorMessage.includes('incomeExpenseRecords') ||
          errorMessage.includes('handleCreateIncomeExpenseRecord') ||
          errorMessage.includes('handleUpdateIncomeExpenseRecord') ||
          errorMessage.includes('handleDeleteIncomeExpenseRecord') ||
          errorMessage.includes('editIncomeExpenseRecord') ||
          errorMessage.includes('viewIncomeExpenseRecord') ||
          errorMessage.includes('editingIncomeExpenseRecord') ||
          errorMessage.includes('incomeExpenseAmount') ||
          errorMessage.includes('incomeExpenseDate') ||
          errorMessage.includes('incomeExpenseNotes') ||
          errorMessage.includes('incomeExpenseType') ||
          errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('404') ||
          errorMessage.includes('Not Found') ||
          errorMessage.includes('api.github.com') ||
          errorMessage.includes('SourceCodeViewer')) {
        
        const errorInfo = {
          message: errorMessage,
          stack: new Error().stack || 'No stack trace available',
          type: 'ConsoleError',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        const error = new Error(errorMessage);
        error.stack = errorInfo.stack;
        (error as any).errorInfo = errorInfo;
        
        setCurrentError(error);
        setShowErrorModal(true);
        
        // エラー発生時に不具合報告ページに遷移
        setTimeout(() => {
          setShowMemos(true);
          setShowMemoForm(true);
          // 不具合報告のカテゴリを設定
          setMemoCategory('不具合報告');
          // エラー情報をメモの内容に自動入力
          const errorDetails = `
コンソールエラーが発生しました。

エラーメッセージ: ${errorMessage}
エラータイプ: ${errorInfo.type}
発生時刻: ${errorInfo.timestamp}
URL: ${errorInfo.url}

スタックトレース:
${errorInfo.stack}

このエラーについて詳細を教えてください。
          `.trim();
          setMemoContent(errorDetails);
        }, 2000); // 2秒後に遷移
      }
    };

    // コンソール警告もキャッチ
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      originalConsoleWarn.apply(console, args);
      
      // 警告メッセージに特定のキーワードが含まれている場合
      const warningMessage = args.join(' ');
      if (warningMessage.includes('ReferenceError') || 
          warningMessage.includes('TypeError') || 
          warningMessage.includes('is not defined') ||
          warningMessage.includes('Cannot read properties')) {
        
        const errorInfo = {
          message: `Warning: ${warningMessage}`,
          stack: new Error().stack || 'No stack trace available',
          type: 'ConsoleWarning',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        const error = new Error(`Warning: ${warningMessage}`);
        error.stack = errorInfo.stack;
        (error as any).errorInfo = errorInfo;
        
        setCurrentError(error);
        setShowErrorModal(true);
        
        // エラー発生時に不具合報告ページに遷移
        setTimeout(() => {
          setShowMemos(true);
          setShowMemoForm(true);
          // 不具合報告のカテゴリを設定
          setMemoCategory('不具合報告');
          // エラー情報をメモの内容に自動入力
          const errorDetails = `
コンソール警告が発生しました。

警告メッセージ: ${warningMessage}
エラータイプ: ${errorInfo.type}
発生時刻: ${errorInfo.timestamp}
URL: ${errorInfo.url}

スタックトレース:
${errorInfo.stack}

この警告について詳細を教えてください。
          `.trim();
          setMemoContent(errorDetails);
        }, 2000); // 2秒後に遷移
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // より包括的なエラーハンドリング
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('window.onerror caught:', message, source, lineno, colno, error);
      
      // 特定のエラーパターンをチェック
      const errorMessage = String(message);
      const shouldShowModal = errorMessage.includes('ReferenceError') ||
                             errorMessage.includes('TypeError') ||
                             errorMessage.includes('SyntaxError') ||
                             errorMessage.includes('is not defined') ||
                             errorMessage.includes('Cannot read properties') ||
                             errorMessage.includes('Cannot read property') ||
                             errorMessage.includes('reading') ||
                             errorMessage.includes('filter') ||
                             errorMessage.includes('map') ||
                             errorMessage.includes('forEach') ||
                             errorMessage.includes('reduce') ||
                             errorMessage.includes('find') ||
                             errorMessage.includes('some') ||
                             errorMessage.includes('every') ||
                             errorMessage.includes('includes') ||
                             errorMessage.includes('indexOf') ||
                             errorMessage.includes('push') ||
                             errorMessage.includes('pop') ||
                             errorMessage.includes('shift') ||
                             errorMessage.includes('unshift') ||
                             errorMessage.includes('slice') ||
                             errorMessage.includes('splice') ||
                             errorMessage.includes('sort') ||
                             errorMessage.includes('reverse') ||
                             errorMessage.includes('join') ||
                             errorMessage.includes('split') ||
                             errorMessage.includes('replace') ||
                             errorMessage.includes('match') ||
                             errorMessage.includes('search') ||
                             errorMessage.includes('test') ||
                             errorMessage.includes('exec') ||
                             errorMessage.includes('toString') ||
                             errorMessage.includes('valueOf') ||
                             errorMessage.includes('hasOwnProperty') ||
                             errorMessage.includes('propertyIsEnumerable') ||
                             errorMessage.includes('toLocaleString') ||
                             errorMessage.includes('toJSON') ||
                             errorMessage.includes('undefined') ||
                             errorMessage.includes('null') ||
                             errorMessage.includes('is not a function') ||
                             errorMessage.includes('is not a constructor') ||
                             errorMessage.includes('Cannot access') ||
                             errorMessage.includes('Cannot set') ||
                             errorMessage.includes('Cannot delete') ||
                             errorMessage.includes('handleCreateIncomeExpenseRecord') ||
                             errorMessage.includes('handleUpdateIncomeExpenseRecord') ||
                             errorMessage.includes('handleDeleteIncomeExpenseRecord') ||
                             errorMessage.includes('editIncomeExpenseRecord') ||
                             errorMessage.includes('viewIncomeExpenseRecord') ||
                             errorMessage.includes('editingIncomeExpenseRecord') ||
                             errorMessage.includes('incomeExpenseAmount') ||
                             errorMessage.includes('incomeExpenseDate') ||
                             errorMessage.includes('incomeExpenseNotes') ||
                             errorMessage.includes('incomeExpenseType') ||
                             errorMessage.includes('401') ||
                             errorMessage.includes('Unauthorized') ||
                             errorMessage.includes('404') ||
                             errorMessage.includes('Not Found') ||
                             errorMessage.includes('api.github.com') ||
                             errorMessage.includes('SourceCodeViewer');
      
      if (shouldShowModal) {
        const errorInfo = {
          message: errorMessage,
          stack: error?.stack || 'No stack trace available',
          filename: source || 'Unknown file',
          lineno: lineno || 0,
          colno: colno || 0,
          type: error?.constructor?.name || 'Error',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        const enhancedError = new Error(errorMessage);
        enhancedError.stack = errorInfo.stack;
        (enhancedError as any).errorInfo = errorInfo;
        
        setCurrentError(enhancedError);
        setShowErrorModal(true);
        
        // エラー発生時に独立したモーダルを表示
        setTimeout(() => {
          setShowSimpleErrorModal(true);
        }, 1000); // 1秒後にモーダルを表示
      }
      
      return false; // デフォルトのエラーハンドリングを防ぐ
    };

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.onerror = null;
      window.fetch = originalFetch; // fetch関数も元に戻す
      window.XMLHttpRequest = originalXHR; // XMLHttpRequestも元に戻す
    };
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

  // カスタムカテゴリの読み込み
  useEffect(() => {
    const savedCategories = localStorage.getItem("customCategories");
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error("Failed to load custom categories:", error);
      }
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

  // フォント適用関数
  const applyFont = (fontValue: string) => {
    const root = document.documentElement;
    const body = document.body;

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

    // より強力なフォント適用 - 特定の要素を明示的に更新
    const specificSelectors = [
      ".dashboard-header h1",
      ".dashboard-header",
      ".user-info",
      ".time-tracking-section h2",
      ".projects-section h2",
      ".reports-section h2",
      ".admin-section h2",
      ".bookshelf-section h2",
      ".memos-section h2",
      ".public-memos-section h2",
      ".work-records-section h2",
      "button",
      "input",
      "textarea",
      "select",
      "label",
      "p",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ];

    specificSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.fontFamily =
          fontValue === "system" ? "" : fontValue;
      });
    });
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
      root.style.setProperty("--text-color", "#6b21a8");
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
      root.style.setProperty("--card-bg", "#ffffff");
      root.style.setProperty("--header-title-gradient", "#333");
      root.style.setProperty("--header-bg", "#f8f6f0");
      root.style.setProperty("--header-border", "#e0ddd6");
    } else {
      // デフォルトテーマ（ピンク）
      root.style.setProperty(
        "--primary-color",
        "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)"
      );
      root.style.setProperty(
        "--secondary-color",
        "linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)"
      );
      root.style.setProperty("--accent-color", "#ffb6c1");
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty(
        "--bg-color",
        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)"
      );
      root.style.setProperty(
        "--card-bg",
        "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)"
      );
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
      const body = document.body;
      const dashboard = document.querySelector(".dashboard");
      const header = document.querySelector(".dashboard-header");
      const timeSection = document.querySelector(".time-tracking-section");

      if (body) {
        body.style.background =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--bg-color"
          ) || "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)";
        body.style.color =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--text-color"
          ) || "#333";
      }

      if (dashboard) {
        (dashboard as HTMLElement).style.background =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--card-bg"
          ) || "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)";
      }

      if (header) {
        (header as HTMLElement).style.background =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--primary-color"
          ) || "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)";
        (header as HTMLElement).style.color =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--text-color"
          ) || "white";
      }

      if (timeSection) {
        (timeSection as HTMLElement).style.background =
          getComputedStyle(document.documentElement).getPropertyValue(
            "--secondary-color"
          ) || "linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)";
      }
    }, 100);
  };

  // お仕事記録の関数
  const loadIncomeExpenseRecords = async () => {
    setIncomeExpenseLoading(true);
    try {
      if (!user?.id) {
        console.log('ユーザーIDがありません');
        return;
      }
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('アクセストークンがありません');
        setMessage('ログインが必要です');
        return;
      }

      const response = await apiFetch("/api/work-records/salary", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
        if (data.success) {
          setIncomeExpenseRecords(data.records);
        } else {
        console.error("Failed to load income/expense records:", data.message);
        setMessage(`収入・支出記録の読み込みに失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load income/expense records:", error);
      setMessage(
        `収入・支出記録の読み込みに失敗しました: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIncomeExpenseLoading(false);
    }
  };

  const loadWorkDiaries = async () => {
    setDiaryLoading(true);
    try {
      if (!user?.id) {
        return;
      }
      const response = await fetch(`/api/work-records/diary?userId=${user.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
      } else {
        console.error("Failed to load work diaries:", data.message);
        setMessage(`日記の読み込みに失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load work diaries:", error);
      setMessage(
        `日記の読み込みに失敗しました: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDiaryLoading(false);
    }
  };

  // ユーザーIDを直接受け取る関数
  const loadIncomeExpenseRecordsWithUserId = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('アクセストークンがありません');
        return;
      }

      const response = await fetch(`/api/work-records/salary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setIncomeExpenseRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to load income/expense records:", error);
    }
  };

  const loadWorkDiariesWithUserId = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('アクセストークンがありません');
        return;
      }

      const response = await fetch(`/api/work-records/diary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
      }
    } catch (error) {
      console.error("Failed to load work diaries:", error);
    }
  };

  // 時間記録の履歴を取得（TimeTrackingStateManagerで管理）
  const loadTimeEntries = timeTrackingHelpers.loadTimeEntries;

  // 時間記録データからカテゴリ別の時間を計算（TimeTrackingStateManagerで管理）
  const calculateTimeBreakdown = timeTrackingHelpers.calculateTimeBreakdown;

  // 過去7日間の生産性データを計算（TimeTrackingStateManagerで管理）
  const calculateProductivityTrend = timeTrackingHelpers.calculateProductivityTrend;

  // 生産性統計を計算
  const calculateProductivityStats = () => {
    const productivityData = calculateProductivityTrend();
    const workHours = productivityData.map((day) => day.totalTime);

    const totalHours = workHours.length > 0 ? workHours.reduce((sum, hours) => sum + hours, 0) : 0;
    const averageHours = totalHours / workHours.length;
    const maxHours = workHours.length > 0 ? Math.max(...workHours) : 0;
    const productiveDays = (workHours || []).filter((hours) => hours > 0).length;

    return {
      averageHours: averageHours,
      maxHours: maxHours,
      totalHours: totalHours,
      productiveDays: productiveDays,
      productivityRate: (productiveDays / workHours.length) * 100,
    };
  };

  const handleCreateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      // 入力値の検証
      console.log('Input values:', {
        incomeExpenseDate,
        incomeExpenseAmount,
        incomeExpenseType,
        incomeExpenseNotes
      });

      if (!incomeExpenseDate || !incomeExpenseAmount || !incomeExpenseType) {
        setMessage("日付、金額、タイプは必須です。");
        return;
      }

      // 記録タイプに基づいて金額を正負に変換
      const amount =
        incomeExpenseType === "expense"
          ? -Math.abs(Number(incomeExpenseAmount))
          : Math.abs(Number(incomeExpenseAmount));

      const requestBody = {
        date: incomeExpenseDate,
        amount: amount,
        type: incomeExpenseType,
        transportation: 0,
        overtime: 0,
        bonus: 0,
        notes: incomeExpenseNotes,
      };

      console.log('Creating income/expense record:', requestBody);

      const response = await fetch("/api/work-records/salary", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      if (data.success) {
        setMessage("収入・支出記録が作成されました！");
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error('API Error Response:', data);
        
        // 詳細なエラーメッセージを作成
        let errorMessage = `エラー: ${data.message}`;
        if (data.details) {
          const missingFields = [];
          if (!data.details.date) missingFields.push('日付');
          if (!data.details.amount) missingFields.push('金額');
          if (!data.details.type) missingFields.push('タイプ');
          
          if (missingFields.length > 0) {
            errorMessage += `\n不足しているフィールド: ${missingFields.join(', ')}`;
          }
        }
        
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleUpdateIncomeExpenseRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingIncomeExpenseRecord) return;

    try {
      // 入力値の検証
      console.log('Update input values:', {
        incomeExpenseDate,
        incomeExpenseAmount,
        incomeExpenseType,
        incomeExpenseNotes
      });

      if (!incomeExpenseDate || !incomeExpenseAmount || !incomeExpenseType) {
        setMessage("日付、金額、タイプは必須です。");
        return;
      }

      // 記録タイプに基づいて金額を正負に変換
      const amount =
        incomeExpenseType === "expense"
          ? -Math.abs(Number(incomeExpenseAmount))
          : Math.abs(Number(incomeExpenseAmount));

      const requestBody = {
        id: editingIncomeExpenseRecord._id,
        date: incomeExpenseDate,
        amount: amount,
        type: incomeExpenseType,
        transportation: 0,
        overtime: 0,
        bonus: 0,
        notes: incomeExpenseNotes,
      };

      console.log('Updating income/expense record:', requestBody);

      const response = await fetch("/api/work-records/salary", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      if (data.success) {
        setMessage("収入・支出記録を更新しました！");
        setIncomeExpenseDate("");
        setIncomeExpenseAmount("");
        setIncomeExpenseType("income");
        setIncomeExpenseNotes("");
        setEditingIncomeExpenseRecord(null);
        setShowIncomeExpenseForm(false);
        loadIncomeExpenseRecords();
      } else {
        console.error('API Error Response:', data);
        
        // 詳細なエラーメッセージを作成
        let errorMessage = `エラー: ${data.message}`;
        if (data.details) {
          const missingFields = [];
          if (!data.details.date) missingFields.push('日付');
          if (!data.details.amount) missingFields.push('金額');
          if (!data.details.type) missingFields.push('タイプ');
          
          if (missingFields.length > 0) {
            errorMessage += `\n不足しているフィールド: ${missingFields.join(', ')}`;
          }
        }
        
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const response = await fetch("/api/work-records/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          date: diaryDate,
          title: diaryTitle,
          content: diaryContent,
          mood: diaryMood,
          tags: diaryTags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          isPrivate: diaryIsPrivate,
          // 新しい項目
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
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("日記が作成されました！");
        setDiaryDate("");
        setDiaryTitle("");
        setDiaryContent("");
        setDiaryMood("4");
        setDiaryTags("");
        setDiaryIsPrivate(true);
        // 新しい項目もリセット
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
        setNewAchievement("");
        setNewChallenge("");
        setNewLearning("");
        setNewNextGoal("");
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleUpdateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingDiary) return;

    try {
      const response = await fetch(
        `/api/work-records/diary/${editingDiary._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            date: diaryDate,
            title: diaryTitle,
            content: diaryContent,
            mood: diaryMood,
            tags: diaryTags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag),
            isPrivate: diaryIsPrivate,
            // 新しい項目
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
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("日記を更新しました！");
        setDiaryDate("");
        setDiaryTitle("");
        setDiaryContent("");
        setDiaryMood("4");
        setDiaryTags("");
        setDiaryIsPrivate(true);
        // 新しい項目もリセット
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
        setNewAchievement("");
        setNewChallenge("");
        setNewLearning("");
        setNewNextGoal("");
        setEditingDiary(null);
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteIncomeExpenseRecord = async (id: string) => {
    try {
      const result = await executeAuthenticatedRequest(setMessage, async (token) => {
        return await apiFetch(`/api/work-records/salary?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: createAuthHeaders(token)
        });
      });

      if (!result) return; // 認証エラーの場合

      const data = await result.json();
      if (data.success) {
        setMessage("収入・支出記録が削除されました！");
        loadIncomeExpenseRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      // エラー情報を取得してエラー報告モーダルを表示
      const errorInfo = getErrorInfo(error as Error | ApiErrorInfo);
      if (errorInfo) {
        setCurrentError(error as Error);
        setShowSimpleErrorModal(true);
      }
      
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      const response = await fetch(`/api/work-records/diary?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setMessage("日記が削除されました！");
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // 機能設定の関数
  const loadUserSettings = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(`/api/user-settings?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const settings = data.settings;

        // 新しい機能を追加（既存の設定を保持）
        const currentFeatureIds = features.map((f) => f.id);
        const existingOrder = settings.featureOrder || [];
        const existingHidden = settings.hiddenFeatures || [];

        // 存在しない機能を除外し、新しい機能を追加
        const updatedOrder = (existingOrder || []).filter((id: string) =>
          currentFeatureIds.includes(id)
        );
        currentFeatureIds.forEach((featureId) => {
          if (!updatedOrder.includes(featureId)) {
            updatedOrder.push(featureId);
          }
        });

        const updatedHidden = (existingHidden || []).filter((id: string) =>
          currentFeatureIds.includes(id)
        );

        // 設定が更新された場合は保存
        if (
          updatedOrder.length !== existingOrder.length ||
          updatedHidden.length !== existingHidden.length
        ) {
          const updatedSettings = {
            ...settings,
            featureOrder: updatedOrder,
            hiddenFeatures: updatedHidden,
          };
          setUserSettings(updatedSettings);

          // サーバーに保存
          try {
            await fetch("/api/user-settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                featureOrder: updatedOrder,
                hiddenFeatures: updatedHidden,
              }),
            });
          } catch (error) {
            console.error(
              "Failed to update settings with new features:",
              error
            );
          }
        } else {
          setUserSettings(settings);
        }
      } else {
        console.error("Failed to load settings:", data.message);
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }
  };

  // キャラクター関連の関数
  const loadCharacters = () => {
    const savedCharacters = localStorage.getItem("characters");
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setCurrentCharacter(character);
    localStorage.setItem("currentCharacter", JSON.stringify(character));
  };

  const handleCharacterHomeToggle = () => {
    if (!showCharacterHome) {
      // 開く場合は他の機能を閉じる
      closeOtherFeatures("character");
    }

    setShowCharacterHome(!showCharacterHome);
  };

  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;

    try {
      const response = await fetch("/api/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...newSettings,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserSettings(data.settings);
        setMessage("設定が保存されました！");
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleFeatureReorder = (newOrder: string[]) => {
    updateUserSettings({ featureOrder: newOrder });
  };

  // デフォルトのユーザー設定を作成
  const getDefaultUserSettings = (): UserSettings => ({
    _id: "",
    userId: user?.id || "",
    featureOrder: features.map((f) => f.id),
    hiddenFeatures: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleFeatureToggle = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();

    const isHidden = (currentSettings.hiddenFeatures || []).includes(featureId);
    const newHiddenFeatures = isHidden
      ? (currentSettings.hiddenFeatures || []).filter((id) => id !== featureId)
      : [...(currentSettings.hiddenFeatures || []), featureId];

    updateUserSettings({ hiddenFeatures: newHiddenFeatures });
  };

  // 他の機能を閉じる関数
  const closeOtherFeatures = (activeFeature: string) => {
    // 時間記録関連
    if (activeFeature !== "time-tracking") {
      setShowTimeTracking(false);
    }
    if (activeFeature !== "projects") {
      setShowProjects(false);
    }
    if (activeFeature !== "custom-timer") {
      setShowCustomTimer(false);
    }
    if (activeFeature !== "preset-timers") {
      setShowPresetTimers(false);
    }
    if (activeFeature !== "timer-stats") {
      setShowTimerStats(false);
    }
    if (activeFeature !== "timer-history") {
      setShowTimerHistory(false);
    }
    if (activeFeature !== "cooking-timer") {
      setShowCookingTimer(false);
    }

    // メモ関連
    if (activeFeature !== "memos") {
      setShowMemos(false);
      setShowMemoForm(false);
    }

    // 本棚関連
    if (activeFeature !== "bookshelf") {
      setShowBookshelf(false);
      setShowBookForm(false);
    }

    // レポート関連
    if (activeFeature !== "reports") {
      setShowReports(false);
    }

    // 管理者関連
    if (activeFeature !== "admin") {
      setShowAdminPanel(false);
    }

    // キャラクター関連
    if (activeFeature !== "character") {
      setShowCharacterHome(false);
    }

    // お仕事記録関連
    if (activeFeature !== "work-records") {
      setShowWorkRecords(false);
    }

    // その他の機能
    if (activeFeature !== "public-memos") {
      setShowPublicMemos(false);
    }
    if (activeFeature !== "font-settings") {
      setShowFontSettings(false);
    }
    if (activeFeature !== "theme-settings") {
      setShowThemeSettings(false);
    }
    if (activeFeature !== "genre-manager") {
      setShowGenreManager(false);
    }
    if (activeFeature !== "feature-settings") {
      setShowFeatureSettings(false);
    }
    if (activeFeature !== "calendar") {
      setShowCalendar(false);
    }
    if (activeFeature !== "record-detail") {
      setShowRecordDetail(false);
    }
    if (activeFeature !== "self-analysis") {
      setShowSelfAnalysis(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    setDraggedFeature(featureId);
    e.dataTransfer.effectAllowed = "move";
  };

  // タッチイベント用のハンドラー
  const handleTouchStart = (e: React.TouchEvent, featureId: string) => {
    setDraggedFeature(featureId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedFeature) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent, targetFeatureId: string) => {
    if (!draggedFeature || draggedFeature === targetFeatureId) {
      setDraggedFeature(null);
      return;
    }

    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const draggedIndex = currentOrder.indexOf(draggedFeature);
    const targetIndex = currentOrder.indexOf(targetFeatureId);

    // 要素を移動
    const [movedFeature] = currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, movedFeature);

    handleFeatureReorder(currentOrder);
    setDraggedFeature(null);
  };

  // ボタンによる並び順変更
  const moveFeatureUp = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const currentIndex = currentOrder.indexOf(featureId);

    if (currentIndex > 0) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
        newOrder[currentIndex],
        newOrder[currentIndex - 1],
      ];
      handleFeatureReorder(newOrder);
    }
  };

  const moveFeatureDown = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const currentIndex = currentOrder.indexOf(featureId);

    if (currentIndex < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
        newOrder[currentIndex + 1],
        newOrder[currentIndex],
      ];
      handleFeatureReorder(newOrder);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetFeatureId: string) => {
    e.preventDefault();

    if (!draggedFeature || draggedFeature === targetFeatureId) {
      setDraggedFeature(null);
      return;
    }

    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const draggedIndex = currentOrder.indexOf(draggedFeature);
    const targetIndex = currentOrder.indexOf(targetFeatureId);

    // 要素を移動
    const [movedFeature] = currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, movedFeature);

    handleFeatureReorder(currentOrder);
    setDraggedFeature(null);
  };

  // カレンダー関連の関数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日

    const days = [];

    // 前月の日付を追加（カレンダーグリッドの最初の週を埋める）
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    // 前月の最後の日から逆算して必要な日数分を追加
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(prevYear, prevMonth, prevMonthLastDay - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // 次月の日付を追加（6週分のグリッドを埋めるため、42日分確保）
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  // 月間収支を計算する関数
  const getMonthlySummary = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    let totalIncome = 0;
    let totalExpense = 0;


    incomeExpenseRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        if (record.type === 'income') {
          totalIncome += record.amount;
        } else if (record.type === 'expense') {
          totalExpense += record.amount;
        }
      }
    });

    const netIncome = totalIncome - totalExpense;

    console.log('収支計算結果:', {
      totalIncome,
      totalExpense,
      netIncome
    });

    return {
      totalIncome,
      totalExpense,
      netIncome,
      recordCount: (incomeExpenseRecords || []).filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      }).length,
    };
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setDiaryDate(jstDateStr);
  };

  const getRecordsForDate = (date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const filteredIncomeExpenseRecords = (incomeExpenseRecords || []).filter((record) => {
      // データベースの日付を日本時間に変換して比較
      const recordDate = new Date(record.date);
      const recordJstDateStr = new Date(
        recordDate.getTime() + 9 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];
      return recordJstDateStr === jstDateStr;
    });

    const filteredDiaries = (workDiaries || []).filter((diary) => {
      // データベースの日付を日本時間に変換して比較
      const diaryDate = new Date(diary.date);
      const diaryJstDateStr = new Date(diaryDate.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      return diaryJstDateStr === jstDateStr;
    });

    return { incomeExpenseRecords: filteredIncomeExpenseRecords, diaries: filteredDiaries };
  };

  const handleRecordClick = (type: "income" | "expense" | "diary", date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setSelectedDate(date);

    // その日の記録を取得
    const dayRecords = getRecordsForDate(date);

    if (type === "income" && (dayRecords.incomeExpenseRecords || []).filter(r => r.type === 'income').length > 0) {
      setSelectedRecord((dayRecords.incomeExpenseRecords || []).filter(r => r.type === 'income')[0]);
      setSelectedRecordType("income");
      setShowRecordDetail(true);
      setShowIncomeExpenseForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    } else if (type === "expense" && (dayRecords.incomeExpenseRecords || []).filter(r => r.type === 'expense').length > 0) {
      setSelectedRecord((dayRecords.incomeExpenseRecords || []).filter(r => r.type === 'expense')[0]);
      setSelectedRecordType("expense");
      setShowRecordDetail(true);
      setShowIncomeExpenseForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    } else if (type === "diary" && (dayRecords.diaries || []).length > 0) {
      setSelectedRecord((dayRecords.diaries || [])[0]);
      setSelectedRecordType("diary");
      setShowRecordDetail(true);
      setShowIncomeExpenseForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    }
  };

  const handleSpecificRecordClick = (record: any, type: "income" | "expense" | "diary") => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setShowRecordDetail(true);
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewIncomeExpenseRecord = (record: any) => {
    setSelectedRecord(record);
    setSelectedRecordType("income");
    setShowRecordDetail(true);
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewDiary = (diary: any) => {
    setSelectedRecord(diary);
    setSelectedRecordType("diary");
    setShowRecordDetail(true);
    setShowIncomeExpenseForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const editIncomeExpenseRecord = (record: any) => {
    setIncomeExpenseDate(record.date.split("T")[0]);
    setIncomeExpenseAmount(Math.abs(record.amount).toString()); // 絶対値で表示
    setIncomeExpenseType(record.type === 'income' ? "income" : "expense"); // タイプに基づいて設定
    setIncomeExpenseNotes(record.notes || "");
    setEditingIncomeExpenseRecord(record);
    setShowIncomeExpenseForm(true);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const editDiary = (diary: any) => {
    setDiaryDate(diary.date.split("T")[0]);
    setDiaryTitle(diary.title);
    setDiaryContent(diary.content);
    setDiaryMood(diary.mood);
    setDiaryTags(diary.tags ? diary.tags.join(", ") : "");
    setDiaryIsPrivate(diary.isPrivate);
    // 新しい項目の初期値設定
    setDiaryWorkSummary(diary.workSummary || "");
    setDiaryAchievements(diary.achievements || []);
    setDiaryChallenges(diary.challenges || []);
    setDiaryLearnings(diary.learnings || []);
    setDiaryNextGoals(diary.nextGoals || []);
    setDiaryEnergyLevel(diary.energyLevel || 5);
    setDiaryStressLevel(diary.stressLevel || 5);
    setDiaryWorkHours(diary.workHours || 0);
    setDiaryBreakTime(diary.breakTime || 0);
    setDiaryProductivity(diary.productivity || 5);
    setDiaryNotes(diary.notes || "");
    setNewAchievement("");
    setNewChallenge("");
    setNewLearning("");
    setNewNextGoal("");
    setEditingDiary(diary);
    setShowDiaryForm(true);
    setShowIncomeExpenseForm(false);
    setShowCalendar(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // カスタムカテゴリ管理関数
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

  // ジャンル管理の追加関数
  const handleEditGenre = (genre: string) => {
    setEditingGenre(genre);
    setEditingGenreName(genre);
  };

  const handleSaveGenreEdit = () => {
    if (editingGenreName.trim() && editingGenreName.trim() !== editingGenre) {
      const updatedCategories = customCategories.map((category) =>
        category === editingGenre ? editingGenreName.trim() : category
      );
      setCustomCategories(updatedCategories);
      localStorage.setItem("customCategories", JSON.stringify(updatedCategories));
      setMessage("ジャンルを更新しました");
    }
    setEditingGenre(null);
    setEditingGenreName("");
  };

  const handleCancelGenreEdit = () => {
    setEditingGenre(null);
    setEditingGenreName("");
  };

  const handleDeleteGenreFromManagement = (genreToDelete: string) => {
    if (
      window.confirm(
        `「${genreToDelete}」ジャンルを削除しますか？\nこのジャンルを使用しているメモも影響を受けます。`
      )
    ) {
      const updatedCategories = customCategories.filter(
        (category) => category !== genreToDelete
      );
      setCustomCategories(updatedCategories);
      localStorage.setItem("customCategories", JSON.stringify(updatedCategories));
      setMessage("ジャンルを削除しました");
    }
  };

  // 月収支メモの管理
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
    setMessage("月収支メモを保存しました");
  };

  const startEditingMonthlyMemo = () => {
    setEditingMonthlyMemo(true);
  };

  const cancelEditingMonthlyMemo = () => {
    loadMonthlyMemo();
    setEditingMonthlyMemo(false);
  };

  // 日記フォームを開く関数
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
    setDiaryMood("");
    setDiaryActivities([]);
    setDiaryNotes("");
    setDiaryNextGoals([]);
    setDiaryChallenges([]);
    setDiaryAchievements([]);
    setEditingDiary(null);
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

  // 返信機能の関数
  const handleReplySubmit = async (memoId: string) => {
    if (!replyContent.trim()) {
      setMessage("返信内容を入力してください");
      return;
    }

    if (!isLoggedIn || !user) {
      setMessage("ログインが必要です");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/memos/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memoId,
          content: replyContent.trim(),
          authorName: user?.displayName || "Unknown",
          authorEmail: user?.email || "unknown@example.com",
          userId: user?.id || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を投稿しました！");
        setReplyContent("");
        setReplyingToMemo(null);

        // 即座にローカル状態を更新（UX向上）
        const newReply = {
          id: data.reply.id,
          memoId: memoId,
          content: replyContent.trim(),
          authorName: user?.displayName || "Unknown",
          authorEmail: user?.email || "unknown@example.com",
          createdAt: data.reply.createdAt,
        };

        // メモの返信を即座に更新
        setMemos((prevMemos) =>
          prevMemos.map((memo) =>
            memo.id === memoId
              ? { ...memo, replies: [...(memo.replies || []), newReply] }
              : memo
          )
        );

        // 公開メモの返信を即座に更新
        setPublicMemos((prevMemos) =>
          prevMemos.map((memo) =>
            memo.id === memoId
              ? { ...memo, replies: [...(memo.replies || []), newReply] }
              : memo
          )
        );

        // バックグラウンドでデータを再読み込み（整合性確保）
        Promise.all([loadMemos(), loadPublicMemos()]).catch((error) => {
          console.error("Background reload failed:", error);
        });
        
        // メモ件数更新イベントを発火
        window.dispatchEvent(new CustomEvent('memoReplyCreated'));
      } else {
        setMessage(data.message || "返信の投稿に失敗しました");
      }
    } catch (error) {
      console.error("Reply submission error:", error);
      setMessage("返信の投稿中にエラーが発生しました");
    }
  };

  // 返信編集の開始
  const handleEditReply = (replyId: string, currentContent: string) => {
    setEditingReply(replyId);
    setEditReplyContent(currentContent);
  };

  // 返信編集のキャンセル
  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditReplyContent("");
  };

  // 返信編集の保存
  const handleSaveEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) {
      setMessage("返信内容を入力してください");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editReplyContent.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を更新しました！");
        setEditingReply(null);
        setEditReplyContent("");
        loadMemos();
        loadPublicMemos();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // 返信削除
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("この返信を削除しますか？")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を削除しました！");
        loadMemos();
        loadPublicMemos();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleReplyCancel = () => {
    setReplyingToMemo(null);
    setReplyContent("");
  };

  // ログイン状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        // トークンの有効性を検証
        await verifyToken(token);
      } else {
        // トークンがない場合は未ログイン状態に設定
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
    
    // エラー報告イベントをリッスン
    const handleErrorReport = (event: CustomEvent) => {
      const { category, content } = event.detail;
      setShowErrorModal(true);
      setCurrentError({
        name: 'Error',
        message: content,
        stack: ''
      });
    };

    
    window.addEventListener('showErrorReport', handleErrorReport as EventListener);

    // メモ件数更新のイベントリスナー
    const handleMemoCountUpdate = () => {
      // メモ件数を更新するイベントを発火
      window.dispatchEvent(new CustomEvent('updateMemoCounts'));
    };

    // メモ関連の操作時にイベントを発火
    const memoOperations = [
      'memoCreated',
      'memoUpdated', 
      'memoDeleted',
      'memoReplyCreated'
    ];

    memoOperations.forEach(eventName => {
      window.addEventListener(eventName, handleMemoCountUpdate);
    });

    // Service Workerの登録（Safari対応改善）
    if ("serviceWorker" in navigator) {
      // Safariでのキャッシュ問題を解決するため、古いキャッシュをクリア
      if ("caches" in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (cacheName.includes("work-time-tracker")) {
              caches.delete(cacheName);
              console.log("Cleared old cache:", cacheName);
            }
          });
        });
      }

      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none", // キャッシュを無効化して常に最新版を取得
        })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);

          // 新しいサービスワーカーが利用可能な場合の処理
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // 新しいバージョンが利用可能
                  console.log("New service worker available");
                  // 必要に応じてユーザーに更新を促す
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
    
    // クリーンアップ処理
    return () => {
      window.removeEventListener('showErrorReport', handleErrorReport as EventListener);
    };
  }, []);

  // バッジの更新
  useEffect(() => {
    if (isLoggedIn && (memos || publicMemos)) {
      const count = calculateNotificationCount();
      updateAppBadge(count);
    }
  }, [memos, publicMemos, isLoggedIn]);

  // APIエラー報告コールバックを設定
  useEffect(() => {
    setErrorReportCallback(handleApiErrorReport);
  }, []);

  // ログイン状態が変更された時にデータを読み込み
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadProjects();
      loadReportSummary();
      loadIncomeExpenseRecords();
      loadWorkDiaries();
      loadUserSettings();
      loadTimeEntries();
      loadMemos();
    }
  }, [isLoggedIn, user?.id]);

  // 月が変更された時に月収支メモを読み込み
  useEffect(() => {
    if (showCalendar) {
      loadMonthlyMemo();
    }
  }, [currentDate, showCalendar]);

  const verifyToken = async (token: string) => {
    try {
      // トークンの有効性を検証
      const userResponse = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        if (userData.success && userData.user) {
          setUser(userData.user);
          setIsLoggedIn(true);
        } else {
          // トークンが無効な場合は削除
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        // トークンが無効な場合は削除
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // 経過時間の更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentTimeEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - currentTimeEntry.startTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentTimeEntry]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ログイン成功！");
        setUser(data.user);
        setIsLoggedIn(true);
        if (data.token) {
          localStorage.setItem("access_token", data.token);
        }

        // ユーザー情報を設定してからデータを読み込み
        const userId = data.user.id;
        loadProjects(); // プロジェクトを読み込み
        loadReportSummary(); // レポートを読み込み
        loadIncomeExpenseRecordsWithUserId(userId); // 収入・支出記録を読み込み
        loadWorkDiariesWithUserId(userId); // 日記を読み込み
        loadUserSettings(); // ユーザー設定を読み込み
      } else {
        setMessage(`ログイン失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("アカウントが作成されました！ログインしてください。");
        setIsRegisterMode(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
      } else {
        setMessage(`登録失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          color: projectColor,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("プロジェクトが作成されました！");
        setProjectName("");
        setProjectDescription("");
        setProjectColor("#3b82f6");
        setShowProjectForm(false);
        loadProjects();
      } else {
        setMessage(`プロジェクト作成失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
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
      console.error("Failed to load projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadReportSummary = async () => {
    loadingState.setReportsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/reports/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReportSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to load report summary:", error);
    } finally {
      loadingState.setReportsLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    loadingState.setAdminUsersLoading(true);
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
      } else {
        setMessage(`ユーザー一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load admin users:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      loadingState.setAdminUsersLoading(false);
    }
  };

  const handleEditUser = async (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedUser: AdminUser) => {
    try {
      const token = localStorage.getItem("access_token");

      // APIが期待する形式にデータを変換
      const requestData = {
        userId: updatedUser.id, // idをuserIdに変換
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        status: updatedUser.status,
      };

      const response = await fetch("/api/admin/user-edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザー情報を更新しました");
        loadAdminUsers();
        setEditingUser(null);
      } else {
        setMessage(`ユーザー更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `${userName}を削除してもよろしいですか？この操作は取り消せません。`
      )
    ) {
      return;
    }

    // 削除中の状態を設定
    setDeletingUserId(userId);

    // 楽観的更新：即座にUIから削除
    const originalUsers = [...adminUsers];
    setAdminUsers((prevUsers) =>
      (prevUsers || []).filter((user) => user.id !== userId)
    );
    setMessage("ユーザーを削除中...");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // トークンがない場合は元に戻す
        setAdminUsers(originalUsers);
        setMessage("認証エラーが発生しました");
        return;
      }

      const response = await fetch("/api/admin/user-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザーを削除しました");
        // 成功時は楽観的更新のまま維持
      } else {
        // 失敗時は元に戻す
        setAdminUsers(originalUsers);
        setMessage(`ユーザー削除失敗: ${data.message}`);
      }
    } catch (error) {
      // エラー時は元に戻す
      setAdminUsers(originalUsers);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      // 削除中の状態をクリア
      setDeletingUserId(null);
    }
  };

  // 本棚関連の関数
  const loadBooks = async () => {
    setBooksLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        let filteredBooks = data.books || [];

        // ジャンルフィルターを適用
        if (selectedBookCategory !== "all") {
          filteredBooks = filteredBooks.filter(
            (book: any) => book.category === selectedBookCategory
          );
        }

        setBooks(filteredBooks);
      } else {
        setMessage(`本の一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setBooksLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookTitle || !bookAuthor || !bookIsbn || !bookCategory) {
      setMessage("必須フィールドを入力してください");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        method: "POST",
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
        setMessage("本を追加しました！");
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
        setMessage(`本の追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleEditBook = (book: Book) => {
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

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBook) return;

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
        setMessage("本を更新しました！");
        setEditingBook(null);
        setShowBookForm(false);
        loadBooks();
      } else {
        setMessage(`本の更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`「${bookTitle}」を削除してもよろしいですか？`)) {
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
        setMessage("本を削除しました");
        loadBooks();
      } else {
        setMessage(`本の削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const getReadingProgress = (book: Book) => {
    if (book.totalPages === 0) return 0;
    return Math.round((book.readPages / book.totalPages) * 100);
  };

  const handleBookCategoryChange = (category: string) => {
    setSelectedBookCategory(category);
    loadBooks();
  };

  const getBookCategories = () => {
    const bookCategories = new Set(books.map((book) => book.category));
    return Array.from(bookCategories).sort();
  };

  // メモ関連の関数
  const loadMemos = async () => {
    loadingState.setMemosLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (selectedMemoCategory !== "all") {
        params.append("category", selectedMemoCategory);
      }
      if (memoSearchTerm) {
        params.append("search", memoSearchTerm);
      }

      const response = await apiFetch(`/api/memos?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // レスポンスのContent-Typeをチェック
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`サーバーエラー: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.success) {
        setMemos(data.memos || []);
      } else {
        setMessage(`メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load memos:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        setMessage("サーバーからの応答が無効です。しばらく待ってから再試行してください。");
      } else {
        setMessage(
          `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } finally {
      loadingState.setMemosLoading(false);
    }
  };

  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memoContent || !memoCategory) {
      setMessage("内容、カテゴリは必須です");
      return;
    }


    // タイトルがない場合は内容の一行目をタイトルとして使用
    const finalTitle =
      memoTitle.trim() || memoContent.split("\n")[0].trim() || "無題";

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);


      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
          isFamilyOnly: memoIsFamilyOnly,
          isAdminOnly: memoIsAdminOnly,
          postType: "general",
        }),
      });

      // 401エラーのチェック
      handle401Error(response);

      const data = await response.json();

      if (data.success) {
        setMessage("メモを追加しました！");
        setMemoTitle("");
        setMemoContent("");
        setMemoCategory("");
        setMemoTags("");
        setMemoIsPublic(false);
        setMemoIsFamilyOnly(false);
        setMemoIsAdminOnly(false);
        setShowMemoForm(false);
        loadMemos();
        
        // メモ件数更新イベントを発火
        window.dispatchEvent(new CustomEvent('memoCreated'));
      } else {
        setMessage(`メモの追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // APIエラー報告のハンドラー
  const handleApiErrorReport = (errorInfo: ApiErrorInfo) => {
    reportApiError(errorInfo, handleErrorReport);
  };

  // 汎用エラー報告コンテンツフォーマット関数
  const formatGenericErrorReportContent = ({
    errorType = "エラー",
    content,
    userAgent,
    timestamp,
    url,
    statusInfo,
    methodInfo,
    message,
  }: {
    errorType?: string;
    content?: string;
    userAgent: string;
    timestamp: string;
    url?: string;
    statusInfo?: string;
    methodInfo?: string;
    message?: string;
  }) => {
    return `${errorType}が発生しました。

--- エラー詳細 ---
${url ? `URL: ${url}\n` : ''}
${statusInfo ? `${statusInfo}\n` : ''}
${methodInfo ? `${methodInfo}\n` : ''}
${message ? `エラー: ${message}\n` : ''}
${content ? `${content}\n` : ''}

--- システム情報 ---
User Agent: ${userAgent}
発生時刻: ${timestamp}`;
  };


  const formatApiErrorReportContent = (errorInfo: Partial<ErrorInfo>) => {
    const { statusInfo, methodInfo } = formatErrorInfo(errorInfo);
    return formatGenericErrorReportContent({
      errorType: "APIエラー",
      url: errorInfo.url,
      statusInfo,
      methodInfo,
      message: errorInfo.message,
      userAgent: errorInfo.userAgent ?? "",
      timestamp: errorInfo.timestamp ?? "",
    });
  };
  // SimpleErrorReportingModal用のエラー報告送信処理
  const handleSimpleErrorReport = async (report: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // エラー報告を公開メモとして投稿
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `[${report.title}] ${new Date().toLocaleString('ja-JP')}`,
          content: formatGenericErrorReportContent({
            content: report.content,
            userAgent: report.userAgent,
            timestamp: report.timestamp,
            url: undefined,
            statusInfo: undefined,
            methodInfo: undefined,
            message: undefined,
          }),
          category: "エラー報告",
          tags: ["エラー", "バグ報告", "システム"],
          isPublic: true,
          isFamilyOnly: false,
          isAdminOnly: false,
          postType: "error_report"
        }),
      });

      if (response.ok) {
        setMessage("エラー報告を送信しました。ありがとうございます。");
        setShowSimpleErrorModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "エラー報告の送信に失敗しました");
      }
    } catch (error) {
      console.error("エラー報告送信エラー:", error);
      setMessage("エラー報告の送信に失敗しました。もう一度お試しください。");
      throw error; // 例外を再投げしてSimpleErrorReportingModalでキャッチできるようにする
    }
  };

  // エラー報告の送信処理
  const handleErrorReport = async (errorInfo: ApiErrorInfo) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // エラー報告を公開メモとして投稿
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `[エラー報告] API Error - ${errorInfo.status}`,
          content: formatApiErrorReportContent(errorInfo),
          category: "エラー報告",
          tags: ["エラー", "バグ報告", "システム"],
          isPublic: true,
          isFamilyOnly: false,
          isAdminOnly: false,
          postType: "update_request"
        }),
      });

      // 401エラーのチェック
      handle401Error(response);

      const data = await response.json();

      if (data.success) {
        setMessage("エラー報告を送信しました。開発者が確認します。");
        loadMemos(); // メモ一覧を更新
        loadPublicMemos(); // 公開メモ一覧を更新
      } else {
        throw new Error(data.message || "エラー報告の送信に失敗しました");
      }
    } catch (error) {
      console.error("エラー報告の送信に失敗しました:", error);
      setMessage("エラー報告の送信に失敗しました。もう一度お試しください。");
      throw error; // 例外を再投げしてErrorReportingModalでキャッチできるようにする
    }
  };

  // エラーハンドリング用のヘルパー関数
  const safeExecute = (fn: () => void, errorContext: string) => {
    try {
      fn();
    } catch (error) {
      console.error(`${errorContext}でエラーが発生しました:`, error);
      
      const errorInfo = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace available',
        type: error instanceof Error ? error.constructor.name : 'UnknownError',
        context: errorContext,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const enhancedError = new Error(errorInfo.message);
      enhancedError.stack = errorInfo.stack;
      (enhancedError as any).errorInfo = errorInfo;
      
      setCurrentError(enhancedError);
      setErrorModalButtonPosition(undefined); // ボタン位置をリセット
      setShowErrorModal(true);
    }
  };

  // Reactエラーバウンダリー用のエラーハンドラー
  const handleReactError = (error: Error, errorInfo: any) => {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // 特定のエラーパターンをチェック
    const errorMessage = error.message;
    const shouldShowModal = errorMessage.includes('ReferenceError') ||
                           errorMessage.includes('TypeError') ||
                           errorMessage.includes('SyntaxError') ||
                           errorMessage.includes('is not defined') ||
                           errorMessage.includes('Cannot read properties') ||
                           errorMessage.includes('Cannot read property') ||
                           errorMessage.includes('reading') ||
                           errorMessage.includes('filter') ||
                           errorMessage.includes('map') ||
                           errorMessage.includes('forEach') ||
                           errorMessage.includes('reduce') ||
                           errorMessage.includes('find') ||
                           errorMessage.includes('some') ||
                           errorMessage.includes('every') ||
                           errorMessage.includes('includes') ||
                           errorMessage.includes('indexOf') ||
                           errorMessage.includes('push') ||
                           errorMessage.includes('pop') ||
                           errorMessage.includes('shift') ||
                           errorMessage.includes('unshift') ||
                           errorMessage.includes('slice') ||
                           errorMessage.includes('splice') ||
                           errorMessage.includes('sort') ||
                           errorMessage.includes('reverse') ||
                           errorMessage.includes('join') ||
                           errorMessage.includes('split') ||
                           errorMessage.includes('replace') ||
                           errorMessage.includes('match') ||
                           errorMessage.includes('search') ||
                           errorMessage.includes('test') ||
                           errorMessage.includes('exec') ||
                           errorMessage.includes('toString') ||
                           errorMessage.includes('valueOf') ||
                           errorMessage.includes('hasOwnProperty') ||
                           errorMessage.includes('propertyIsEnumerable') ||
                           errorMessage.includes('toLocaleString') ||
                           errorMessage.includes('toJSON') ||
                           errorMessage.includes('undefined') ||
                           errorMessage.includes('null') ||
                           errorMessage.includes('is not a function') ||
                           errorMessage.includes('is not a constructor') ||
                           errorMessage.includes('Cannot access') ||
                           errorMessage.includes('Cannot set') ||
                           errorMessage.includes('Cannot delete') ||
                           errorMessage.includes('handleCreateIncomeExpenseRecord') ||
                           errorMessage.includes('handleUpdateIncomeExpenseRecord') ||
                           errorMessage.includes('handleDeleteIncomeExpenseRecord') ||
                           errorMessage.includes('editIncomeExpenseRecord') ||
                           errorMessage.includes('viewIncomeExpenseRecord') ||
                           errorMessage.includes('editingIncomeExpenseRecord') ||
                           errorMessage.includes('incomeExpenseAmount') ||
                           errorMessage.includes('incomeExpenseDate') ||
                           errorMessage.includes('incomeExpenseNotes') ||
                           errorMessage.includes('incomeExpenseType') ||
                           errorMessage.includes('401') ||
                           errorMessage.includes('Unauthorized') ||
                           errorMessage.includes('404') ||
                           errorMessage.includes('Not Found') ||
                           errorMessage.includes('api.github.com') ||
                           errorMessage.includes('SourceCodeViewer');
    
    if (shouldShowModal) {
      const enhancedErrorInfo = {
        message: errorMessage,
        stack: error.stack || 'No stack trace available',
        type: 'ReactError',
        componentStack: errorInfo.componentStack || 'No component stack available',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      const enhancedError = new Error(errorMessage);
      enhancedError.stack = error.stack;
      (enhancedError as any).errorInfo = enhancedErrorInfo;
      
      setCurrentError(enhancedError);
      setErrorModalButtonPosition(undefined); // ボタン位置をリセット
      setShowErrorModal(true);
    }
  };

  // エラーハンドリングのテスト用関数（開発時のみ）
  const testErrorHandling = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('エラーハンドリングのテストを実行します...');
      
      // 意図的にエラーを発生させてテスト
      setTimeout(() => {
        try {
          // 存在しない関数を呼び出してエラーを発生
          (window as any).nonExistentFunction();
        } catch (error) {
          console.error('テストエラーが発生しました:', error);
        }
      }, 1000);
    }
  };

  // 特定のエラーパターンをテストする関数
  const testSpecificError = (errorType: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${errorType}エラーのテストを実行します...`);
      
      setTimeout(() => {
        try {
          // 特定のエラータイプに応じてエラーを発生
          switch (errorType) {
            case 'handleCreateIncomeExpenseRecord':
              (window as any).handleCreateIncomeExpenseRecord();
              break;
            case 'handleUpdateIncomeExpenseRecord':
              (window as any).handleUpdateIncomeExpenseRecord();
              break;
            case 'handleDeleteIncomeExpenseRecord':
              (window as any).handleDeleteIncomeExpenseRecord();
              break;
            case 'editIncomeExpenseRecord':
              (window as any).editIncomeExpenseRecord();
              break;
            case 'viewIncomeExpenseRecord':
              (window as any).viewIncomeExpenseRecord();
              break;
            default:
              (window as any).nonExistentFunction();
          }
        } catch (error) {
          console.error(`${errorType}テストエラーが発生しました:`, error);
        }
      }, 1000);
    }
  };

  // 公開メモ用のカレンダー関数
  const getPublicMemosForDate = (date: Date) => {
    const dateString = date.toDateString();
    return (publicMemos || []).filter((memo) => {
      const memoDate = new Date(memo.createdAt).toDateString();
      return memoDate === dateString;
    });
  };

  const navigatePublicMemoMonth = (direction: "prev" | "next") => {
    setPublicMemoCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handlePublicMemoDateClick = (date: Date) => {
    setPublicMemoSelectedDate(date);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
    setMemoCategory(memo.category);
    setMemoTags(memo.tags.join(", "));
    setMemoIsPublic(memo.isPublic);
    setMemoIsFamilyOnly(memo.isFamilyOnly || false);
    setMemoIsAdminOnly(memo.isAdminOnly || false);
    setShowMemoForm(true);
  };

  const handleUpdateMemo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMemo) return;

    // タイトルがない場合は内容の一行目をタイトルとして使用
    const finalTitle =
      memoTitle.trim() || memoContent.split("\n")[0].trim() || "無題";

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(`/api/memos/${editingMemo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
          isFamilyOnly: memoIsFamilyOnly,
          isAdminOnly: memoIsAdminOnly,
        }),
      });

      // 401エラーのチェック
      handle401Error(response);

      const data = await response.json();

      if (data.success) {
        setMessage("メモを更新しました！");
        setEditingMemo(null);
        setShowMemoForm(false);
        loadMemos();
        
        // メモ件数更新イベントを発火
        window.dispatchEvent(new CustomEvent('memoUpdated'));
      } else {
        setMessage(`メモの更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteMemo = async (memoId: string, memoTitle: string) => {
    if (!window.confirm(`「${memoTitle}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/${memoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 401エラーのチェック
      handle401Error(response);

      const data = await response.json();

      if (data.success) {
        setMessage("メモを削除しました");
        loadMemos();
        
        // メモ件数更新イベントを発火
        window.dispatchEvent(new CustomEvent('memoDeleted'));
      } else {
        setMessage(`メモの削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleMemoSearch = () => {
    loadMemos();
  };

  const handleMemoCategoryChange = (category: string) => {
    setSelectedMemoCategory(category);
    loadMemos();
  };

  // 公開メモ関連の関数
  const loadPublicMemos = async () => {
    setPublicMemosLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPublicMemoCategory !== "all") {
        params.append("category", selectedPublicMemoCategory);
      }
      if (publicMemoSearchTerm) {
        params.append("search", publicMemoSearchTerm);
      }

      const response = await fetch(`/api/memos/public?${params.toString()}`);

      // レスポンスのContent-Typeをチェック
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`サーバーエラー: ${response.status} - ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.success) {
        setPublicMemos(data.memos || []);
      } else {
        setMessage(`公開メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load public memos:", error);
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        setMessage("サーバーからの応答が無効です。しばらく待ってから再試行してください。");
      } else {
        setMessage(
          `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    } finally {
      setPublicMemosLoading(false);
    }
  };

  const handlePublicMemoSearch = () => {
    loadPublicMemos();
  };

  const handlePublicMemoCategoryChange = (category: string) => {
    setSelectedPublicMemoCategory(category);
    loadPublicMemos();
  };

  const getPublicMemoCategories = () => {
    const memoCategories = new Set(publicMemos.map((memo) => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUser(null);
    setMessage("");
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setDescription("");
    setProjects([]);
    setSelectedProject("");
    // その他の状態もリセット
    setIncomeExpenseRecords([]);
    setWorkDiaries([]);
    setReportSummary(null);
    setUserSettings(null);
    setBooks([]);
    setMemos([]);
    setPublicMemos([]);
    setAdminUsers([]);
  };

  // 時間記録を開始（TimeTrackingStateManagerで管理）
  const handleStartTracking = async () => {
    if (!description.trim()) {
      setMessage("作業内容を入力してください");
      return;
    }

    const result = await timeTrackingHelpers.startTimeTracking(currentProject, description);
    setMessage(result.message);
  };

  // 時間記録を停止（TimeTrackingStateManagerで管理）
  const handleStopTracking = async () => {
    const result = await timeTrackingHelpers.stopTimeTracking();
    setMessage(result.message);
  };

  // 時間記録を強制的にリセットする関数（TimeTrackingStateManagerで管理）
  const handleResetTracking = () => {
    const result = timeTrackingHelpers.resetTimeTracking();
    setMessage(result.message);
  };

  // ゆでたまごタイマーの関数（EggTimerComponentで管理）
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

  // 料理タイマーの総時間を計算
  const getTotalCookingTime = (
    recipeKey: string,
    eggType?: "soft" | "medium" | "hard"
  ) => {
    const phases = getRecipePhases(recipeKey, eggType);
    return phases.reduce((total, phase) => total + phase.duration, 0);
  };

  // ゆでたまごタイマー用の総時間計算
  const getEggTimerTotalTime = (eggType: "soft" | "medium" | "hard") => {
    return getTotalCookingTime("egg-timer", eggType);
  };

  const handleStartCookingTimer = () => {
    // バックグラウンドタイマーを使用する場合
    if (serviceWorker && backgroundTimerActive) {
      const totalTime = getTotalCookingTime(selectedRecipe, selectedEggType);
      const recipeName = cookingRecipes[selectedRecipe].name;

      startBackgroundTimer(
        "egg-timer",
        totalTime,
        "egg",
        eggTimerSound,
        recipeName
      );

      setEggTimerActive(true);
      setEggTimerPaused(false);
      setEggTimerTime(totalTime);
      setEggTimerOriginalTime(totalTime);
      setEggTimerPhase("heating");
      setEggTimerPhaseTime(
        getRecipePhases(selectedRecipe, selectedEggType)[0].duration
      );
      setEggTimerPhaseName(
        getRecipePhases(selectedRecipe, selectedEggType)[0].name
      );

      setMessage(
        `🍳 ${recipeName}タイマーを開始しました（バックグラウンド動作）`
      );
      return;
    }

    // 従来のフロントエンドタイマー
    const state = {
      eggTimerActive,
      eggTimerPaused,
      eggTimerTime,
      eggTimerOriginalTime,
      eggTimerPhase,
      eggTimerPhaseTime,
      eggTimerPhaseName,
      eggTimerSound,
      selectedRecipe,
      selectedEggType,
    };

    const setters = {
      setEggTimerTime,
      setEggTimerOriginalTime,
      setEggTimerActive,
      setEggTimerPaused,
      setEggTimerPhase,
      setEggTimerPhaseTime,
      setEggTimerPhaseName,
      setEggTimerInterval,
      setMessage,
      sendNotification,
      startSoundLoop,
      addToTimerHistory,
    };

    startCookingTimer(
      state,
      setters,
      cookingRecipes,
      getRecipePhases,
      getTotalCookingTime
    );
  };

  // ゆでたまごタイマーの関数（EggTimerComponentで管理）
  const pauseEggTimer = () => {
    // バックグラウンドタイマーの場合
    if (serviceWorker && backgroundTimerActive) {
      pauseBackgroundTimer("egg-timer");
      setEggTimerPaused(true);
      return;
    }

    // 従来のフロントエンドタイマー
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerPaused(true);
  };

  const stopEggTimer = () => {
    // バックグラウンドタイマーの場合
    if (serviceWorker && backgroundTimerActive) {
      stopBackgroundTimer("egg-timer");
      setEggTimerActive(false);
      setEggTimerPaused(false);
      setEggTimerTime(0);
      setEggTimerPhase("heating");
      setEggTimerPhaseTime(0);
      setEggTimerPhaseName("");
      stopSoundLoop();
      return;
    }

    // 従来のフロントエンドタイマー
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerActive(false);
    setEggTimerPaused(false);
    setEggTimerTime(0);
  };

  const resetEggTimer = () => {
    stopEggTimer();
    setEggTimerTime(getEggTimerDuration(eggTimerType));
  };

  // ゆでたまごタイマーの音声再生（EggTimerComponentで管理）
  const playEggTimerSound = async () => {
    if (!timerSettings.enableSounds) return;

    console.log("ゆでたまごタイマー音声再生開始:", eggTimerSound);
    try {
      // まずAudioContextを再開する（必要に応じて）
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      console.log("AudioContext状態:", audioContext.state);

      if (audioContext.state === "suspended") {
        console.log("AudioContextを再開中...");
        await audioContext.resume();
        console.log("AudioContext再開後状態:", audioContext.state);
      }

      // 音声再生を確実にするため、少し遅延を入れる
      setTimeout(() => {
        try {
          console.log("音声再生実行:", eggTimerSound);
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
            default:
              playBellSound(audioContext);
          }
          console.log("音声再生完了");
        } catch (innerError) {
          console.error("音声再生エラー:", innerError);
          playFallbackSound();
        }
      }, 100);
    } catch (error) {
      console.error("AudioContext作成エラー:", error);
      playFallbackSound();
    }
  };

  const playFallbackSound = () => {
    try {
      // より確実なフォールバック音声
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU4k9n1unEiBS13yO/eizEIHWq+8+OWT"
      );
      audio.volume = 0.5;
      audio.play().catch((playbackError) => {
        console.error("フォールバック音声再生エラー:", playbackError);
        // 最後の手段: システム音を鳴らす
        playSystemSound();
      });
    } catch (fallbackError) {
      console.error("フォールバック音声作成エラー:", fallbackError);
      playSystemSound();
    }
  };

  const playSystemSound = () => {
    try {
      // システム音を鳴らす（ブラウザの制限を回避）
      const audio = new Audio();
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU4k9n1unEiBS13yO/eizEIHWq+8+OWT";
      audio.play().catch(() => {
        console.warn(
          "音声再生ができませんでした。ブラウザの設定を確認してください。"
        );
      });
    } catch (error) {
      console.error("システム音再生エラー:", error);
    }
  };

  const playBellSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 鐘の音: 低い音から高い音へ
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5

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
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.45); // A5

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
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
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.25);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.6
    );

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
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1.0
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const formatEggTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // カスタムタイマーの関数
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
            setMessage(
              `${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`
            );

            // ブラウザ通知を送信
            sendNotification(
              "タイマー終了！",
              `${timerName}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
              "⏰"
            );

            // ループ音声を開始
            startSoundLoop(customTimerSound);

            // 履歴に追加
            addToTimerHistory(timerName, customTimerOriginalTime, "custom");
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
        setMessage("タイマー時間を設定してください");
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
            setMessage(
              `${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`
            );

            // ブラウザ通知を送信
            sendNotification(
              "タイマー終了！",
              `${timerName}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
              "⏰"
            );

            // ループ音声を開始
            startSoundLoop(customTimerSound);

            // 履歴に追加
            addToTimerHistory(timerName, totalSeconds, "custom");
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
    }
    setCustomTimerPaused(true);
  };

  const stopCustomTimer = () => {
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
      setCustomTimerInterval(null);
    }
    setCustomTimerActive(false);
    setCustomTimerPaused(false);
    setCustomTimerTime(0);
  };

  const resetCustomTimer = () => {
    stopCustomTimer();
    setCustomTimerTime(customTimerMinutes * 60 + customTimerSeconds);
  };

  const playCustomTimerSound = async () => {
    if (!timerSettings.enableSounds) return;

    try {
      // まずAudioContextを再開する（必要に応じて）
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // 音声再生を確実にするため、少し遅延を入れる
      setTimeout(() => {
        try {
          switch (customTimerSound) {
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
        } catch (innerError) {
          console.error("音声再生エラー:", innerError);
          playFallbackSound();
        }
      }, 100);
    } catch (error) {
      console.error("AudioContext作成エラー:", error);
      playFallbackSound();
    }
  };

  // プリセットタイマーの関数（TimerPresetManagerで管理）
  const startPresetTimer = (preset: (typeof timerPresets)[0]) => {
    if (customTimerActive) return;

    const totalSeconds = preset.minutes * 60 + 0;
    setCustomTimerTime(totalSeconds);
    setCustomTimerActive(true);
    setCustomTimerName(preset.name);

    const interval = setInterval(() => {
      setCustomTimerTime((prev) => {
        if (prev <= 1) {
          setCustomTimerActive(false);
          clearInterval(interval);
          setCustomTimerInterval(null);
          setMessage(
            `⏰ ${preset.name}終了！音を停止するには「音を停止」ボタンを押してください。`
          );

          // ブラウザ通知を送信
          sendNotification(
            "プリセットタイマー終了！",
            `${preset.name}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
            "⏰"
          );

          // ループ音声を開始
          startSoundLoop(customTimerSound);

          addToTimerHistory(preset.name, totalSeconds, "preset");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setCustomTimerInterval(interval);
  };

  // タイマー履歴に追加
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

  // 音声再生の初期化
  const initializeAudio = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        // ユーザーの操作でAudioContextを再開
        document.addEventListener(
          "click",
          () => {
            audioContext.resume();
          },
          { once: true }
        );
      }
    } catch (error) {
      console.warn("AudioContext初期化エラー:", error);
    }
  };

  // ブラウザ通知の初期化
  const initializeNotifications = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  };

  // ブラウザ通知を送信
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (
      timerSettings.enableNotifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, {
        body,
        icon: icon || "🥚",
        badge: "⏰",
        tag: "timer-notification",
        requireInteraction: true,
      });
    }
  };

  // 音声のループ再生を開始
  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    if (!timerSettings.enableSounds || isSoundPlaying) return;

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

  // 音声のループ再生を停止
  const stopSoundLoop = () => {
    if (soundLoopInterval) {
      clearInterval(soundLoopInterval);
      setSoundLoopInterval(null);
    }
    setIsSoundPlaying(false);
  };

  // Service Workerとの通信機能
  const initializeServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const sw =
          registration.installing ||
          registration.waiting ||
          registration.active;
        if (sw) {
          setServiceWorker(sw);

          // Service Workerからのメッセージをリッスン
          navigator.serviceWorker.addEventListener("message", (event) => {
            const { type, data } = event.data;

            switch (type) {
              case "TIMER_UPDATE":
                // バックグラウンドタイマーの更新
                if (data.timerId === "egg-timer") {
                  setEggTimerTime(data.remainingTime);
                } else if (data.timerId === "custom-timer") {
                  setCustomTimerTime(data.remainingTime);
                }
                break;
              case "TIMER_COMPLETED":
                // タイマー完了
                if (data.timerId === "egg-timer") {
                  setEggTimerActive(false);
                  setEggTimerPaused(false);
                  setEggTimerTime(0);
                  setMessage(
                    `🍳 ${data.recipeName}タイマー終了！できあがりです！`
                  );

                  // マナーモードでない場合のみ音を再生
                  if (!isMannerMode) {
                    startSoundLoop(
                      data.soundType as "bell" | "chime" | "beep" | "alarm"
                    );
                  }

                  // 履歴に追加
                  addToTimerHistory(data.recipeName, data.duration, "egg");
                } else if (data.timerId === "custom-timer") {
                  setCustomTimerActive(false);
                  setCustomTimerPaused(false);
                  setCustomTimerTime(0);
                  setMessage(`${data.timerName}タイマー終了！`);

                  // マナーモードでない場合のみ音を再生
                  if (!isMannerMode) {
                    startSoundLoop(
                      data.soundType as "bell" | "chime" | "beep" | "alarm"
                    );
                  }

                  // 履歴に追加
                  addToTimerHistory(data.timerName, data.duration, "custom");
                }
                break;
              case "TIMER_PAUSED":
                // タイマー一時停止
                if (data.timerId === "egg-timer") {
                  setEggTimerPaused(true);
                } else if (data.timerId === "custom-timer") {
                  setCustomTimerPaused(true);
                }
                break;
              case "TIMER_STOPPED":
                // タイマー停止
                if (data.timerId === "egg-timer") {
                  setEggTimerActive(false);
                  setEggTimerPaused(false);
                  setEggTimerTime(0);
                } else if (data.timerId === "custom-timer") {
                  setCustomTimerActive(false);
                  setCustomTimerPaused(false);
                  setCustomTimerTime(0);
                }
                break;
              case "STOP_SOUND":
                // 音を停止
                stopSoundLoop();
                break;
            }
          });
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  };

  // バックグラウンドタイマーを開始
  const startBackgroundTimer = (
    timerId: string,
    duration: number,
    type: string,
    soundType: string,
    recipeName: string
  ) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: "START_TIMER",
        data: {
          timerId,
          duration,
          type,
          soundType,
          recipeName,
        },
      });
      setBackgroundTimerActive(true);
    }
  };

  // バックグラウンドタイマーを一時停止
  const pauseBackgroundTimer = (timerId: string) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: "PAUSE_TIMER",
        data: { timerId },
      });
    }
  };

  // バックグラウンドタイマーを再開
  const resumeBackgroundTimer = (timerId: string) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: "RESUME_TIMER",
        data: { timerId },
      });
    }
  };

  // バックグラウンドタイマーを停止
  const stopBackgroundTimer = (timerId: string) => {
    if (serviceWorker) {
      serviceWorker.postMessage({
        type: "STOP_TIMER",
        data: { timerId },
      });
      setBackgroundTimerActive(false);
    }
  };

  // マナーモード対応の音声再生
  const playMannerModeSound = async () => {
    if (isMannerMode) {
      // マナーモードの場合は振動のみ
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      return;
    }

    // 通常の音声再生
    await playEggTimerSound();
  };

  // マナーモードの切り替え
  const toggleMannerMode = () => {
    setIsMannerMode(!isMannerMode);
    if (isMannerMode) {
      // マナーモードを無効にする
      setMessage("音声モードに切り替えました");
    } else {
      // マナーモードを有効にする
      setMessage("マナーモードに切り替えました（振動のみ）");
      // 現在再生中の音を停止
      stopSoundLoop();
    }
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
        const parsed = JSON.parse(saved);
        setTimerSettings(parsed);
        // 設定を反映
        setEggTimerSound(parsed.eggTimerSound || "bell");
        setCustomTimerSound(parsed.customTimerSound || "bell");
        setCustomTimerMinutes(parsed.defaultCustomMinutes || 5);
        setCustomTimerSeconds(parsed.defaultCustomSeconds || 0);
        // テーマを適用
        applyTimerTheme(parsed.theme || "default", parsed.customColors);
      }
    } catch (error) {
      console.error("タイマー設定の読み込みエラー:", error);
    }
  };

  // タイマーテーマの適用
  const applyTimerTheme = (theme: string, customColors?: any) => {
    const root = document.documentElement;

    switch (theme) {
      case "dark":
        root.style.setProperty("--timer-primary", "#60a5fa");
        root.style.setProperty("--timer-secondary", "#34d399");
        root.style.setProperty("--timer-accent", "#fbbf24");
        root.style.setProperty("--timer-background", "#1f2937");
        root.style.setProperty("--timer-text", "#f9fafb");
        break;
      case "colorful":
        root.style.setProperty("--timer-primary", "#ec4899");
        root.style.setProperty("--timer-secondary", "#8b5cf6");
        root.style.setProperty("--timer-accent", "#f59e0b");
        root.style.setProperty("--timer-background", "#fef3c7");
        root.style.setProperty("--timer-text", "#1f2937");
        break;
      case "minimal":
        root.style.setProperty("--timer-primary", "#6b7280");
        root.style.setProperty("--timer-secondary", "#9ca3af");
        root.style.setProperty("--timer-accent", "#d1d5db");
        root.style.setProperty("--timer-background", "#ffffff");
        root.style.setProperty("--timer-text", "#374151");
        break;
      default:
        if (customColors) {
          root.style.setProperty("--timer-primary", customColors.primary);
          root.style.setProperty("--timer-secondary", customColors.secondary);
          root.style.setProperty("--timer-accent", customColors.accent);
          root.style.setProperty("--timer-background", customColors.background);
        } else {
          root.style.setProperty("--timer-primary", "#3b82f6");
          root.style.setProperty("--timer-secondary", "#10b981");
          root.style.setProperty("--timer-accent", "#f59e0b");
          root.style.setProperty("--timer-background", "#ffffff");
        }
        root.style.setProperty("--timer-text", "#1f2937");
        break;
    }
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
            completedAt:
              typeof item.completedAt === "string"
                ? new Date(item.completedAt)
                : new Date(item.completedAt),
          }))
        );
      }
    } catch (error) {
      console.error("タイマー履歴の読み込みエラー:", error);
    }
  };

  // コンポーネントマウント時に音声と通知を初期化
  React.useEffect(() => {
    initializeAudio();
    initializeNotifications();
    loadTimerSettings();
    loadTimerHistory();
    loadCharacters();
    initializeServiceWorker();

    // 現在のキャラクターを読み込み
    const savedCharacter = localStorage.getItem("currentCharacter");
    if (savedCharacter) {
      setCurrentCharacter(JSON.parse(savedCharacter));
    }
  }, []);

  // コンポーネントアンマウント時に音声ループを停止
  React.useEffect(() => {
    return () => {
      stopSoundLoop();
    };
  }, []);

  // 認証チェック中はローディング画面を表示
  if (isCheckingAuth) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>認証を確認中...</p>
          </div>
        </div>
      </div>
    );
  }

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn || !user || !user.id) {
    return (
      <LoginComponent
        onLogin={handleLogin}
        onRegister={handleRegister}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={password} // 確認パスワードは同じ値を使用
        setConfirmPassword={setPassword}
        name={displayName}
        setName={setDisplayName}
        isLogin={!isRegisterMode}
        setIsLogin={(isLogin) => setIsRegisterMode(!isLogin)}
        loading={loading}
        message={message}
      />
    );
  }

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="dashboard">
          <HeaderComponent
            user={user}
            currentCharacter={currentCharacter}
            showThemeSettings={showThemeSettings}
            showFontSettings={showFontSettings}
            showFeatureSettings={showFeatureSettings}
            handleCharacterHomeToggle={handleCharacterHomeToggle}
            handleLogout={handleLogout}
            closeOtherFeatures={closeOtherFeatures}
            setShowThemeSettings={setShowThemeSettings}
            setShowFontSettings={setShowFontSettings}
            setShowFeatureSettings={setShowFeatureSettings}
            loadUserSettings={loadUserSettings}
            isTimeTrackingActive={isTimeTrackingActive}
          />

          {/* 通知コンポーネント */}
          <div className="notification-wrapper">
            <NotificationComponent 
              onNavigateToMemo={(memoId: string) => {
                // メモセクションを表示
                setShowMemos(true);
                // メモを検索して該当するメモを表示
                loadMemos();
                // 通知ドロップダウンを閉じる
                setTimeout(() => {
                  // 該当するメモをハイライトする処理（必要に応じて実装）
                  console.log('Navigating to memo:', memoId);
                }, 100);
              }}
            />
          </div>

          <main className="dashboard-main">
            {getVisibleFeatures().map((feature) => {
              if (feature.id === "time-tracking") {
                return (
                  <TimeTrackingComponent
                    key={feature.id}
                    showTimeTracking={showTimeTracking}
                    setShowTimeTracking={setShowTimeTracking}
                    projects={projects}
                    projectsLoading={projectsLoading}
                    timeEntries={timeTrackingState.timeEntries}
                    timeEntriesLoading={timeTrackingState.timeEntriesLoading}
                    currentProject={timeTrackingState.currentProject}
                    setCurrentProject={timeTrackingState.setCurrentProject}
                    description={timeTrackingState.description}
                    setDescription={timeTrackingState.setDescription}
                    isTracking={timeTrackingState.isTracking}
                    startTime={timeTrackingState.startTime}
                    elapsedTime={timeTrackingState.elapsedTime}
                    loadProjects={loadProjects}
                    loadTimeEntries={loadTimeEntries}
                    handleStartTracking={handleStartTracking}
                    handleStopTracking={handleStopTracking}
                    handleResetTracking={handleResetTracking}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
              } else if (feature.id === "cooking-timer") {
                return (
                  <CookingTimerSection
                    key={feature.id}
                    showCookingTimer={showCookingTimer}
                    setShowCookingTimer={setShowCookingTimer}
                    closeOtherFeatures={closeOtherFeatures}
                    selectedRecipe={selectedRecipe}
                    setSelectedRecipe={setSelectedRecipe}
                    selectedEggType={selectedEggType}
                    setSelectedEggType={(type: "soft" | "medium" | "hard") =>
                      setSelectedEggType(type)
                    }
                    eggTimerActive={eggTimerActive}
                    eggTimerPaused={eggTimerPaused}
                    eggTimerTime={eggTimerTime}
                    eggTimerOriginalTime={eggTimerOriginalTime}
                    eggTimerPhase={eggTimerPhase}
                    eggTimerPhaseTime={eggTimerPhaseTime}
                    eggTimerPhaseName={eggTimerPhaseName}
                    eggTimerSound={eggTimerSound}
                    setEggTimerSound={setEggTimerSound}
                    setEggTimerTime={setEggTimerTime}
                    setEggTimerOriginalTime={setEggTimerOriginalTime}
                    setEggTimerActive={setEggTimerActive}
                    setEggTimerPaused={setEggTimerPaused}
                    setEggTimerPhase={setEggTimerPhase}
                    setEggTimerPhaseTime={setEggTimerPhaseTime}
                    setEggTimerPhaseName={setEggTimerPhaseName}
                    setEggTimerInterval={setEggTimerInterval}
                    setMessage={setMessage}
                    sendNotification={sendNotification}
                    startSoundLoop={startSoundLoop}
                    addToTimerHistory={addToTimerHistory}
                    playEggTimerSound={playEggTimerSound}
                    pauseEggTimer={pauseEggTimer}
                    stopEggTimer={stopEggTimer}
                    resetEggTimer={resetEggTimer}
                    getEggTimerDuration={getEggTimerDuration}
                    getTotalCookingTime={getTotalCookingTime}
                    formatTime={formatTime}
                    eggTimerType={eggTimerType}
                  />
                );
              } else if (feature.id === "projects") {
                return (
                  <ProjectsSection
                    key={feature.id}
                    showProjects={showProjects}
                    setShowProjects={setShowProjects}
                    closeOtherFeatures={closeOtherFeatures}
                    showProjectForm={showProjectForm}
                    setShowProjectForm={setShowProjectForm}
                    projects={projects}
                    projectsLoading={projectsLoading}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    projectName={projectName}
                    setProjectName={setProjectName}
                    projectDescription={projectDescription}
                    setProjectDescription={setProjectDescription}
                    projectColor={projectColor}
                    setProjectColor={setProjectColor}
                    loading={loading}
                    handleCreateProject={handleCreateProject}
                    loadProjects={loadProjects}
                  />
                );
              } else if (feature.id === "reports") {
                return (
                  <ReportsComponent
                    key={feature.id}
                    showReports={showReports}
                    setShowReports={setShowReports}
                    incomeExpenseRecords={incomeExpenseRecords}
                    workDiaries={workDiaries}
                    reportsLoading={loadingState.reportsLoading}
                    reportSummary={reportSummary}
                    loadReportSummary={loadReportSummary}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
              } else if (
                feature.id === "admin-panel" &&
                user?.role === "admin"
              ) {
                return (
                  <AdminPanelComponent
                    key={feature.id}
                    showAdminPanel={showAdminPanel}
                    setShowAdminPanel={setShowAdminPanel}
                    adminUsers={adminUsers}
                    adminUsersLoading={adminUsersLoading}
                    editingUser={editingUser}
                    setEditingUser={setEditingUser}
                    loadAdminUsers={loadAdminUsers}
                    handleEditUser={handleEditUser}
                    handleUpdateUser={handleUpdateUser}
                    handleDeleteUser={handleDeleteUser}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
              } else if (feature.id === "bookshelf") {
                return (
                  <BookshelfComponent
                    key={feature.id}
                    showBookshelf={showBookshelf}
                    setShowBookshelf={setShowBookshelf}
                    closeOtherFeatures={closeOtherFeatures}
                    books={books}
                    booksLoading={booksLoading}
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
                    loading={loading}
                    loadBooks={loadBooks}
                    handleCreateBook={handleCreateBook}
                    handleUpdateBook={handleUpdateBook}
                    handleEditBook={handleEditBook}
                    handleDeleteBook={handleDeleteBook}
                    handleBookCategoryChange={handleBookCategoryChange}
                    getBookCategories={getBookCategories}
                    getReadingProgress={getReadingProgress}
                  />
                );
              } else if (feature.id === "memos") {
                return (
                  <MemosComponent
                    key={feature.id}
                    memos={memos}
                    publicMemos={publicMemos}
                    memosLoading={loadingState.memosLoading}
                    showMemos={showMemos}
                    setShowMemos={setShowMemos}
                    customCategories={customCategories}
                    setCustomCategories={setCustomCategories}
                    loadMemos={loadMemos}
                    closeOtherFeatures={closeOtherFeatures}
                    handleDeleteMemo={handleDeleteMemo}
                    user={user}
                    handleCreateMemo={handleCreateMemo}
                    handleUpdateMemo={handleUpdateMemo}
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
                    handleReplySubmit={handleReplySubmit}
                    handleReplyCancel={handleReplyCancel}
                    handleEditReply={handleEditReply}
                    handleSaveEditReply={handleSaveEditReply}
                    handleCancelEditReply={handleCancelEditReply}
                    handleDeleteReply={handleDeleteReply}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    replyingToMemo={replyingToMemo}
                    setReplyingToMemo={setReplyingToMemo}
                  />
                );
              } else if (feature.id === "public-memos") {
                return (
                  <PublicMemosComponent
                    key={feature.id}
                    publicMemos={publicMemos}
                    publicMemosLoading={publicMemosLoading}
                    showPublicMemos={showPublicMemos}
                    setShowPublicMemos={setShowPublicMemos}
                    user={user}
                    loadPublicMemos={loadPublicMemos}
                    closeOtherFeatures={closeOtherFeatures}
                    handleReplySubmit={handleReplySubmit}
                    handleReplyCancel={handleReplyCancel}
                    handleEditReply={handleEditReply}
                    handleSaveEditReply={handleSaveEditReply}
                    handleCancelEditReply={handleCancelEditReply}
                    handleDeleteReply={handleDeleteReply}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                  />
                );
              } else if (feature.id === "work-records") {
                return (
                  <WorkRecordsComponent
                    key={feature.id}
                    showWorkRecords={showWorkRecords}
                    setShowWorkRecords={setShowWorkRecords}
                    showIncomeExpenseForm={showIncomeExpenseForm}
                    setShowIncomeExpenseForm={setShowIncomeExpenseForm}
                    showDiaryForm={showDiaryForm}
                    setShowDiaryForm={setShowDiaryForm}
                    showCalendar={showCalendar}
                    setShowCalendar={setShowCalendar}
                    incomeExpenseRecords={incomeExpenseRecords}
                    workDiaries={workDiaries}
                    incomeExpenseLoading={incomeExpenseLoading}
                    diaryLoading={diaryLoading}
                    workRecordsLoading={workRecordsLoading}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedRecord={selectedRecord}
                    setSelectedRecord={setSelectedRecord}
                    selectedRecordType={selectedRecordType}
                    setSelectedRecordType={setSelectedRecordType}
                    editingIncomeExpenseRecord={editingIncomeExpenseRecord}
                    setEditingIncomeExpenseRecord={setEditingIncomeExpenseRecord}
                    editingDiary={editingDiary}
                    setEditingDiary={setEditingDiary}
                    incomeExpenseAmount={incomeExpenseAmount}
                    setIncomeExpenseAmount={setIncomeExpenseAmount}
                    incomeExpenseType={incomeExpenseType}
                    setIncomeExpenseType={setIncomeExpenseType}
                    incomeExpenseDate={incomeExpenseDate}
                    setIncomeExpenseDate={setIncomeExpenseDate}
                    incomeExpenseNotes={incomeExpenseNotes}
                    setIncomeExpenseNotes={setIncomeExpenseNotes}
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
                    diaryNotes={diaryNotes}
                    setDiaryNotes={setDiaryNotes}
                    diaryNextGoals={diaryNextGoals}
                    setDiaryNextGoals={setDiaryNextGoals}
                    diaryChallenges={diaryChallenges}
                    setDiaryChallenges={setDiaryChallenges}
                    diaryAchievements={diaryAchievements}
                    setDiaryAchievements={setDiaryAchievements}
                    diaryGratitude={diaryGratitude}
                    setDiaryGratitude={setDiaryGratitude}
                    diaryReflection={diaryReflection}
                    setDiaryReflection={setDiaryReflection}
                    monthlyMemo={monthlyMemo}
                    setMonthlyMemo={setMonthlyMemo}
                    editingMonthlyMemo={editingMonthlyMemo}
                    setEditingMonthlyMemo={setEditingMonthlyMemo}
                    loadIncomeExpenseRecords={loadIncomeExpenseRecords}
                    loadWorkDiaries={loadWorkDiaries}
                    handleCreateIncomeExpenseRecord={handleCreateIncomeExpenseRecord}
                    handleUpdateIncomeExpenseRecord={handleUpdateIncomeExpenseRecord}
                    handleCreateDiary={handleCreateDiary}
                    handleUpdateDiary={handleUpdateDiary}
                    handleDeleteIncomeExpenseRecord={handleDeleteIncomeExpenseRecord}
                    handleDeleteDiary={handleDeleteDiary}
                    openDiaryForm={openDiaryForm}
                    loadMonthlyMemo={loadMonthlyMemo}
                    saveMonthlyMemo={saveMonthlyMemo}
                    startEditingMonthlyMemo={startEditingMonthlyMemo}
                    cancelEditingMonthlyMemo={cancelEditingMonthlyMemo}
                    closeOtherFeatures={closeOtherFeatures}
                    user={user}
                  />
                );
              } else if (feature.id === "timers") {
                return (
                  <TimersComponent
                    key={feature.id}
                    showTimers={showTimers}
                    setShowTimers={setShowTimers}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
              } else if (feature.id === "egg-timer") {
                return (
                  <EggTimerComponent
                    key={feature.id}
                    eggTimerActive={eggTimerActive}
                    eggTimerPaused={eggTimerPaused}
                    eggTimerTime={eggTimerTime}
                    eggTimerOriginalTime={eggTimerOriginalTime}
                    eggTimerPhase={eggTimerPhase}
                    eggTimerPhaseTime={eggTimerPhaseTime}
                    eggTimerPhaseName={eggTimerPhaseName}
                    eggTimerSound={eggTimerSound}
                    eggTimerType={eggTimerType}
                    setEggTimerActive={setEggTimerActive}
                    setEggTimerPaused={setEggTimerPaused}
                    setEggTimerTime={setEggTimerTime}
                    setEggTimerOriginalTime={setEggTimerOriginalTime}
                    setEggTimerPhase={setEggTimerPhase}
                    setEggTimerPhaseTime={setEggTimerPhaseTime}
                    setEggTimerPhaseName={setEggTimerPhaseName}
                    setEggTimerSound={setEggTimerSound}
                    setEggTimerType={setEggTimerType}
                    setEggTimerInterval={setEggTimerInterval}
                    getEggTimerDuration={getEggTimerDuration}
                    getTotalCookingTime={getEggTimerTotalTime}
                    formatTime={formatTime}
                    playBellSound={playBellSound}
                    playChimeSound={playChimeSound}
                    playBeepSound={playBeepSound}
                    playAlarmSound={playAlarmSound}
                    timerSettings={timerSettings}
                  />
                );
              } else if (feature.id === "self-analysis") {
                return (
                  <SelfAnalysisComponent
                    key={feature.id}
                    showSelfAnalysis={showSelfAnalysis}
                    setShowSelfAnalysis={setShowSelfAnalysis}
                    selfAnalysisTab={selfAnalysisTab}
                    setSelfAnalysisTab={setSelfAnalysisTab}
                    personalProfile={personalProfile}
                    setPersonalProfile={setPersonalProfile}
                    habits={habits}
                    setHabits={setHabits}
                    habitHistory={habitHistory}
                    setHabitHistory={setHabitHistory}
                    habitStreak={habitStreak}
                    setHabitStreak={setHabitStreak}
                    moodLogs={moodLogState.moodLogs}
                    setMoodLogs={moodLogState.setMoodLogs as React.Dispatch<React.SetStateAction<MoodLog[]>>}
                    goals={goals}
                    setGoals={setGoals}
                    learningRecords={learningRecords}
                    setLearningRecords={setLearningRecords}
                    timeEntries={timeEntries}
                    calculateTimeBreakdown={calculateTimeBreakdown}
                    calculateProductivityTrend={calculateProductivityTrend as unknown as () => { date: string; workHours: number; dayOfWeek: string; }[]}
                    calculateProductivityStats={calculateProductivityStats}
                    loadTimeEntries={loadTimeEntries}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
              } else {
                console.log("Unknown feature:", feature.name, feature.id);
                return null;
              }
            })}
          </main>
        </div>

        {/* キャラクター達のお家モーダル */}
        {showCharacterHome && (
          <div className="character-home-modal">
            <div
              className="modal-overlay"
              onClick={handleCharacterHomeToggle}
            ></div>
            <div className="character-home-modal-content">
              <div className="character-home-modal-header">
                <h2><i className="bi bi-house"></i> キャラクター達のお家</h2>
                <button
                  onClick={handleCharacterHomeToggle}
                  className="close-button"
                >
                  ✕
                </button>
              </div>
              <CharacterHome
                onSelectCharacter={handleSelectCharacter}
                currentCharacter={currentCharacter}
              />
            </div>
          </div>
        )}

        {/* テーマ設定モーダル */}
        {showThemeSettings && (
          <div className="theme-settings-modal">
            <div className="theme-settings-content">
              <div className="theme-settings-header">
                <h3><i className="bi bi-palette"></i> テーマ設定</h3>
                <button
                  onClick={() => setShowThemeSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="theme-settings-body">
                <div className="theme-preview">
                  <p>
                    現在のテーマ:{" "}
                    {
                      availableThemes.find((t) => t.value === selectedTheme)
                        ?.preview
                    }{" "}
                    {
                      availableThemes.find((t) => t.value === selectedTheme)
                        ?.label
                    }
                  </p>
                </div>
                <div className="theme-options">
                  {availableThemes.map((theme) => (
                    <label key={theme.value} className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.value}
                        checked={selectedTheme === theme.value}
                        onChange={(e) => handleThemeChange(e.target.value)}
                      />
                      <span className="theme-preview-icon">
                        {theme.preview}
                      </span>
                      <span className="theme-label">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フォント設定モーダル */}
        {showFontSettings && (
          <div className="font-settings-modal">
            <div className="font-settings-content">
              <div className="font-settings-header">
                <h3>フォント設定</h3>
                <div className="header-buttons">
                  <button
                    onClick={() => {
                      setShowFontSettings(false);
                      setShowLanguageFontSettings(true);
                    }}
                    className="language-font-button"
                  >
                    🌐 言語別設定
                  </button>
                  <button
                    onClick={() => setShowFontSettings(false)}
                    className="close-button"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="font-settings-body">
                <div className="font-preview">
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    フォントプレビュー: {selectedFont}
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    <i className="bi bi-clock"></i> Work Time Tracker <i className="bi bi-book"></i>
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    👋 こんにちは、梅澤寛太さん！
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    <i className="bi bi-palette"></i> テーマ <i className="bi bi-fonts"></i> フォント <i className="bi bi-gear"></i> 機能設定 <i className="bi bi-box-arrow-right"></i> ログアウト
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    時間記録 | プロジェクト | レポート | 管理者パネル
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    本棚 | メモ | 公開メモ | お仕事記録
                  </p>
                  <p
                    style={{
                      fontFamily: selectedFont === "system" ? "" : selectedFont,
                    }}
                  >
                    作業内容を入力してください | <i className="bi bi-play-fill"></i> 記録開始
                  </p>
                </div>
                <div className="font-options">
                  {availableFonts.map((font) => (
                    <label key={font.value} className="font-option">
                      <input
                        type="radio"
                        name="font"
                        value={font.value}
                        checked={selectedFont === font.value}
                        onChange={(e) => handleFontChange(e.target.value)}
                      />
                      <span
                        style={{
                          fontFamily: font.value === "system" ? "" : font.value,
                        }}
                      >
                        {font.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 言語別フォント設定モーダル */}
        <LanguageFontSettings
          isOpen={showLanguageFontSettings}
          onClose={() => setShowLanguageFontSettings(false)}
          onSave={handleLanguageFontSave}
          currentSettings={fontSettings}
        />

        {/* 機能設定モーダル */}
        {showFeatureSettings && (
          <div className="feature-settings-modal">
            <div className="feature-settings-content">
              <div className="feature-settings-header">
                <h3><i className="bi bi-gear"></i> 機能設定</h3>
                <button
                  onClick={() => setShowFeatureSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="feature-settings-body">
                <div className="feature-settings-section">
                  <h4><i className="bi bi-journal-text"></i> 日記リマインダー設定</h4>
                  <button
                    onClick={() => setShowDiaryReminderSettings(true)}
                    className="reminder-settings-btn"
                  >
                    <i className="bi bi-journal-text"></i> リマインダー設定を開く
                  </button>
                </div>

                <div className="feature-settings-section">
                  <h4><i className="bi bi-list-ul"></i> 機能の並び順</h4>
                  <p>
                    ドラッグ&ドロップまたは↑↓ボタンで機能の順序を変更できます
                  </p>
                  <div className="mobile-hint">
                    <span className="hint-icon">👆</span>
                    <span className="hint-text">
                      モバイルでは長押ししてドラッグできます
                    </span>
                  </div>
                  <div className="feature-list">
                    {getFeatureOrder().map((featureId) => {
                      const feature = features.find((f) => f.id === featureId);
                      if (!feature) return null;
                      return (
                        <div
                          key={feature.id}
                          className={`feature-item ${
                            draggedFeature === feature.id ? "dragging" : ""
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, feature.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, feature.id)}
                          onTouchStart={(e) => handleTouchStart(e, feature.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={(e) => handleTouchEnd(e, feature.id)}
                        >
                          <div className="feature-drag-handle">⋮⋮</div>
                          <div className="feature-item-content">
                            <div className="feature-icon">
                              <HetamaIconComponent
                                featureId={feature.id}
                                size="medium"
                              />
                            </div>
                            <div className="feature-info">
                              <div className="feature-name">{feature.name}</div>
                              <div className="feature-description">
                                {feature.description}
                              </div>
                            </div>
                          </div>
                          <div className="feature-controls">
                            <div className="feature-order-controls">
                              <button
                                className="order-button up-button"
                                onClick={() => moveFeatureUp(feature.id)}
                                disabled={
                                  userSettings?.featureOrder.indexOf(
                                    feature.id
                                  ) === 0
                                }
                                title="上に移動"
                              >
                                ↑
                              </button>
                              <button
                                className="order-button down-button"
                                onClick={() => moveFeatureDown(feature.id)}
                                disabled={
                                  userSettings?.featureOrder.indexOf(
                                    feature.id
                                  ) ===
                                  (userSettings?.featureOrder.length || 0) - 1
                                }
                                title="下に移動"
                              >
                                ↓
                              </button>
                            </div>
                            <div className="feature-toggle">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  id="manner-mode-toggle"
                                  aria-label="マナーモード切り替え"
                                  checked={
                                    !userSettings?.hiddenFeatures.includes(
                                      feature.id
                                    )
                                  }
                                  onChange={() =>
                                    handleFeatureToggle(feature.id)
                                  }
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="feature-settings-actions">
                  <button
                    onClick={() => setShowFeatureSettings(false)}
                    className="save-button"
                  >
                    💾 設定を保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 日記リマインダー機能 */}
        <DiaryReminderIntegration
          showDiaryReminderSettings={showDiaryReminderSettings}
          setShowDiaryReminderSettings={setShowDiaryReminderSettings}
          diaryReminderSnoozeUntil={diaryReminderSnoozeUntil}
          setDiaryReminderSnoozeUntil={setDiaryReminderSnoozeUntil}
          onOpenDiaryForm={openDiaryForm}
        />

        {/* エラー報告モーダル */}
        <SimpleErrorReportingModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          onSubmit={handleErrorReport as unknown as (errorReport: { title: string; content: string; errorDetails: string; userAgent: string; timestamp: string; }) => Promise<void>}
          errorInfo={getErrorInfo(currentError)}
        />

        {/* 独立したエラー報告モーダル */}
        <SimpleErrorReportingModal
          isOpen={showSimpleErrorModal}
          onClose={() => setShowSimpleErrorModal(false)}
          onSubmit={handleSimpleErrorReport}
          errorInfo={getErrorInfo(currentError)}
        />
      </div>
    );
  }

  return (
    <>
      <LoginForm
        isRegisterMode={isRegisterMode}
        setIsRegisterMode={setIsRegisterMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        displayName={displayName}
        setDisplayName={setDisplayName}
        loading={loading}
        message={message}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />
        <SimpleErrorReportingModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          onSubmit={handleErrorReport as unknown as (errorReport: { title: string; content: string; errorDetails: string; userAgent: string; timestamp: string; }) => Promise<void>}
          errorInfo={getErrorInfo(currentError)}
        />
    </>
  );
}

// Appコンポーネントを複数のプロバイダーでラップ
const AppWithProviders = () => {
  const [user, setUser] = useState<User | null>(null);
  const [customTimerActive, setCustomTimerActive] = useState(false);
  
  return (
    <LoadingStateProvider>
      <TimeTrackingStateProvider user={user}>
        <TimerPresetProvider 
          onStartTimer={(minutes, seconds, name) => {
            // カスタムタイマーを開始する処理
            console.log(`Starting timer: ${name} for ${minutes}:${seconds}`);
          }}
          onStopTimer={() => {
            // カスタムタイマーを停止する処理
            console.log('Stopping timer');
          }}
          onResetTimer={() => {
            // カスタムタイマーをリセットする処理
            console.log('Resetting timer');
          }}
          isTimerActive={customTimerActive}
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
