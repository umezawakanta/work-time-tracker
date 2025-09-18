import React, { useState, useEffect } from "react";
import "./App.css";
import CharacterHome from "./components/CharacterHome";
import CustomTimer from "./components/CustomTimer";
import ProjectsSection from "./components/ProjectsSection";
import CookingTimerSection from "./components/CookingTimerSection";
import TimeTrackingSection from "./components/TimeTrackingSection";
import LoginForm from "./components/LoginForm";
import PresetTimersSection from "./components/PresetTimersSection";
import VersionInfoComponent from "./components/VersionInfo";
import TimerStatsSection from "./components/TimerStatsSection";
import TimerHistoryComponent from "./components/TimerHistoryComponent";
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

import type {
  User,
  TimeEntry,
  Project,
  ReportSummary,
  AdminUser,
  Book,
  Memo,
  Reply,
  Character,
  SalaryRecord,
  WorkDiary,
  UserSettings,
  Feature,
  Habit,
  MoodLog,
  Goal,
  Milestone,
  LearningRecord,
} from "./types";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 各機能のローディング状態
  const [memosLoading, setMemosLoading] = useState(false);
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);

  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(
    null
  );
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<string>("");
  const [startTime, setStartTime] = useState<Date | null>(null);

  // ゆでたまごタイマーの状態
  const [eggTimerActive, setEggTimerActive] = useState(false);
  const [eggTimerPaused, setEggTimerPaused] = useState(false);
  const [eggTimerTime, setEggTimerTime] = useState(0); // 残り時間（秒）
  const [eggTimerInterval, setEggTimerInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [eggTimerType, setEggTimerType] = useState<"soft" | "medium" | "hard">(
    "medium"
  );
  const [eggTimerSound, setEggTimerSound] = useState<
    "bell" | "chime" | "beep" | "alarm"
  >("bell");
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = useState(0); // 元の時間を保存
  const [eggTimerPhase, setEggTimerPhase] = useState<
    "heating" | "boiling" | "cooking"
  >("heating"); // 現在の段階
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = useState(0); // 現在の段階の残り時間
  const [eggTimerPhaseName, setEggTimerPhaseName] = useState(""); // 現在の段階名

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
  const [reportsLoading, setReportsLoading] = useState(false);

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
  const [publicMemoViewMode, setPublicMemoViewMode] = useState<
    "list" | "calendar"
  >("list");
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

  // カスタムジャンル管理の状態
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  // 返信機能の状態
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // お仕事記録の状態
  const [showWorkRecords, setShowWorkRecords] = useState(false);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [editingSalaryRecord, setEditingSalaryRecord] =
    useState<SalaryRecord | null>(null);
  const [editingDiary, setEditingDiary] = useState<WorkDiary | null>(null);

  // 給料記録フォームの状態
  const [salaryDate, setSalaryDate] = useState("");
  const [salary, setSalary] = useState("");
  const [transportation, setTransportation] = useState("");
  const [miscellaneous, setMiscellaneous] = useState("");
  const [other, setOther] = useState("");
  const [salaryMemo, setSalaryMemo] = useState("");
  const [recordType, setRecordType] = useState<"income" | "expense">("income");

  // 日記フォームの状態
  const [diaryDate, setDiaryDate] = useState("");
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryMood, setDiaryMood] = useState("😊");
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newPersonality, setNewPersonality] = useState("");

  // 習慣トラッカー関連の状態
  const [newHabit, setNewHabit] = useState("");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [habitStreak, setHabitStreak] = useState<{ [key: string]: number }>({});
  const [habitHistory, setHabitHistory] = useState<{ [key: string]: string[] }>(
    {}
  );

  // 感情ログ関連の状態
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

  // プロフィール管理関数
  const addToProfile = (field: keyof typeof personalProfile, value: string) => {
    if (!value.trim()) return;

    setPersonalProfile((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()],
    }));
  };

  const removeFromProfile = (
    field: keyof typeof personalProfile,
    index: number
  ) => {
    setPersonalProfile((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const updateProfileField = (
    field: keyof typeof personalProfile,
    value: string
  ) => {
    setPersonalProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 習慣トラッカー管理関数
  const addHabit = () => {
    if (!newHabit.trim()) return;

    const habitId = Date.now().toString();
    const newHabitObj: Habit = {
      id: habitId,
      name: newHabit.trim(),
      description: "",
      frequency: "daily",
      targetDays: 7,
      completedDays: 0,
      streak: 0,
      bestStreak: 0,
      category: "personal",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setHabits((prev) => [...prev, newHabitObj]);
    setHabitStreak((prev) => ({ ...prev, [habitId]: 0 }));
    setHabitHistory((prev) => ({ ...prev, [habitId]: [] }));
    setNewHabit("");
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    setHabitStreak((prev) => {
      const newStreak = { ...prev };
      delete newStreak[habitId];
      return newStreak;
    });
    setHabitHistory((prev) => {
      const newHistory = { ...prev };
      delete newHistory[habitId];
      return newHistory;
    });
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const history = habitHistory[habitId] || [];
    const isCompleted = history.includes(date);

    if (isCompleted) {
      setHabitHistory((prev) => ({
        ...prev,
        [habitId]: history.filter((d) => d !== date),
      }));
    } else {
      setHabitHistory((prev) => ({
        ...prev,
        [habitId]: [...history, date],
      }));
    }
  };

  const getHabitCompletionRate = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const history = habitHistory[habitId] || [];
    const daysSinceStart = Math.ceil(
      (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceStart > 0 ? (history.length / daysSinceStart) * 100 : 0;
  };

  // 感情ログ管理関数
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

    setMoodLogs((prev) => [...prev, newMoodLog]);
    resetMoodForm();
  };

  const updateMoodLog = (moodLogId: string, updates: Partial<MoodLog>) => {
    setMoodLogs((prev) =>
      prev.map((log) => (log.id === moodLogId ? { ...log, ...updates } : log))
    );
  };

  const deleteMoodLog = (moodLogId: string) => {
    setMoodLogs((prev) => prev.filter((log) => log.id !== moodLogId));
  };

  const resetMoodForm = () => {
    setMoodForm({
      date: new Date().toISOString().split("T")[0],
      mood: 5,
      energy: 5,
      stress: 5,
      notes: "",
      activities: [],
      weather: "sunny",
      sleep: 8,
    });
    setNewActivity("");
    setShowMoodForm(false);
    setEditingMoodLog(null);
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setMoodForm((prev) => ({
      ...prev,
      activities: [...prev.activities, newActivity.trim()],
    }));
    setNewActivity("");
  };

  const removeActivity = (index: number) => {
    setMoodForm((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const editMoodLog = (log: MoodLog) => {
    setMoodForm({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
      notes: log.notes,
      activities: log.activities,
      weather: log.weather,
      sleep: log.sleep,
    });
    setEditingMoodLog(log.id);
    setShowMoodForm(true);
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
    if (mood <= 2) return "😢";
    if (mood <= 4) return "😔";
    if (mood <= 6) return "😐";
    if (mood <= 8) return "😊";
    return "😄";
  };

  const getAverageMood = () => {
    if (moodLogs.length === 0) return 0;
    return moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodLogs.length;
  };

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
    setLearningRecords(learningRecords.filter((r) => r.id !== recordId));
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
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<
    "salary" | "diary" | null
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
    order = order.filter((id) => features.some((f) => f.id === id));

    return order;
  };

  // 表示する機能を取得

  // 日時フォーマット関数（他のセクション用）
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // メモのタイトルを取得するヘルパー関数（他のセクション用）
  const getMemoTitle = (memo: Memo): string => {
    if (memo.title && memo.title.trim()) {
      return memo.title;
    }
    // タイトルが空の場合は内容の一行目を返す
    const firstLine = memo.content.split("\n")[0].trim();
    return firstLine || "無題";
  };

  // メモカテゴリを取得する関数（他のセクション用）
  const getMemoCategories = () => {
    const memoCategories = new Set(memos.map((memo) => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

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

          const todayReplies = memo.replies.filter((reply) => {
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

          const todayReplies = memo.replies.filter((reply) => {
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
    if (hiddenFeatures.includes("self-analysis")) {
      hiddenFeatures = hiddenFeatures.filter((id) => id !== "self-analysis");
    }

    const visibleFeatures = order
      .filter((id) => !hiddenFeatures.includes(id))
      .map((id) => features.find((f) => f.id === id))
      .filter(Boolean) as Feature[];

    return visibleFeatures;
  };

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

  // カスタムジャンルの読み込み
  useEffect(() => {
    const savedGenres = localStorage.getItem("customGenres");
    if (savedGenres) {
      try {
        setCustomGenres(JSON.parse(savedGenres));
      } catch (error) {
        console.error("Failed to load custom genres:", error);
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
  const loadSalaryRecords = async () => {
    setSalaryLoading(true);
    try {
      if (!user?.id) {
        return;
      }
      const response = await fetch(
        `/api/work-records/salary?userId=${user.id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setSalaryRecords(data.records);
      } else {
        console.error("Failed to load salary records:", data.message);
        setMessage(`給料記録の読み込みに失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load salary records:", error);
      setMessage(
        `給料記録の読み込みに失敗しました: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setSalaryLoading(false);
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
  const loadSalaryRecordsWithUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/work-records/salary?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setSalaryRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to load salary records:", error);
    }
  };

  const loadWorkDiariesWithUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/work-records/diary?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
      }
    } catch (error) {
      console.error("Failed to load work diaries:", error);
    }
  };

  // 時間記録の履歴を取得
  const loadTimeEntries = async () => {
    setTimeEntriesLoading(true);
    try {
      const response = await fetch("/api/time/entries", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        console.warn("時間記録APIが利用できません。モックデータを使用します。");
        // モックデータを使用
        setTimeEntries([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTimeEntries(data.entries);
      } else {
        console.warn(
          "時間記録の取得に失敗しました。モックデータを使用します。"
        );
        setTimeEntries([]);
      }
    } catch (error) {
      console.warn(
        "時間記録の読み込みに失敗しました。モックデータを使用します。",
        error
      );
      setTimeEntries([]);
    } finally {
      setTimeEntriesLoading(false);
    }
  };

  // 時間記録データからカテゴリ別の時間を計算
  const calculateTimeBreakdown = () => {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // 今日の時間記録をフィルタリング
    const todayEntries = timeEntries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfDay && entry.endTime;
    });

    // カテゴリ別に時間を集計
    const categories: { [key: string]: number } = {
      仕事: 0,
      学習: 0,
      休憩: 0,
      その他: 0,
    };

    todayEntries.forEach((entry) => {
      const duration = entry.duration || 0; // 秒単位
      const hours = duration / 3600; // 時間単位に変換

      // 説明文からカテゴリを推定（簡単なキーワードマッチング）
      const description = entry.description.toLowerCase();
      if (
        description.includes("仕事") ||
        description.includes("work") ||
        description.includes("作業")
      ) {
        categories["仕事"] += hours;
      } else if (
        description.includes("学習") ||
        description.includes("study") ||
        description.includes("勉強") ||
        description.includes("読書")
      ) {
        categories["学習"] += hours;
      } else if (
        description.includes("休憩") ||
        description.includes("break") ||
        description.includes("休み")
      ) {
        categories["休憩"] += hours;
      } else {
        categories["その他"] += hours;
      }
    });

    return categories;
  };

  // 過去7日間の生産性データを計算
  const calculateProductivityTrend = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // 7日間（今日含む）

    const productivityData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(startOfDay.getDate() + 1);

      // その日の時間記録をフィルタリング
      const dayEntries = timeEntries.filter((entry) => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= startOfDay && entryDate < endOfDay && entry.endTime;
      });

      // その日の総作業時間を計算（仕事と学習の時間）
      const totalWorkHours = dayEntries.reduce((total, entry) => {
        const duration = entry.duration || 0;
        const hours = duration / 3600;
        const description = entry.description.toLowerCase();

        // 仕事と学習の時間のみをカウント
        if (
          description.includes("仕事") ||
          description.includes("work") ||
          description.includes("作業") ||
          description.includes("学習") ||
          description.includes("study") ||
          description.includes("勉強") ||
          description.includes("読書")
        ) {
          return total + hours;
        }
        return total;
      }, 0);

      productivityData.push({
        date: date.toISOString().split("T")[0],
        workHours: totalWorkHours,
        dayOfWeek: ["日", "月", "火", "水", "木", "金", "土"][date.getDay()],
      });
    }

    return productivityData;
  };

  // 生産性統計を計算
  const calculateProductivityStats = () => {
    const productivityData = calculateProductivityTrend();
    const workHours = productivityData.map((day) => day.workHours);

    const totalHours = workHours.reduce((sum, hours) => sum + hours, 0);
    const averageHours = totalHours / workHours.length;
    const maxHours = Math.max(...workHours);
    const productiveDays = workHours.filter((hours) => hours > 0).length;

    return {
      averageHours: averageHours,
      maxHours: maxHours,
      totalHours: totalHours,
      productiveDays: productiveDays,
      productivityRate: (productiveDays / workHours.length) * 100,
    };
  };

  const handleCreateSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      // 記録タイプに基づいて金額を正負に変換
      const salaryAmount =
        recordType === "expense"
          ? -Math.abs(Number(salary))
          : Math.abs(Number(salary));

      const response = await fetch("/api/work-records/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          date: salaryDate,
          salary: salaryAmount,
          transportation: Number(transportation) || 0,
          miscellaneous: Number(miscellaneous) || 0,
          other: Number(other) || 0,
          memo: salaryMemo,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("収入・支出記録が作成されました！");
        setSalaryDate("");
        setSalary("");
        setTransportation("");
        setMiscellaneous("");
        setOther("");
        setSalaryMemo("");
        setRecordType("income");
        setShowSalaryForm(false);
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleUpdateSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingSalaryRecord) return;

    try {
      // 記録タイプに基づいて金額を正負に変換
      const salaryAmount =
        recordType === "expense"
          ? -Math.abs(Number(salary))
          : Math.abs(Number(salary));

      const response = await fetch(
        `/api/work-records/salary/${editingSalaryRecord._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            date: salaryDate,
            salary: salaryAmount,
            transportation: Number(transportation) || 0,
            miscellaneous: Number(miscellaneous) || 0,
            other: Number(other) || 0,
            memo: salaryMemo,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("収入・支出記録を更新しました！");
        setSalaryDate("");
        setSalary("");
        setTransportation("");
        setMiscellaneous("");
        setOther("");
        setSalaryMemo("");
        setRecordType("income");
        setEditingSalaryRecord(null);
        setShowSalaryForm(false);
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
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
        setDiaryMood("😊");
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
        setDiaryMood("😊");
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

  const handleDeleteSalaryRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/work-records/salary?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setMessage("給料記録が削除されました！");
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      const response = await fetch(`/api/work-records/diary?id=${id}`, {
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

  // 配列項目を管理する関数
  const addArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setter((prev) => [...prev, value.trim()]);
      setValue("");
    }
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
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
        const updatedOrder = existingOrder.filter((id: string) =>
          currentFeatureIds.includes(id)
        );
        currentFeatureIds.forEach((featureId) => {
          if (!updatedOrder.includes(featureId)) {
            updatedOrder.push(featureId);
          }
        });

        const updatedHidden = existingHidden.filter((id: string) =>
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

    const isHidden = currentSettings.hiddenFeatures.includes(featureId);
    const newHiddenFeatures = isHidden
      ? currentSettings.hiddenFeatures.filter((id) => id !== featureId)
      : [...currentSettings.hiddenFeatures, featureId];

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

  const getRecordsForDate = (date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const filteredSalaryRecords = salaryRecords.filter((record) => {
      // データベースの日付を日本時間に変換して比較
      const recordDate = new Date(record.date);
      const recordJstDateStr = new Date(
        recordDate.getTime() + 9 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];

      return recordJstDateStr === jstDateStr;
    });

    const filteredDiaries = workDiaries.filter((diary) => {
      // データベースの日付を日本時間に変換して比較
      const diaryDate = new Date(diary.date);
      const diaryJstDateStr = new Date(diaryDate.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      return diaryJstDateStr === jstDateStr;
    });

    return { salaryRecords: filteredSalaryRecords, diaries: filteredDiaries };
  };

  // 月間収支を計算する関数
  const getMonthlySummary = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    let totalIncome = 0;
    let totalExpense = 0;

    salaryRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        if (record.salary > 0) {
          totalIncome += record.salary;
        } else {
          totalExpense += Math.abs(record.salary);
        }

        // 交通費、雑費、その他も収入として計算
        if (record.transportation > 0) totalIncome += record.transportation;
        if (record.miscellaneous > 0) totalIncome += record.miscellaneous;
        if (record.other > 0) totalIncome += record.other;
      }
    });

    const netIncome = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netIncome,
      recordCount: salaryRecords.filter((record) => {
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
    setSalaryDate(jstDateStr);
    setDiaryDate(jstDateStr);
  };

  const handleRecordClick = (type: "salary" | "diary", date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setSelectedDate(date);

    // その日の記録を取得
    const dayRecords = getRecordsForDate(date);

    if (type === "salary" && dayRecords.salaryRecords.length > 0) {
      setSelectedRecord(dayRecords.salaryRecords[0]);
      setSelectedRecordType("salary");
      setShowRecordDetail(true);
      setShowSalaryForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    } else if (type === "diary" && dayRecords.diaries.length > 0) {
      setSelectedRecord(dayRecords.diaries[0]);
      setSelectedRecordType("diary");
      setShowRecordDetail(true);
      setShowSalaryForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    }
  };

  const handleSpecificRecordClick = (record: any, type: "salary" | "diary") => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewSalaryRecord = (record: any) => {
    setSelectedRecord(record);
    setSelectedRecordType("salary");
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewDiary = (diary: any) => {
    setSelectedRecord(diary);
    setSelectedRecordType("diary");
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const editSalaryRecord = (record: any) => {
    setSalaryDate(record.date.split("T")[0]);
    setSalary(Math.abs(record.salary).toString()); // 絶対値で表示
    setTransportation(record.transportation.toString());
    setMiscellaneous(record.miscellaneous.toString());
    setOther(record.other.toString());
    setSalaryMemo(record.memo || "");
    setRecordType(record.salary >= 0 ? "income" : "expense"); // 正負に基づいてタイプを設定
    setEditingSalaryRecord(record);
    setShowSalaryForm(true);
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
    setShowSalaryForm(false);
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

  // カスタムジャンル管理関数
  const handleAddGenre = () => {
    if (newGenreName.trim() && !customGenres.includes(newGenreName.trim())) {
      const updatedGenres = [...customGenres, newGenreName.trim()];
      setCustomGenres(updatedGenres);
      localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
      setNewGenreName("");
    }
  };

  const handleDeleteGenre = (genreToDelete: string) => {
    const updatedGenres = customGenres.filter(
      (genre) => genre !== genreToDelete
    );
    setCustomGenres(updatedGenres);
    localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
  };

  // ジャンル管理の追加関数
  const handleEditGenre = (genre: string) => {
    setEditingGenre(genre);
    setEditingGenreName(genre);
  };

  const handleSaveGenreEdit = () => {
    if (editingGenreName.trim() && editingGenreName.trim() !== editingGenre) {
      const updatedGenres = customGenres.map((genre) =>
        genre === editingGenre ? editingGenreName.trim() : genre
      );
      setCustomGenres(updatedGenres);
      localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
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
      const updatedGenres = customGenres.filter(
        (genre) => genre !== genreToDelete
      );
      setCustomGenres(updatedGenres);
      localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
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
    setShowSalaryForm(false);
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
    setDiaryNextGoals("");
    setDiaryChallenges("");
    setDiaryAchievements([]);
    setDiaryGratitude("");
    setDiaryReflection("");
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
    return [...defaultGenres, ...customGenres];
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
  }, []);

  // バッジの更新
  useEffect(() => {
    if (isLoggedIn && (memos || publicMemos)) {
      const count = calculateNotificationCount();
      updateAppBadge(count);
    }
  }, [memos, publicMemos, isLoggedIn]);

  // ログイン状態が変更された時にデータを読み込み
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadProjects();
      loadReportSummary();
      loadSalaryRecords();
      loadWorkDiaries();
      loadUserSettings();
      loadTimeEntries();
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
        loadSalaryRecordsWithUserId(userId); // 給料記録を読み込み
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
    setReportsLoading(true);
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
      setReportsLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
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
      setAdminUsersLoading(false);
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
      prevUsers.filter((user) => user.id !== userId)
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
    setMemosLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (selectedMemoCategory !== "all") {
        params.append("category", selectedMemoCategory);
      }
      if (memoSearchTerm) {
        params.append("search", memoSearchTerm);
      }

      const response = await fetch(`/api/memos?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMemos(data.memos || []);
      } else {
        setMessage(`メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load memos:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setMemosLoading(false);
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
        }),
      });

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
      } else {
        setMessage(`メモの追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // 公開メモ用のカレンダー関数
  const getPublicMemosForDate = (date: Date) => {
    const dateString = date.toDateString();
    return publicMemos.filter((memo) => {
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

      const data = await response.json();

      if (data.success) {
        setMessage("メモを更新しました！");
        setEditingMemo(null);
        setShowMemoForm(false);
        loadMemos();
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

      const data = await response.json();

      if (data.success) {
        setMessage("メモを削除しました");
        loadMemos();
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

      const data = await response.json();

      if (data.success) {
        setPublicMemos(data.memos || []);
      } else {
        setMessage(`公開メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load public memos:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
    setSalaryRecords([]);
    setWorkDiaries([]);
    setReportSummary(null);
    setUserSettings(null);
    setBooks([]);
    setMemos([]);
    setPublicMemos([]);
    setAdminUsers([]);
  };

  const handleStartTracking = async () => {
    if (!description.trim()) {
      setMessage("作業内容を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/time/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.success) {
        const newEntry: TimeEntry = {
          id: data.entry.id,
          description,
          startTime: new Date(data.entry.startTime),
        };
        setCurrentTimeEntry(newEntry);
        setIsTracking(true);
        setIsTimeTrackingActive(true);
        setElapsedTime(0);
        setMessage("時間記録を開始しました");
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ 時間記録開始エラー:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleStopTracking = async () => {
    if (!currentTimeEntry) {
      setMessage("エラー: 記録中の時間記録が見つかりません");
      return;
    }

    try {
      const response = await fetch("/api/time/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ entryId: currentTimeEntry.id }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTimeEntry(null);
        setIsTracking(false);
        setIsTimeTrackingActive(false);
        setElapsedTime(0);
        setDescription("");
        setMessage(
          `時間記録を停止しました。記録時間: ${formatTime(data.entry.duration)}`
        );
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ 時間記録停止エラー:", error);
      setMessage(
        `エラー: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // 時間記録を強制的にリセットする関数
  const handleResetTracking = () => {
    console.log("🔄 時間記録を強制リセットします");
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setIsTimeTrackingActive(false);
    setElapsedTime(0);
    setDescription("");
    setMessage("時間記録をリセットしました");
  };

  // ゆでたまごタイマーの関数
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

  const playEggTimerSound = async () => {
    if (!timerSettings.enableSounds) return;

    console.log("🔊 ゆでたまごタイマー音声再生開始:", eggTimerSound);
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
              `⏰ ${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`
            );

            // ブラウザ通知を送信
            sendNotification(
              "⏰ タイマー終了！",
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
              `⏰ ${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`
            );

            // ブラウザ通知を送信
            sendNotification(
              "⏰ タイマー終了！",
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

  // プリセットタイマーの関数
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
            "⏰ プリセットタイマー終了！",
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
                  setMessage(`⏰ ${data.timerName}タイマー終了！`);

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
      setMessage("🔊 音声モードに切り替えました");
    } else {
      // マナーモードを有効にする
      setMessage("🔇 マナーモードに切り替えました（振動のみ）");
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
                    timeEntries={timeEntries}
                    timeEntriesLoading={timeEntriesLoading}
                    currentProject={currentProject}
                    setCurrentProject={setCurrentProject}
                    description={description}
                    setDescription={setDescription}
                    isTracking={isTracking}
                    startTime={startTime}
                    elapsedTime={elapsedTime}
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
                    salaryRecords={salaryRecords}
                    workDiaries={workDiaries}
                    reportsLoading={reportsLoading}
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
                    memosLoading={memosLoading}
                    showMemos={showMemos}
                    setShowMemos={setShowMemos}
                    showMemoForm={showMemoForm}
                    editingMemo={editingMemo}
                    memoTitle={memoTitle}
                    setMemoTitle={setMemoTitle}
                    memoContent={memoContent}
                    setMemoContent={setMemoContent}
                    memoCategory={memoCategory}
                    setMemoCategory={setMemoCategory}
                    memoIsPublic={memoIsPublic}
                    setMemoIsPublic={setMemoIsPublic}
                    selectedMemoCategory={selectedMemoCategory}
                    setSelectedMemoCategory={setSelectedMemoCategory}
                    customGenres={customGenres}
                    showGenreManagement={showGenreManagement}
                    setShowGenreManagement={setShowGenreManagement}
                    editingGenre={editingGenre}
                    setEditingGenre={setEditingGenre}
                    editingGenreName={editingGenreName}
                    setEditingGenreName={setEditingGenreName}
                    setShowMemoForm={setShowMemoForm}
                    setEditingMemo={setEditingMemo}
                    handleCreateMemo={handleCreateMemo}
                    handleUpdateMemo={handleUpdateMemo}
                    handleEditMemo={handleEditMemo}
                    handleDeleteMemo={handleDeleteMemo}
                    handleMemoCategoryChange={handleMemoCategoryChange}
                    handleEditGenre={handleEditGenre}
                    handleSaveGenreEdit={handleSaveGenreEdit}
                    handleCancelGenreEdit={handleCancelGenreEdit}
                    handleDeleteGenreFromManagement={
                      handleDeleteGenreFromManagement
                    }
                    loadMemos={loadMemos}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
                return (
                  <div key={feature.id} className="public-memos-section">
                    <div className="section-header">
                      <h2>
                        <span className="section-icon">
                          <HetamaIconComponent featureId="memos" size="large" />
                        </span>
                        メモ
                      </h2>
                      <div className="section-controls">
                        {showMemos ? (
                          <button
                            onClick={() => {
                              setShowMemos(false);
                            }}
                            className="close-section-button"
                            title="セクションを閉じる"
                          >
                            ✕
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              closeOtherFeatures("memos");
                              setShowMemos(true);
                              if (memos.length === 0) {
                                loadMemos();
                              }
                            }}
                            className="show-section-button"
                            title="セクションを表示"
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                    </div>

                    {showMemos && (
                      <div className="memos-content">
                        {/* ジャンル管理ボタン */}
                        <div className="memos-controls">
                          <button
                            onClick={() =>
                              setShowGenreManagement(!showGenreManagement)
                            }
                            className="genre-management-button"
                          >
                            🏷️ ジャンル管理
                          </button>
                        </div>

                        {/* ジャンル管理セクション */}
                        {showGenreManagement && (
                          <div className="genre-management-section">
                            <h3>🏷️ ジャンル管理</h3>
                            <div className="genre-list">
                              {customGenres.map((genre, index) => (
                                <div key={index} className="genre-item">
                                  {editingGenre === genre ? (
                                    <div className="genre-edit-form">
                                      <input
                                        type="text"
                                        value={editingGenreName}
                                        onChange={(e) =>
                                          setEditingGenreName(e.target.value)
                                        }
                                        className="genre-edit-input"
                                        placeholder="ジャンル名を入力"
                                      />
                                      <button
                                        onClick={handleSaveGenreEdit}
                                        className="save-genre-button"
                                        disabled={
                                          !editingGenreName.trim() ||
                                          editingGenreName.trim() === genre
                                        }
                                      >
                                        保存
                                      </button>
                                      <button
                                        onClick={handleCancelGenreEdit}
                                        className="cancel-genre-button"
                                      >
                                        キャンセル
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="genre-display">
                                      <span className="genre-name">
                                        {genre}
                                      </span>
                                      <div className="genre-actions">
                                        <button
                                          onClick={() => handleEditGenre(genre)}
                                          className="edit-genre-button"
                                          title="編集"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteGenreFromManagement(
                                              genre
                                            )
                                          }
                                          className="delete-genre-button"
                                          title="削除"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {customGenres.length === 0 && (
                                <p className="no-genres">
                                  カスタムジャンルがありません
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="memos-stats">
                          <div className="stat-card">
                            <h3>総メモ数</h3>
                            <p className="stat-value">{memos.length}</p>
                          </div>
                          <div className="stat-card">
                            <h3>カテゴリ数</h3>
                            <p className="stat-value">
                              {getMemoCategories().length}
                            </p>
                          </div>
                          <div className="stat-card">
                            <h3>公開メモ</h3>
                            <p className="stat-value">
                              {memos.filter((memo) => memo.isPublic).length}
                            </p>
                          </div>
                        </div>

                        {showMemoForm && (
                          <form
                            onSubmit={
                              editingMemo ? handleUpdateMemo : handleCreateMemo
                            }
                            className="memo-form"
                          >
                            <h3>{editingMemo ? "メモを編集" : "メモを追加"}</h3>
                            <div className="form-group">
                              <label htmlFor="memoTitle">
                                タイトル（空欄の場合は内容の一行目が使用されます）
                              </label>
                              <input
                                type="text"
                                id="memoTitle"
                                value={memoTitle}
                                onChange={(e) => setMemoTitle(e.target.value)}
                                disabled={loading}
                                placeholder="タイトルを入力（省略可）"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="memoCategory">カテゴリ *</label>
                              <select
                                id="memoCategory"
                                value={memoCategory}
                                onChange={(e) =>
                                  setMemoCategory(e.target.value)
                                }
                                required
                                disabled={loading}
                              >
                                <option value="">選択してください</option>
                                {getAllGenres().map((genre) => (
                                  <option key={genre} value={genre}>
                                    {genre}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="form-group">
                              <label htmlFor="memoContent">内容 *</label>
                              <textarea
                                id="memoContent"
                                value={memoContent}
                                onChange={(e) => setMemoContent(e.target.value)}
                                required
                                disabled={loading}
                                rows={6}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="memoTags">
                                タグ（カンマ区切り）
                              </label>
                              <input
                                type="text"
                                id="memoTags"
                                value={memoTags}
                                onChange={(e) => setMemoTags(e.target.value)}
                                disabled={loading}
                                placeholder="例: 重要, 会議, プロジェクト"
                              />
                            </div>
                            <div className="form-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={memoIsPublic}
                                  onChange={(e) =>
                                    setMemoIsPublic(e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                公開メモにする
                              </label>
                            </div>
                            <div className="form-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={memoIsFamilyOnly}
                                  onChange={(e) =>
                                    setMemoIsFamilyOnly(e.target.checked)
                                  }
                                  disabled={loading}
                                />
                                家族のみ共有
                              </label>
                            </div>
                            {user?.role === "admin" && (
                              <div className="form-group">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={memoIsAdminOnly}
                                    onChange={(e) =>
                                      setMemoIsAdminOnly(e.target.checked)
                                    }
                                    disabled={loading}
                                  />
                                  管理者のみ投稿可能
                                </label>
                              </div>
                            )}
                            <button
                              type="submit"
                              disabled={loading}
                              className="submit-button"
                            >
                              {loading
                                ? "処理中..."
                                : editingMemo
                                ? "更新"
                                : "追加"}
                            </button>
                          </form>
                        )}

                        <div className="memos-controls">
                          <div className="search-controls">
                            <input
                              type="text"
                              placeholder="メモを検索..."
                              value={memoSearchTerm}
                              onChange={(e) =>
                                setMemoSearchTerm(e.target.value)
                              }
                              className="search-input"
                            />
                            <button
                              onClick={handleMemoSearch}
                              className="search-button"
                            >
                              検索
                            </button>
                            <button
                              onClick={loadMemos}
                              className="refresh-button"
                              title="メモを更新"
                            >
                              🔄
                            </button>
                            {(selectedMemoCategory !== "all" ||
                              memoSearchTerm) && (
                              <button
                                onClick={() => {
                                  setSelectedMemoCategory("all");
                                  setMemoSearchTerm("");
                                  loadMemos();
                                }}
                                className="reset-button"
                                title="フィルターをリセット"
                              >
                                🔄 リセット
                              </button>
                            )}
                          </div>
                          <div className="category-controls">
                            <select
                              value={selectedMemoCategory}
                              aria-label="メモカテゴリ選択"
                              onChange={(e) =>
                                handleMemoCategoryChange(e.target.value)
                              }
                              className="category-select"
                            >
                              <option value="all">すべてのカテゴリ</option>
                              {getMemoCategories().map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              if (!showGenreManager) {
                                closeOtherFeatures("genre-manager");
                              }
                              setShowGenreManager(!showGenreManager);
                            }}
                            className="genre-manager-button"
                          >
                            🏷️ ジャンル管理
                          </button>
                          <button
                            onClick={() => {
                              setEditingMemo(null);
                              setShowMemoForm(!showMemoForm);
                              if (!showMemoForm) {
                                setMemoTitle("");
                                setMemoContent("");
                                setMemoCategory("");
                                setMemoTags("");
                                setMemoIsPublic(false);
                                setMemoIsFamilyOnly(false);
                                setMemoIsAdminOnly(false);
                              }
                            }}
                            className="add-memo-button"
                          >
                            {showMemoForm ? "キャンセル" : "メモを追加"}
                          </button>
                        </div>

                        <div className="memos-list">
                          {memosLoading ? (
                            <div className="data-loading">
                              <div className="spinner"></div>
                              <p>メモを読み込み中...</p>
                            </div>
                          ) : memos.length === 0 ? (
                            <p className="no-memos">メモが登録されていません</p>
                          ) : (
                            memos.map((memo) => (
                              <div key={memo.id} className="memo-item">
                                <div className="memo-header">
                                  <h3>{getMemoTitle(memo)}</h3>
                                  <div className="memo-meta">
                                    <span
                                      className="memo-category clickable"
                                      onClick={() =>
                                        handleMemoCategoryChange(memo.category)
                                      }
                                      title={`${memo.category}でフィルター`}
                                    >
                                      {memo.category}
                                    </span>
                                    {memo.isPublic && (
                                      <span className="public-badge">公開</span>
                                    )}
                                    {memo.isFamilyOnly && (
                                      <span className="family-badge">
                                        家族のみ
                                      </span>
                                    )}
                                    {memo.isAdminOnly && (
                                      <span className="admin-badge">
                                        管理者専用
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="memo-content">
                                  <p>{memo.content}</p>
                                </div>
                                {memo.tags && memo.tags.length > 0 && (
                                  <div className="memo-tags">
                                    {memo.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="tag clickable"
                                        onClick={() => {
                                          setMemoSearchTerm(tag);
                                          loadMemos();
                                        }}
                                        title={`${tag}で検索`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {/* 返信セクション */}
                                {memo.replies && memo.replies.length > 0 && (
                                  <div className="memo-replies">
                                    <h4>💬 返信 ({memo.replies.length})</h4>
                                    {memo.replies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="reply-item"
                                      >
                                        <div className="reply-header">
                                          <span className="reply-author">
                                            {reply.authorName}
                                          </span>
                                          <div className="reply-meta">
                                            <span className="reply-date">
                                              {formatDateTime(reply.createdAt)}
                                            </span>
                                            {/* 自分がした返信の場合のみ編集・削除ボタンを表示 */}
                                            {user &&
                                              (user.email ===
                                                reply.authorEmail ||
                                                user.id ===
                                                  reply.authorEmail) && (
                                                <div className="reply-actions">
                                                  {editingReply === reply.id ? (
                                                    <div className="reply-edit-form">
                                                      <textarea
                                                        value={editReplyContent}
                                                        onChange={(e) =>
                                                          setEditReplyContent(
                                                            e.target.value
                                                          )
                                                        }
                                                        className="reply-edit-textarea"
                                                        placeholder="返信内容を入力してください"
                                                      />
                                                      <div className="reply-edit-actions">
                                                        <button
                                                          onClick={() =>
                                                            handleSaveEditReply(
                                                              reply.id
                                                            )
                                                          }
                                                          className="save-reply-button"
                                                          disabled={
                                                            !editReplyContent.trim()
                                                          }
                                                        >
                                                          保存
                                                        </button>
                                                        <button
                                                          onClick={
                                                            handleCancelEditReply
                                                          }
                                                          className="cancel-reply-button"
                                                        >
                                                          キャンセル
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <>
                                                      <button
                                                        onClick={() =>
                                                          handleEditReply(
                                                            reply.id,
                                                            reply.content
                                                          )
                                                        }
                                                        className="edit-reply-button"
                                                        title="編集"
                                                      >
                                                        ✏️
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleDeleteReply(
                                                            reply.id
                                                          )
                                                        }
                                                        className="delete-reply-button"
                                                        title="削除"
                                                      >
                                                        🗑️
                                                      </button>
                                                    </>
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                        {editingReply !== reply.id && (
                                          <div className="reply-content">
                                            {reply.content}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* デバッグ用：返信データの確認 */}
                                {process.env.NODE_ENV === "development" && (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "#666",
                                      marginTop: "5px",
                                    }}
                                  >
                                    Debug: replies=
                                    {memo.replies
                                      ? memo.replies.length
                                      : "undefined"}
                                  </div>
                                )}

                                <div className="memo-footer">
                                  <span className="memo-date">
                                    {formatDateTime(memo.updatedAt)}
                                  </span>
                                  <div className="memo-actions">
                                    <button
                                      onClick={() =>
                                        setReplyingToMemo(
                                          replyingToMemo === memo.id
                                            ? null
                                            : memo.id
                                        )
                                      }
                                      className="reply-button"
                                      title="返信する"
                                    >
                                      💬 返信
                                    </button>
                                    <button
                                      onClick={() => handleEditMemo(memo)}
                                      className="edit-button"
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMemo(
                                          memo.id,
                                          getMemoTitle(memo)
                                        )
                                      }
                                      className="delete-button"
                                    >
                                      削除
                                    </button>
                                  </div>
                                </div>

                                {/* 返信フォーム */}
                                {replyingToMemo === memo.id && (
                                  <div className="reply-form">
                                    <h4>💬 返信を投稿</h4>
                                    <textarea
                                      value={replyContent}
                                      onChange={(e) =>
                                        setReplyContent(e.target.value)
                                      }
                                      placeholder="返信内容を入力してください..."
                                      rows={3}
                                      className="reply-textarea"
                                    />
                                    <div className="reply-form-actions">
                                      <button
                                        onClick={() =>
                                          handleReplySubmit(memo.id)
                                        }
                                        disabled={
                                          !replyContent.trim() || loading
                                        }
                                        className="submit-reply-button"
                                      >
                                        {loading ? "投稿中..." : "返信を投稿"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReplyingToMemo(null);
                                          setReplyContent("");
                                        }}
                                        className="cancel-reply-button"
                                      >
                                        キャンセル
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* ジャンル管理モーダル */}
                    {showGenreManager && (
                      <div className="genre-manager-modal">
                        <div className="genre-manager-content">
                          <div className="genre-manager-header">
                            <h3>ジャンル管理</h3>
                            <button
                              onClick={() => setShowGenreManager(false)}
                              className="close-button"
                            >
                              ×
                            </button>
                          </div>
                          <div className="genre-manager-body">
                            <div className="add-genre-section">
                              <h4>新しいジャンルを追加</h4>
                              <div className="add-genre-form">
                                <input
                                  type="text"
                                  value={newGenreName}
                                  onChange={(e) =>
                                    setNewGenreName(e.target.value)
                                  }
                                  placeholder="ジャンル名を入力"
                                  className="genre-input"
                                />
                                <button
                                  onClick={handleAddGenre}
                                  className="add-genre-button"
                                  disabled={
                                    !newGenreName.trim() ||
                                    customGenres.includes(newGenreName.trim())
                                  }
                                >
                                  追加
                                </button>
                              </div>
                            </div>

                            <div className="custom-genres-section">
                              <h4>カスタムジャンル一覧</h4>
                              {customGenres.length === 0 ? (
                                <p className="no-genres">
                                  カスタムジャンルはありません
                                </p>
                              ) : (
                                <div className="genres-list">
                                  {customGenres.map((genre, index) => (
                                    <div key={index} className="genre-item">
                                      <span className="genre-name">
                                        {genre}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteGenre(genre)}
                                        className="delete-genre-button"
                                      >
                                        削除
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              } else if (feature.id === "public-memos") {
                return (
                  <PublicMemosComponent
                    key={feature.id}
                    publicMemos={publicMemos}
                    publicMemosLoading={publicMemosLoading}
                    showPublicMemos={showPublicMemos}
                    setShowPublicMemos={setShowPublicMemos}
                    publicMemoSelectedDate={publicMemoSelectedDate}
                    setPublicMemoSelectedDate={setPublicMemoSelectedDate}
                    publicMemoCurrentMonth={publicMemoCurrentMonth}
                    setPublicMemoCurrentMonth={setPublicMemoCurrentMonth}
                    selectedPublicMemoCategory={selectedPublicMemoCategory}
                    setSelectedPublicMemoCategory={setSelectedPublicMemoCategory}
                    publicMemoSearchTerm={publicMemoSearchTerm}
                    setPublicMemoSearchTerm={setPublicMemoSearchTerm}
                    replyingToMemo={replyingToMemo}
                    setReplyingToMemo={setReplyingToMemo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    editingReply={editingReply}
                    setEditingReply={setEditingReply}
                    editingReplyContent={editingReplyContent}
                    setEditingReplyContent={setEditingReplyContent}
                    user={user}
                    loadPublicMemos={loadPublicMemos}
                    handlePublicMemoSearch={handlePublicMemoSearch}
                    handlePublicMemoCategoryChange={handlePublicMemoCategoryChange}
                    navigatePublicMemoMonth={navigatePublicMemoMonth}
                    handlePublicMemoDateClick={handlePublicMemoDateClick}
                    handleReplySubmit={handleReplySubmit}
                    handleEditReply={handleEditReply}
                    handleCancelEditReply={handleCancelEditReply}
                    handleSaveEditReply={handleSaveEditReply}
                    handleDeleteReply={handleDeleteReply}
                    handleReplyCancel={handleReplyCancel}
                    closeOtherFeatures={closeOtherFeatures}
                  />
                );
                return (
                  <div key={feature.id} className="public-memos-section">
                    <div className="section-header">
                      <h2>
                        <span className="section-icon">
                          <HetamaIconComponent
                            featureId="public-memos"
                            size="large"
                          />
                        </span>
                        公開メモ
                      </h2>
                      <div className="section-controls">
                        {showPublicMemos ? (
                          <button
                            onClick={() => {
                              setShowPublicMemos(false);
                            }}
                            className="close-section-button"
                            title="セクションを閉じる"
                          >
                            ✕
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              closeOtherFeatures("public-memos");
                              setShowPublicMemos(true);
                              if (publicMemos.length === 0) {
                                loadPublicMemos();
                              }
                            }}
                            className="show-section-button"
                            title="セクションを表示"
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                    </div>

                    {showPublicMemos && (
                      <div className="public-memos-content">
                        {/* ジャンル管理ボタン */}
                        <div className="memos-controls">
                          <button
                            onClick={() =>
                              setShowGenreManagement(!showGenreManagement)
                            }
                            className="genre-management-button"
                          >
                            🏷️ ジャンル管理
                          </button>
                        </div>

                        {/* ジャンル管理セクション */}
                        {showGenreManagement && (
                          <div className="genre-management-section">
                            <h3>🏷️ ジャンル管理</h3>
                            <div className="genre-list">
                              {customGenres.map((genre, index) => (
                                <div key={index} className="genre-item">
                                  {editingGenre === genre ? (
                                    <div className="genre-edit-form">
                                      <input
                                        type="text"
                                        value={editingGenreName}
                                        onChange={(e) =>
                                          setEditingGenreName(e.target.value)
                                        }
                                        className="genre-edit-input"
                                        placeholder="ジャンル名を入力"
                                      />
                                      <button
                                        onClick={handleSaveGenreEdit}
                                        className="save-genre-button"
                                        disabled={
                                          !editingGenreName.trim() ||
                                          editingGenreName.trim() === genre
                                        }
                                      >
                                        保存
                                      </button>
                                      <button
                                        onClick={handleCancelGenreEdit}
                                        className="cancel-genre-button"
                                      >
                                        キャンセル
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="genre-display">
                                      <span className="genre-name">
                                        {genre}
                                      </span>
                                      <div className="genre-actions">
                                        <button
                                          onClick={() => handleEditGenre(genre)}
                                          className="edit-genre-button"
                                          title="編集"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteGenreFromManagement(
                                              genre
                                            )
                                          }
                                          className="delete-genre-button"
                                          title="削除"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {customGenres.length === 0 && (
                                <p className="no-genres">
                                  カスタムジャンルがありません
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="public-memos-stats">
                          <div className="stat-card">
                            <h3>公開メモ数</h3>
                            <p className="stat-value">{publicMemos.length}</p>
                          </div>
                          <div className="stat-card">
                            <h3>カテゴリ数</h3>
                            <p className="stat-value">
                              {getPublicMemoCategories().length}
                            </p>
                          </div>
                          <div className="stat-card">
                            <h3>最新更新</h3>
                            <p className="stat-value">
                              {publicMemos.length > 0
                                ? formatDateTime(
                                    new Date(
                                      Math.max(
                                        ...publicMemos.map((memo) =>
                                          new Date(memo.updatedAt).getTime()
                                        )
                                      )
                                    ).toISOString()
                                  )
                                : "-"}
                            </p>
                          </div>
                        </div>

                        <div className="public-memos-controls">
                          <div className="search-controls">
                            <input
                              type="text"
                              placeholder="公開メモを検索..."
                              value={publicMemoSearchTerm}
                              onChange={(e) =>
                                setPublicMemoSearchTerm(e.target.value)
                              }
                              className="search-input"
                            />
                            <button
                              onClick={handlePublicMemoSearch}
                              className="search-button"
                            >
                              検索
                            </button>
                            <button
                              onClick={loadPublicMemos}
                              className="refresh-button"
                              title="公開メモを更新"
                            >
                              🔄
                            </button>
                            {(selectedPublicMemoCategory !== "all" ||
                              publicMemoSearchTerm) && (
                              <button
                                onClick={() => {
                                  setSelectedPublicMemoCategory("all");
                                  setPublicMemoSearchTerm("");
                                  loadPublicMemos();
                                }}
                                className="reset-button"
                                title="フィルターをリセット"
                              >
                                🔄 リセット
                              </button>
                            )}
                          </div>
                          <div className="category-controls">
                            <select
                              value={selectedPublicMemoCategory}
                              aria-label="公開メモカテゴリ選択"
                              onChange={(e) =>
                                handlePublicMemoCategoryChange(e.target.value)
                              }
                              className="category-select"
                            >
                              <option value="all">すべてのカテゴリ</option>
                              {getPublicMemoCategories().map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="view-controls">
                            <button
                              onClick={() => setPublicMemoViewMode("list")}
                              className={`view-button ${
                                publicMemoViewMode === "list" ? "active" : ""
                              }`}
                            >
                              📋 リスト
                            </button>
                            <button
                              onClick={() => setPublicMemoViewMode("calendar")}
                              className={`view-button ${
                                publicMemoViewMode === "calendar"
                                  ? "active"
                                  : ""
                              }`}
                            >
                              📅 カレンダー
                            </button>
                          </div>
                        </div>

                        {publicMemoViewMode === "list" ? (
                          <div className="public-memos-list">
                            {publicMemosLoading ? (
                              <div className="data-loading">
                                <div className="spinner"></div>
                                <p>公開メモを読み込み中...</p>
                              </div>
                            ) : publicMemos.length === 0 ? (
                              <p className="no-public-memos">
                                公開メモがありません
                              </p>
                            ) : (
                              publicMemos.map((memo) => (
                                <div key={memo.id} className="public-memo-item">
                                  <div className="memo-header">
                                    <h3>{getMemoTitle(memo)}</h3>
                                    <div className="memo-meta">
                                      <span
                                        className="memo-category clickable"
                                        onClick={() =>
                                          handlePublicMemoCategoryChange(
                                            memo.category
                                          )
                                        }
                                        title={`${memo.category}でフィルター`}
                                      >
                                        {memo.category}
                                      </span>
                                      <span className="public-badge">公開</span>
                                      {memo.isFamilyOnly && (
                                        <span className="family-badge">
                                          家族のみ
                                        </span>
                                      )}
                                      {memo.isAdminOnly && (
                                        <span className="admin-badge">
                                          管理者専用
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="memo-content">
                                    <p>{memo.content}</p>
                                  </div>
                                  {memo.tags && memo.tags.length > 0 && (
                                    <div className="memo-tags">
                                      {memo.tags.map((tag, index) => (
                                        <span
                                          key={index}
                                          className="tag clickable"
                                          onClick={() => {
                                            setPublicMemoSearchTerm(tag);
                                            loadPublicMemos();
                                          }}
                                          title={`${tag}で検索`}
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="memo-footer">
                                    <span className="memo-date">
                                      {formatDateTime(memo.updatedAt)}
                                    </span>
                                  </div>

                                  {/* 返信表示 */}
                                  {memo.replies && memo.replies.length > 0 && (
                                    <div className="replies-section">
                                      <h5>💬 返信 ({memo.replies.length})</h5>
                                      {memo.replies.map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="reply-item"
                                        >
                                          {editingReply === reply.id ? (
                                            <div className="reply-edit-form">
                                              <textarea
                                                value={editReplyContent}
                                                onChange={(e) =>
                                                  setEditReplyContent(
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="返信を編集..."
                                                aria-label="返信を編集"
                                                className="reply-edit-textarea"
                                                rows={3}
                                              />
                                              <div className="reply-edit-actions">
                                                <button
                                                  onClick={() =>
                                                    handleSaveEditReply(
                                                      reply.id
                                                    )
                                                  }
                                                  className="save-reply-button"
                                                  disabled={
                                                    !editReplyContent.trim()
                                                  }
                                                >
                                                  💾 保存
                                                </button>
                                                <button
                                                  onClick={
                                                    handleCancelEditReply
                                                  }
                                                  className="cancel-reply-button"
                                                >
                                                  ❌ キャンセル
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="reply-content">
                                                {reply.content}
                                              </div>
                                              <div className="reply-meta">
                                                <span className="reply-author">
                                                  👤 {reply.authorName}
                                                </span>
                                                <span className="reply-date">
                                                  {formatDateTime(
                                                    reply.createdAt
                                                  )}
                                                </span>
                                                {user &&
                                                  (user.email ===
                                                    reply.authorEmail ||
                                                    user.id ===
                                                      reply.authorEmail) && (
                                                    <div className="reply-actions">
                                                      <button
                                                        onClick={() =>
                                                          handleEditReply(
                                                            reply.id,
                                                            reply.content
                                                          )
                                                        }
                                                        className="edit-reply-button"
                                                        title="編集"
                                                      >
                                                        ✏️
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handleDeleteReply(
                                                            reply.id
                                                          )
                                                        }
                                                        className="delete-reply-button"
                                                        title="削除"
                                                      >
                                                        🗑️
                                                      </button>
                                                    </div>
                                                  )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* 返信フォーム */}
                                  <div className="reply-form-section">
                                    <button
                                      onClick={() =>
                                        setReplyingToMemo(
                                          replyingToMemo === memo.id
                                            ? null
                                            : memo.id
                                        )
                                      }
                                      className="reply-button"
                                    >
                                      💬 返信する
                                    </button>

                                    {replyingToMemo === memo.id && (
                                      <div className="reply-form">
                                        <h5>💬 返信を投稿</h5>
                                        <div className="reply-author-info">
                                          <p>
                                            👤 投稿者:{" "}
                                            {user?.displayName || user?.email}
                                          </p>
                                        </div>
                                        <div className="form-group">
                                          <label htmlFor="replyContent">
                                            返信内容 *
                                          </label>
                                          <textarea
                                            id="replyContent"
                                            value={replyContent}
                                            onChange={(e) =>
                                              setReplyContent(e.target.value)
                                            }
                                            placeholder="返信内容を入力してください"
                                            rows={3}
                                            required
                                          />
                                        </div>
                                        <div className="reply-form-actions">
                                          <button
                                            onClick={() =>
                                              handleReplySubmit(memo.id)
                                            }
                                            className="submit-reply-button"
                                            disabled={!replyContent.trim()}
                                          >
                                            📤 返信を投稿
                                          </button>
                                          <button
                                            onClick={handleReplyCancel}
                                            className="cancel-reply-button"
                                          >
                                            ❌ キャンセル
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        ) : (
                          <div className="calendar-container">
                            <div className="calendar-header">
                              <button
                                onClick={() => navigatePublicMemoMonth("prev")}
                                className="calendar-nav-button"
                              >
                                ←
                              </button>
                              <h3>
                                {publicMemoCurrentDate.getFullYear()}年
                                {publicMemoCurrentDate.getMonth() + 1}月
                              </h3>
                              <button
                                onClick={() => navigatePublicMemoMonth("next")}
                                className="calendar-nav-button"
                              >
                                →
                              </button>
                            </div>

                            <div className="calendar-weekdays">
                              <div className="weekday">日</div>
                              <div className="weekday">月</div>
                              <div className="weekday">火</div>
                              <div className="weekday">水</div>
                              <div className="weekday">木</div>
                              <div className="weekday">金</div>
                              <div className="weekday">土</div>
                            </div>

                            <div className="calendar-days">
                              {getDaysInMonth(publicMemoCurrentDate).map(
                                (dayItem, index) => {
                                  const dayMemos = getPublicMemosForDate(
                                    dayItem.date
                                  );
                                  const isToday =
                                    dayItem.date.toDateString() ===
                                    new Date().toDateString();
                                  const isSelected =
                                    publicMemoSelectedDate &&
                                    dayItem.date.toDateString() ===
                                      publicMemoSelectedDate.toDateString();

                                  return (
                                    <div
                                      key={index}
                                      className={`calendar-day ${
                                        !dayItem.isCurrentMonth
                                          ? "other-month"
                                          : ""
                                      } ${isToday ? "today" : ""} ${
                                        isSelected ? "selected" : ""
                                      }`}
                                      onClick={() =>
                                        handlePublicMemoDateClick(dayItem.date)
                                      }
                                    >
                                      <div className="day-number">
                                        {dayItem.date.getDate()}
                                      </div>
                                      <div className="day-records">
                                        {dayMemos.map((memo, memoIndex) => (
                                          <div
                                            key={memoIndex}
                                            className="record-indicator clickable"
                                          >
                                            <div className="record-content">
                                              {getMemoTitle(memo)}
                                            </div>
                                            <div className="record-amount">
                                              {memo.category}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {publicMemoSelectedDate && (
                              <div className="selected-date-info">
                                <h4>
                                  📅 {publicMemoSelectedDate.getFullYear()}年
                                  {publicMemoSelectedDate.getMonth() + 1}月
                                  {publicMemoSelectedDate.getDate()}日の公開メモ
                                </h4>
                                <div className="date-records">
                                  {getPublicMemosForDate(publicMemoSelectedDate)
                                    .length === 0 ? (
                                    <p>この日の公開メモはありません</p>
                                  ) : (
                                    getPublicMemosForDate(
                                      publicMemoSelectedDate
                                    ).map((memo) => (
                                      <div
                                        key={memo.id}
                                        className="date-record-item"
                                      >
                                        <div className="record-icon">📝</div>
                                        <div className="record-content">
                                          <h5>{getMemoTitle(memo)}</h5>
                                          <p>{memo.content}</p>
                                          <div className="record-meta">
                                            <span className="memo-category">
                                              {memo.category}
                                            </span>
                                            {memo.tags &&
                                              memo.tags.length > 0 && (
                                                <div className="memo-tags">
                                                  {memo.tags.map(
                                                    (tag, index) => (
                                                      <span
                                                        key={index}
                                                        className="tag"
                                                      >
                                                        {tag}
                                                      </span>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              } else if (feature.id === "work-records") {
                return (
                  <div key={feature.id} className="work-records-section">
                    <div className="section-header">
                      <h2>
                        <span className="section-icon">
                          <div className="mini-character">
                            <div className="mini-character-halo"></div>
                            <div className="mini-character-wings">
                              <div className="mini-wing left-mini-wing"></div>
                              <div className="mini-wing right-mini-wing"></div>
                            </div>
                            <div className="mini-character-face">
                              <div className="mini-character-eyes">
                                <div className="mini-eye left-mini-eye"></div>
                                <div className="mini-eye right-mini-eye"></div>
                              </div>
                              <div className="mini-character-mouth"></div>
                            </div>
                            <div className="mini-character-body"></div>
                            <div className="mini-sparkles">
                              <div className="mini-sparkle mini-sparkle-1"></div>
                              <div className="mini-sparkle mini-sparkle-2"></div>
                            </div>
                          </div>
                        </span>
                        お仕事記録
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
                            }}
                            className="show-section-button"
                            title="セクションを表示"
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                    </div>

                    {showWorkRecords && (
                      <div className="work-records-content">
                        <div className="work-records-header">
                          <button
                            onClick={() => {
                              loadSalaryRecords();
                              loadWorkDiaries();
                            }}
                            className="refresh-button"
                            title="勤務記録を更新"
                          >
                            🔄
                          </button>
                        </div>
                        <div className="work-records-tabs">
                          <button
                            className={`tab-button ${
                              !showSalaryForm && !showDiaryForm && !showCalendar
                                ? "active"
                                : ""
                            }`}
                            onClick={() => {
                              setShowSalaryForm(false);
                              setShowDiaryForm(false);
                              setShowCalendar(false);
                            }}
                          >
                            📊 記録一覧
                          </button>
                          <button
                            className={`tab-button ${
                              showCalendar ? "active" : ""
                            }`}
                            onClick={() => {
                              setShowSalaryForm(false);
                              setShowDiaryForm(false);
                              setShowCalendar(true);
                            }}
                          >
                            📅 カレンダー
                          </button>
                          <button
                            className={`tab-button ${
                              showSalaryForm ? "active" : ""
                            }`}
                            onClick={() => {
                              setShowSalaryForm(true);
                              setShowDiaryForm(false);
                              setShowCalendar(false);
                            }}
                          >
                            💰 収入・支出
                          </button>
                          <button
                            className={`tab-button ${
                              showDiaryForm ? "active" : ""
                            }`}
                            onClick={() => {
                              setShowSalaryForm(false);
                              setShowDiaryForm(true);
                              setShowCalendar(false);
                            }}
                          >
                            📝 日記
                          </button>
                        </div>

                        {/* 給料記録フォーム */}
                        {showSalaryForm && (
                          <form
                            onSubmit={
                              editingSalaryRecord
                                ? handleUpdateSalaryRecord
                                : handleCreateSalaryRecord
                            }
                            className="salary-form"
                          >
                            <h3>
                              💰{" "}
                              {editingSalaryRecord
                                ? "収入・支出記録を編集"
                                : "収入・支出記録"}
                            </h3>
                            <div className="form-group">
                              <label htmlFor="salaryDate">日付</label>
                              <input
                                type="date"
                                id="salaryDate"
                                value={salaryDate}
                                onChange={(e) => setSalaryDate(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="recordType">記録タイプ</label>
                              <select
                                id="recordType"
                                value={recordType}
                                onChange={(e) => {
                                  setRecordType(
                                    e.target.value as "income" | "expense"
                                  );
                                  // タイプ変更時に金額をクリア
                                  setSalary("");
                                }}
                              >
                                <option value="income">収入</option>
                                <option value="expense">支出</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label htmlFor="salary">金額 (円)</label>
                              <input
                                type="number"
                                id="salary"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="例: 250000"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="transportation">
                                交通費 (円)
                              </label>
                              <input
                                type="number"
                                id="transportation"
                                value={transportation}
                                onChange={(e) =>
                                  setTransportation(e.target.value)
                                }
                                placeholder="例: 15000"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="miscellaneous">雑費 (円)</label>
                              <input
                                type="number"
                                id="miscellaneous"
                                value={miscellaneous}
                                onChange={(e) =>
                                  setMiscellaneous(e.target.value)
                                }
                                placeholder="例: 5000"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="other">その他 (円)</label>
                              <input
                                type="number"
                                id="other"
                                value={other}
                                onChange={(e) => setOther(e.target.value)}
                                placeholder="例: 10000"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="salaryMemo">メモ</label>
                              <textarea
                                id="salaryMemo"
                                value={salaryMemo}
                                onChange={(e) => setSalaryMemo(e.target.value)}
                                placeholder="給料についてのメモ"
                                rows={3}
                              />
                            </div>
                            <button type="submit" className="submit-button">
                              💰{" "}
                              {editingSalaryRecord
                                ? "収入・支出記録を更新"
                                : "収入・支出記録を保存"}
                            </button>
                          </form>
                        )}

                        {/* 日記フォーム */}
                        {showDiaryForm && (
                          <form
                            onSubmit={
                              editingDiary
                                ? handleUpdateDiary
                                : handleCreateDiary
                            }
                            className="diary-form"
                          >
                            <h3>
                              📝 {editingDiary ? "日記を編集" : "お仕事日記"}
                            </h3>
                            <div className="form-group">
                              <label htmlFor="diaryDate">日付</label>
                              <input
                                type="date"
                                id="diaryDate"
                                value={diaryDate}
                                onChange={(e) => setDiaryDate(e.target.value)}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="diaryTitle">タイトル</label>
                              <input
                                type="text"
                                id="diaryTitle"
                                value={diaryTitle}
                                onChange={(e) => setDiaryTitle(e.target.value)}
                                placeholder="例: 今日のプロジェクト会議"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="diaryMood">気分</label>
                              <select
                                id="diaryMood"
                                value={diaryMood}
                                onChange={(e) => setDiaryMood(e.target.value)}
                              >
                                <option value="😊">😊 楽しい</option>
                                <option value="😐">😐 普通</option>
                                <option value="😔">😔 疲れた</option>
                                <option value="😤">😤 イライラ</option>
                                <option value="😴">😴 眠い</option>
                                <option value="🤔">🤔 悩み中</option>
                                <option value="😍">😍 最高</option>
                                <option value="😢">😢 悲しい</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label htmlFor="diaryContent">内容</label>
                              <textarea
                                id="diaryContent"
                                value={diaryContent}
                                onChange={(e) =>
                                  setDiaryContent(e.target.value)
                                }
                                placeholder="今日の仕事の内容や感想を書いてください"
                                rows={5}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="diaryTags">
                                タグ (カンマ区切り)
                              </label>
                              <input
                                type="text"
                                id="diaryTags"
                                value={diaryTags}
                                onChange={(e) => setDiaryTags(e.target.value)}
                                placeholder="例: 会議, プロジェクト, 残業"
                              />
                            </div>
                            <div className="form-group">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={diaryIsPrivate}
                                  onChange={(e) =>
                                    setDiaryIsPrivate(e.target.checked)
                                  }
                                />
                                プライベートにする
                              </label>
                            </div>

                            {/* 新しい詳細項目 */}
                            <div className="diary-details-section">
                              <h4>📊 詳細記録</h4>

                              {/* 仕事の要約 */}
                              <div className="form-group">
                                <label htmlFor="diaryWorkSummary">
                                  仕事の要約
                                </label>
                                <textarea
                                  id="diaryWorkSummary"
                                  value={diaryWorkSummary}
                                  onChange={(e) =>
                                    setDiaryWorkSummary(e.target.value)
                                  }
                                  placeholder="今日の仕事を簡潔にまとめてください"
                                  rows={3}
                                />
                              </div>

                              {/* 数値項目 */}
                              <div className="form-row">
                                <div className="form-group">
                                  <label htmlFor="diaryWorkHours">
                                    作業時間 (時間)
                                  </label>
                                  <input
                                    type="number"
                                    id="diaryWorkHours"
                                    value={diaryWorkHours}
                                    onChange={(e) =>
                                      setDiaryWorkHours(Number(e.target.value))
                                    }
                                    min="0"
                                    max="24"
                                    step="0.5"
                                  />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="diaryBreakTime">
                                    休憩時間 (分)
                                  </label>
                                  <input
                                    type="number"
                                    id="diaryBreakTime"
                                    value={diaryBreakTime}
                                    onChange={(e) =>
                                      setDiaryBreakTime(Number(e.target.value))
                                    }
                                    min="0"
                                    max="480"
                                  />
                                </div>
                              </div>

                              <div className="form-row">
                                <div className="form-group">
                                  <label htmlFor="diaryEnergyLevel">
                                    エネルギーレベル (1-10)
                                  </label>
                                  <input
                                    type="range"
                                    id="diaryEnergyLevel"
                                    value={diaryEnergyLevel}
                                    onChange={(e) =>
                                      setDiaryEnergyLevel(
                                        Number(e.target.value)
                                      )
                                    }
                                    min="1"
                                    max="10"
                                  />
                                  <span className="range-value">
                                    {diaryEnergyLevel}
                                  </span>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="diaryStressLevel">
                                    ストレスレベル (1-10)
                                  </label>
                                  <input
                                    type="range"
                                    id="diaryStressLevel"
                                    value={diaryStressLevel}
                                    onChange={(e) =>
                                      setDiaryStressLevel(
                                        Number(e.target.value)
                                      )
                                    }
                                    min="1"
                                    max="10"
                                  />
                                  <span className="range-value">
                                    {diaryStressLevel}
                                  </span>
                                </div>
                              </div>

                              <div className="form-group">
                                <label htmlFor="diaryProductivity">
                                  生産性 (1-10)
                                </label>
                                <input
                                  type="range"
                                  id="diaryProductivity"
                                  value={diaryProductivity}
                                  onChange={(e) =>
                                    setDiaryProductivity(Number(e.target.value))
                                  }
                                  min="1"
                                  max="10"
                                />
                                <span className="range-value">
                                  {diaryProductivity}
                                </span>
                              </div>

                              {/* 配列項目 */}
                              <div className="form-group">
                                <label>今日の成果</label>
                                <div className="array-input">
                                  <input
                                    type="text"
                                    value={newAchievement}
                                    onChange={(e) =>
                                      setNewAchievement(e.target.value)
                                    }
                                    placeholder="成果を入力してEnterキーで追加"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addArrayItem(
                                          setDiaryAchievements,
                                          newAchievement,
                                          setNewAchievement
                                        );
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addArrayItem(
                                        setDiaryAchievements,
                                        newAchievement,
                                        setNewAchievement
                                      )
                                    }
                                    className="add-item-button"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="array-items">
                                  {diaryAchievements.map((item, index) => (
                                    <div key={index} className="array-item">
                                      <span>✅ {item}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeArrayItem(
                                            setDiaryAchievements,
                                            index
                                          )
                                        }
                                        className="remove-item-button"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="form-group">
                                <label>課題・困難</label>
                                <div className="array-input">
                                  <input
                                    type="text"
                                    value={newChallenge}
                                    onChange={(e) =>
                                      setNewChallenge(e.target.value)
                                    }
                                    placeholder="課題を入力してEnterキーで追加"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addArrayItem(
                                          setDiaryChallenges,
                                          newChallenge,
                                          setNewChallenge
                                        );
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addArrayItem(
                                        setDiaryChallenges,
                                        newChallenge,
                                        setNewChallenge
                                      )
                                    }
                                    className="add-item-button"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="array-items">
                                  {diaryChallenges.map((item, index) => (
                                    <div key={index} className="array-item">
                                      <span>⚠️ {item}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeArrayItem(
                                            setDiaryChallenges,
                                            index
                                          )
                                        }
                                        className="remove-item-button"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="form-group">
                                <label>学んだこと</label>
                                <div className="array-input">
                                  <input
                                    type="text"
                                    value={newLearning}
                                    onChange={(e) =>
                                      setNewLearning(e.target.value)
                                    }
                                    placeholder="学んだことを入力してEnterキーで追加"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addArrayItem(
                                          setDiaryLearnings,
                                          newLearning,
                                          setNewLearning
                                        );
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addArrayItem(
                                        setDiaryLearnings,
                                        newLearning,
                                        setNewLearning
                                      )
                                    }
                                    className="add-item-button"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="array-items">
                                  {diaryLearnings.map((item, index) => (
                                    <div key={index} className="array-item">
                                      <span>📚 {item}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeArrayItem(
                                            setDiaryLearnings,
                                            index
                                          )
                                        }
                                        className="remove-item-button"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="form-group">
                                <label>明日の目標</label>
                                <div className="array-input">
                                  <input
                                    type="text"
                                    value={newNextGoal}
                                    onChange={(e) =>
                                      setNewNextGoal(e.target.value)
                                    }
                                    placeholder="明日の目標を入力してEnterキーで追加"
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addArrayItem(
                                          setDiaryNextGoals,
                                          newNextGoal,
                                          setNewNextGoal
                                        );
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addArrayItem(
                                        setDiaryNextGoals,
                                        newNextGoal,
                                        setNewNextGoal
                                      )
                                    }
                                    className="add-item-button"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="array-items">
                                  {diaryNextGoals.map((item, index) => (
                                    <div key={index} className="array-item">
                                      <span>🎯 {item}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeArrayItem(
                                            setDiaryNextGoals,
                                            index
                                          )
                                        }
                                        className="remove-item-button"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="form-group">
                                <label htmlFor="diaryNotes">その他のメモ</label>
                                <textarea
                                  id="diaryNotes"
                                  value={diaryNotes}
                                  onChange={(e) =>
                                    setDiaryNotes(e.target.value)
                                  }
                                  placeholder="その他、気になることや記録したいことを自由に書いてください"
                                  rows={3}
                                />
                              </div>
                            </div>

                            <button type="submit" className="submit-button">
                              📝 {editingDiary ? "日記を更新" : "日記を保存"}
                            </button>
                          </form>
                        )}

                        {/* カレンダー */}
                        {showCalendar && (
                          <div className="calendar-container">
                            <div className="calendar-header">
                              <button
                                onClick={() => navigateMonth("prev")}
                                className="calendar-nav-button"
                              >
                                ←
                              </button>
                              <h3>
                                {currentDate.getFullYear()}年
                                {currentDate.getMonth() + 1}月
                              </h3>
                              <button
                                onClick={() => navigateMonth("next")}
                                className="calendar-nav-button"
                              >
                                →
                              </button>
                            </div>

                            {/* 月収支メモセクション */}
                            <div className="monthly-memo-section">
                              <div className="monthly-memo-header">
                                <h4>📝 月収支メモ</h4>
                                <div className="monthly-memo-actions">
                                  {editingMonthlyMemo ? (
                                    <>
                                      <button
                                        onClick={saveMonthlyMemo}
                                        className="save-memo-button"
                                        disabled={!monthlyMemo.trim()}
                                      >
                                        保存
                                      </button>
                                      <button
                                        onClick={cancelEditingMonthlyMemo}
                                        className="cancel-memo-button"
                                      >
                                        キャンセル
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={startEditingMonthlyMemo}
                                      className="edit-memo-button"
                                    >
                                      編集
                                    </button>
                                  )}
                                </div>
                              </div>

                              {editingMonthlyMemo ? (
                                <textarea
                                  value={monthlyMemo}
                                  onChange={(e) =>
                                    setMonthlyMemo(e.target.value)
                                  }
                                  placeholder="今月の収支についてメモを書いてください..."
                                  className="monthly-memo-textarea"
                                  rows={4}
                                />
                              ) : (
                                <div className="monthly-memo-display">
                                  {monthlyMemo ? (
                                    <p>{monthlyMemo}</p>
                                  ) : (
                                    <p className="no-memo">
                                      メモがありません。編集ボタンから追加してください。
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="calendar-weekdays">
                              <div className="weekday">日</div>
                              <div className="weekday">月</div>
                              <div className="weekday">火</div>
                              <div className="weekday">水</div>
                              <div className="weekday">木</div>
                              <div className="weekday">金</div>
                              <div className="weekday">土</div>
                            </div>

                            <div className="calendar-days">
                              {getDaysInMonth(currentDate).map(
                                (dayItem, index) => {
                                  const dayRecords = getRecordsForDate(
                                    dayItem.date
                                  );
                                  const isToday =
                                    dayItem.date.toDateString() ===
                                    new Date().toDateString();
                                  const isSelected =
                                    selectedDate &&
                                    dayItem.date.toDateString() ===
                                      selectedDate.toDateString();

                                  // デバッグ用ログ
                                  if (
                                    dayRecords.salaryRecords.length > 0 ||
                                    dayRecords.diaries.length > 0
                                  ) {
                                    console.log(
                                      `Date: ${
                                        dayItem.date.toISOString().split("T")[0]
                                      }, Salary: ${
                                        dayRecords.salaryRecords.length
                                      }, Diaries: ${dayRecords.diaries.length}`
                                    );
                                  }

                                  return (
                                    <div
                                      key={index}
                                      className={`calendar-day ${
                                        !dayItem.isCurrentMonth
                                          ? "other-month"
                                          : ""
                                      } ${isToday ? "today" : ""} ${
                                        isSelected ? "selected" : ""
                                      }`}
                                      onClick={() =>
                                        handleDateClick(dayItem.date)
                                      }
                                    >
                                      <div className="day-number">
                                        {dayItem.date.getDate()}
                                      </div>
                                      <div className="day-records">
                                        {dayRecords.salaryRecords.length > 0 &&
                                        dayRecords.diaries.length > 0 ? (
                                          // 両方の記録がある場合は、それぞれを表示
                                          <>
                                            <div
                                              className="record-indicator salary-indicator clickable"
                                              title="収入・支出記録を表示"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRecordClick(
                                                  "salary",
                                                  dayItem.date
                                                );
                                              }}
                                            >
                                              <div className="record-icon">
                                                💰
                                              </div>
                                              <div className="record-amount">
                                                {dayRecords.salaryRecords
                                                  .length === 1
                                                  ? `${
                                                      dayRecords
                                                        .salaryRecords[0]
                                                        .salary >= 0
                                                        ? "収入"
                                                        : "支出"
                                                    }: ¥${Math.abs(
                                                      dayRecords
                                                        .salaryRecords[0].salary
                                                    ).toLocaleString()}`
                                                  : `${dayRecords.salaryRecords.length}件`}
                                              </div>
                                            </div>
                                            <div
                                              className="record-indicator diary-indicator clickable"
                                              title="日記を表示"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRecordClick(
                                                  "diary",
                                                  dayItem.date
                                                );
                                              }}
                                            >
                                              <div className="record-icon">
                                                📝
                                              </div>
                                              <div className="record-content">
                                                {dayRecords.diaries.length === 1
                                                  ? dayRecords.diaries[0].title
                                                      .length > 6
                                                    ? dayRecords.diaries[0].title.substring(
                                                        0,
                                                        6
                                                      ) + "..."
                                                    : dayRecords.diaries[0]
                                                        .title
                                                  : `${dayRecords.diaries.length}件`}
                                              </div>
                                            </div>
                                          </>
                                        ) : (
                                          // 片方の記録のみの場合
                                          <>
                                            {dayRecords.salaryRecords.length >
                                              0 && (
                                              <div
                                                className="record-indicator salary-indicator clickable"
                                                title="収入・支出記録を表示"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRecordClick(
                                                    "salary",
                                                    dayItem.date
                                                  );
                                                }}
                                              >
                                                <div className="record-icon">
                                                  💰
                                                </div>
                                                <div className="record-amount">
                                                  {dayRecords.salaryRecords
                                                    .length === 1
                                                    ? `${
                                                        dayRecords
                                                          .salaryRecords[0]
                                                          .salary >= 0
                                                          ? "収入"
                                                          : "支出"
                                                      }: ¥${Math.abs(
                                                        dayRecords
                                                          .salaryRecords[0]
                                                          .salary
                                                      ).toLocaleString()}`
                                                    : `${dayRecords.salaryRecords.length}件の記録`}
                                                </div>
                                              </div>
                                            )}
                                            {dayRecords.diaries.length > 0 && (
                                              <div
                                                className="record-indicator diary-indicator clickable"
                                                title="日記を表示"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRecordClick(
                                                    "diary",
                                                    dayItem.date
                                                  );
                                                }}
                                              >
                                                <div className="record-icon">
                                                  📝
                                                </div>
                                                <div className="record-content">
                                                  {dayRecords.diaries.length ===
                                                  1
                                                    ? dayRecords.diaries[0]
                                                        .title.length > 8
                                                      ? dayRecords.diaries[0].title.substring(
                                                          0,
                                                          8
                                                        ) + "..."
                                                      : dayRecords.diaries[0]
                                                          .title
                                                    : `${dayRecords.diaries.length}件の日記`}
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>

                            {selectedDate &&
                              (() => {
                                const selectedDateRecords =
                                  getRecordsForDate(selectedDate);
                                return (
                                  <div className="selected-date-info">
                                    <h4>
                                      {selectedDate.getFullYear()}年
                                      {selectedDate.getMonth() + 1}月
                                      {selectedDate.getDate()}日
                                    </h4>
                                    <div className="date-records">
                                      {selectedDateRecords.salaryRecords.map(
                                        (record) => (
                                          <div
                                            key={record._id}
                                            className="date-record-item salary-record clickable"
                                            onClick={() =>
                                              handleSpecificRecordClick(
                                                record,
                                                "salary"
                                              )
                                            }
                                            title="収入・支出記録を表示"
                                          >
                                            <span className="record-icon">
                                              💰
                                            </span>
                                            <span className="record-content">
                                              {record.salary >= 0
                                                ? "収入"
                                                : "支出"}
                                              : ¥
                                              {Math.abs(
                                                record.salary
                                              ).toLocaleString()}
                                              {record.transportation > 0 &&
                                                ` + 交通費: ¥${record.transportation.toLocaleString()}`}
                                            </span>
                                          </div>
                                        )
                                      )}
                                      {selectedDateRecords.diaries.map(
                                        (diary) => (
                                          <div
                                            key={diary._id}
                                            className="date-record-item diary-record clickable"
                                            onClick={() =>
                                              handleSpecificRecordClick(
                                                diary,
                                                "diary"
                                              )
                                            }
                                            title="日記を表示"
                                          >
                                            <span className="record-icon">
                                              📝
                                            </span>
                                            <span className="record-content">
                                              {diary.mood} {diary.title}
                                            </span>
                                          </div>
                                        )
                                      )}
                                      {selectedDateRecords.salaryRecords
                                        .length === 0 &&
                                        selectedDateRecords.diaries.length ===
                                          0 && (
                                          <p className="no-records">
                                            この日は記録がありません
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                );
                              })()}

                            {/* 月間収支サマリー */}
                            <div className="monthly-summary">
                              <h3>
                                📊 {currentDate.getFullYear()}年
                                {currentDate.getMonth() + 1}月の収支
                              </h3>
                              {(() => {
                                const summary = getMonthlySummary(
                                  currentDate.getFullYear(),
                                  currentDate.getMonth()
                                );
                                return (
                                  <div className="summary-cards">
                                    <div className="summary-card income">
                                      <div className="summary-icon">💰</div>
                                      <div className="summary-content">
                                        <div className="summary-label">
                                          収入
                                        </div>
                                        <div className="summary-amount">
                                          ¥
                                          {summary.totalIncome.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="summary-card expense">
                                      <div className="summary-icon">💸</div>
                                      <div className="summary-content">
                                        <div className="summary-label">
                                          支出
                                        </div>
                                        <div className="summary-amount">
                                          ¥
                                          {summary.totalExpense.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={`summary-card net ${
                                        summary.netIncome >= 0
                                          ? "positive"
                                          : "negative"
                                      }`}
                                    >
                                      <div className="summary-icon">
                                        {summary.netIncome >= 0 ? "📈" : "📉"}
                                      </div>
                                      <div className="summary-content">
                                        <div className="summary-label">
                                          差額
                                        </div>
                                        <div className="summary-amount">
                                          ¥{summary.netIncome.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="summary-card count">
                                      <div className="summary-icon">📝</div>
                                      <div className="summary-content">
                                        <div className="summary-label">
                                          記録数
                                        </div>
                                        <div className="summary-amount">
                                          {summary.recordCount}件
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* 記録一覧 */}
                        {!showSalaryForm &&
                          !showDiaryForm &&
                          !showCalendar &&
                          !showRecordDetail && (
                            <div className="records-list">
                              <div className="salary-records">
                                <h3>
                                  💰 収入・支出記録 ({salaryRecords.length}件)
                                </h3>
                                {salaryLoading ? (
                                  <div className="section-loading">
                                    <div className="spinner"></div>
                                    <p>収入・支出記録を読み込み中...</p>
                                  </div>
                                ) : salaryRecords.length > 0 ? (
                                  <div className="records-grid">
                                    {salaryRecords.map((record) => (
                                      <div
                                        key={record._id}
                                        className="salary-record-item"
                                      >
                                        <div className="record-header">
                                          <h4>
                                            {new Date(
                                              record.date
                                            ).toLocaleDateString("ja-JP")}
                                          </h4>
                                          <div className="record-actions">
                                            <button
                                              onClick={() =>
                                                viewSalaryRecord(record)
                                              }
                                              className="view-button"
                                            >
                                              👁️
                                            </button>
                                            <button
                                              onClick={() =>
                                                editSalaryRecord(record)
                                              }
                                              className="edit-button"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteSalaryRecord(
                                                  record._id
                                                )
                                              }
                                              className="delete-button"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </div>
                                        <div className="record-details">
                                          <p>
                                            <strong>
                                              {record.salary >= 0
                                                ? "収入:"
                                                : "支出:"}
                                            </strong>{" "}
                                            ¥
                                            {Math.abs(
                                              record.salary
                                            ).toLocaleString()}
                                          </p>
                                          {record.transportation > 0 && (
                                            <p>
                                              <strong>交通費:</strong> ¥
                                              {record.transportation.toLocaleString()}
                                            </p>
                                          )}
                                          {record.miscellaneous > 0 && (
                                            <p>
                                              <strong>雑費:</strong> ¥
                                              {record.miscellaneous.toLocaleString()}
                                            </p>
                                          )}
                                          {record.other > 0 && (
                                            <p>
                                              <strong>その他:</strong> ¥
                                              {record.other.toLocaleString()}
                                            </p>
                                          )}
                                          {record.memo && (
                                            <p>
                                              <strong>メモ:</strong>{" "}
                                              {record.memo}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="no-records-card">
                                    <p>収入・支出記録がありません</p>
                                    <button
                                      onClick={() => setShowSalaryForm(true)}
                                      className="add-record-btn"
                                    >
                                      収入・支出記録を追加
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="work-diaries">
                                <h3>📝 日記 ({workDiaries.length}件)</h3>
                                {diaryLoading ? (
                                  <div className="section-loading">
                                    <div className="spinner"></div>
                                    <p>日記を読み込み中...</p>
                                  </div>
                                ) : workDiaries.length > 0 ? (
                                  <div className="diaries-list">
                                    {workDiaries.map((diary) => (
                                      <div
                                        key={diary._id}
                                        className="diary-item"
                                      >
                                        <div className="diary-header">
                                          <h4>{diary.title}</h4>
                                          <div className="diary-meta">
                                            <span className="diary-mood">
                                              {diary.mood}
                                            </span>
                                            <span className="diary-date">
                                              {new Date(
                                                diary.date
                                              ).toLocaleDateString("ja-JP")}
                                            </span>
                                            <div className="diary-actions">
                                              <button
                                                onClick={() => viewDiary(diary)}
                                                className="view-button"
                                              >
                                                👁️
                                              </button>
                                              <button
                                                onClick={() => editDiary(diary)}
                                                className="edit-button"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteDiary(diary._id)
                                                }
                                                className="delete-button"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="diary-content">
                                          <p>{diary.content}</p>

                                          {/* 新しい詳細項目の表示 */}
                                          {diary.workSummary && (
                                            <div className="diary-detail-section">
                                              <h5>📋 仕事の要約</h5>
                                              <p>{diary.workSummary}</p>
                                            </div>
                                          )}

                                          {diary.achievements &&
                                            diary.achievements.length > 0 && (
                                              <div className="diary-detail-section">
                                                <h5>✅ 今日の成果</h5>
                                                <ul>
                                                  {diary.achievements.map(
                                                    (achievement, index) => (
                                                      <li key={index}>
                                                        {achievement}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}

                                          {diary.challenges &&
                                            diary.challenges.length > 0 && (
                                              <div className="diary-detail-section">
                                                <h5>⚠️ 課題・困難</h5>
                                                <ul>
                                                  {diary.challenges.map(
                                                    (challenge, index) => (
                                                      <li key={index}>
                                                        {challenge}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}

                                          {diary.learnings &&
                                            diary.learnings.length > 0 && (
                                              <div className="diary-detail-section">
                                                <h5>📚 学んだこと</h5>
                                                <ul>
                                                  {diary.learnings.map(
                                                    (learning, index) => (
                                                      <li key={index}>
                                                        {learning}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}

                                          {diary.nextGoals &&
                                            diary.nextGoals.length > 0 && (
                                              <div className="diary-detail-section">
                                                <h5>🎯 明日の目標</h5>
                                                <ul>
                                                  {diary.nextGoals.map(
                                                    (goal, index) => (
                                                      <li key={index}>
                                                        {goal}
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              </div>
                                            )}

                                          {/* 数値項目の表示 */}
                                          <div className="diary-metrics">
                                            {diary.workHours > 0 && (
                                              <span className="metric">
                                                ⏰ 作業時間: {diary.workHours}
                                                時間
                                              </span>
                                            )}
                                            {diary.breakTime > 0 && (
                                              <span className="metric">
                                                ☕ 休憩時間: {diary.breakTime}分
                                              </span>
                                            )}
                                            <span className="metric">
                                              ⚡ エネルギー:{" "}
                                              {diary.energyLevel || 5}/10
                                            </span>
                                            <span className="metric">
                                              😰 ストレス:{" "}
                                              {diary.stressLevel || 5}/10
                                            </span>
                                            <span className="metric">
                                              📈 生産性:{" "}
                                              {diary.productivity || 5}/10
                                            </span>
                                          </div>

                                          {diary.notes && (
                                            <div className="diary-detail-section">
                                              <h5>📝 その他のメモ</h5>
                                              <p>{diary.notes}</p>
                                            </div>
                                          )}

                                          {diary.tags &&
                                            diary.tags.length > 0 && (
                                              <div className="diary-tags">
                                                {diary.tags.map(
                                                  (tag, index) => (
                                                    <span
                                                      key={index}
                                                      className="tag"
                                                    >
                                                      #{tag}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="no-records-card">
                                    <p>日記がありません</p>
                                    <button
                                      onClick={() => setShowDiaryForm(true)}
                                      className="add-record-btn"
                                    >
                                      日記を追加
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* 記録詳細表示 */}
                        {showRecordDetail && selectedRecord && (
                          <div className="record-detail-view">
                            <div className="detail-header">
                              <button
                                onClick={() => setShowRecordDetail(false)}
                                className="back-button"
                              >
                                ← 戻る
                              </button>
                              <h3>
                                {selectedRecordType === "salary"
                                  ? "💰 収入・支出記録詳細"
                                  : "📝 日記詳細"}
                              </h3>
                            </div>

                            <div className="detail-content">
                              {selectedRecordType === "salary" ? (
                                <div className="salary-detail">
                                  <div className="detail-section">
                                    <h4>📅 日付</h4>
                                    <p>
                                      {new Date(
                                        selectedRecord.date
                                      ).toLocaleDateString("ja-JP")}
                                    </p>
                                  </div>

                                  <div className="detail-section">
                                    <h4>
                                      💰{" "}
                                      {selectedRecord.salary >= 0
                                        ? "収入"
                                        : "支出"}
                                    </h4>
                                    <p className="amount">
                                      ¥
                                      {Math.abs(
                                        selectedRecord.salary
                                      ).toLocaleString()}
                                    </p>
                                  </div>

                                  {selectedRecord.transportation > 0 && (
                                    <div className="detail-section">
                                      <h4>🚌 交通費</h4>
                                      <p className="amount">
                                        ¥
                                        {selectedRecord.transportation.toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {selectedRecord.miscellaneous > 0 && (
                                    <div className="detail-section">
                                      <h4>💰 雑費</h4>
                                      <p className="amount">
                                        ¥
                                        {selectedRecord.miscellaneous.toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {selectedRecord.other > 0 && (
                                    <div className="detail-section">
                                      <h4>📋 その他</h4>
                                      <p className="amount">
                                        ¥{selectedRecord.other.toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {selectedRecord.memo && (
                                    <div className="detail-section">
                                      <h4>📝 メモ</h4>
                                      <p>{selectedRecord.memo}</p>
                                    </div>
                                  )}

                                  <div className="detail-actions">
                                    <button
                                      onClick={() => {
                                        editSalaryRecord(selectedRecord);
                                        setShowRecordDetail(false);
                                      }}
                                      className="edit-btn"
                                    >
                                      ✏️ 編集
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteSalaryRecord(
                                          selectedRecord._id
                                        );
                                        setShowRecordDetail(false);
                                      }}
                                      className="delete-btn"
                                    >
                                      🗑️ 削除
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="diary-detail">
                                  <div className="detail-section">
                                    <h4>📅 日付</h4>
                                    <p>
                                      {new Date(
                                        selectedRecord.date
                                      ).toLocaleDateString("ja-JP")}
                                    </p>
                                  </div>

                                  <div className="detail-section">
                                    <h4>😊 気分</h4>
                                    <p className="mood">
                                      {selectedRecord.mood}
                                    </p>
                                  </div>

                                  <div className="detail-section">
                                    <h4>📝 タイトル</h4>
                                    <p className="title">
                                      {selectedRecord.title}
                                    </p>
                                  </div>

                                  <div className="detail-section">
                                    <h4>📄 内容</h4>
                                    <div className="content">
                                      {selectedRecord.content
                                        .split("\n")
                                        .map((line: string, index: number) => (
                                          <p key={index}>{line}</p>
                                        ))}
                                    </div>
                                  </div>

                                  {selectedRecord.tags &&
                                    selectedRecord.tags.length > 0 && (
                                      <div className="detail-section">
                                        <h4>🏷️ タグ</h4>
                                        <div className="tags">
                                          {selectedRecord.tags.map(
                                            (tag: string, index: number) => (
                                              <span key={index} className="tag">
                                                #{tag}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {selectedRecord.isPrivate && (
                                    <div className="detail-section">
                                      <h4>🔒 プライバシー</h4>
                                      <p>非公開</p>
                                    </div>
                                  )}

                                  <div className="detail-actions">
                                    <button
                                      onClick={() => {
                                        editDiary(selectedRecord);
                                        setShowRecordDetail(false);
                                      }}
                                      className="edit-btn"
                                    >
                                      ✏️ 編集
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteDiary(selectedRecord._id);
                                        setShowRecordDetail(false);
                                      }}
                                      className="delete-btn"
                                    >
                                      🗑️ 削除
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              } else if (feature.id === "timers") {
                return (
                  <TimersComponent
                    key={feature.id}
                    showTimers={showTimers}
                    setShowTimers={setShowTimers}
                    customTimerTime={customTimerTime}
                    setCustomTimerTime={setCustomTimerTime}
                            customTimerActive={customTimerActive}
                    setCustomTimerActive={setCustomTimerActive}
                    customTimerPaused={customTimerPaused}
                    setCustomTimerPaused={setCustomTimerPaused}
                    customTimerTimeLeft={customTimerTimeLeft}
                    setCustomTimerTimeLeft={setCustomTimerTimeLeft}
                    customTimerInterval={customTimerInterval}
                    setCustomTimerInterval={setCustomTimerInterval}
                    customTimerSound={customTimerSound}
                    setCustomTimerSound={setCustomTimerSound}
                    timerHistory={timerHistory}
                    timerSettings={timerSettings}
                    startCustomTimer={startCustomTimer}
                    pauseCustomTimer={pauseCustomTimer}
                    stopCustomTimer={stopCustomTimer}
                    resetCustomTimer={resetCustomTimer}
                    playCustomTimerSound={playCustomTimerSound}
                    addToTimerHistory={addToTimerHistory}
                            closeOtherFeatures={closeOtherFeatures}
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
                    habits={habits}
                    habitHistory={habitHistory}
                    moodLogs={moodLogs}
                    goals={goals}
                    learningRecords={learningRecords}
                    timeEntries={timeEntries}
                    calculateTimeBreakdown={calculateTimeBreakdown}
                    calculateProductivityTrend={calculateProductivityTrend}
                    calculateProductivityStats={calculateProductivityStats}
                    loadTimeEntries={loadTimeEntries}
                    editingProfile={editingProfile}
                    setEditingProfile={setEditingProfile}
                    newValue={newValue}
                    setNewValue={setNewValue}
                    newGoal={newGoal}
                    setNewGoal={setNewGoal}
                    newSkill={newSkill}
                    setNewSkill={setNewSkill}
                    newInterest={newInterest}
                    setNewInterest={setNewInterest}
                    newStrength={newStrength}
                    setNewStrength={setNewStrength}
                    newWeakness={newWeakness}
                    setNewWeakness={setNewWeakness}
                    newPersonality={newPersonality}
                    setNewPersonality={setNewPersonality}
                    addToProfile={addToProfile}
                    removeFromProfile={removeFromProfile}
                    addHabit={addHabit}
                    toggleHabitCompletion={toggleHabitCompletion}
                    deleteHabit={deleteHabit}
                    addGoal={addGoal}
                    updateGoal={updateGoal}
                    deleteGoal={deleteGoal}
                    addLearningRecord={addLearningRecord}
                    updateLearningRecord={updateLearningRecord}
                    deleteLearningRecord={deleteLearningRecord}
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
                <h2>🏠 キャラクター達のお家</h2>
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
                <h3>🎨 テーマ設定</h3>
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
                    ⏰ Work Time Tracker 📚
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
                    🎨 テーマ 🔤 フォント ⚙️ 機能設定 🚪 ログアウト
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
                    作業内容を入力してください | ▶️ 記録開始
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
                <h3>⚙️ 機能設定</h3>
                <button
                  onClick={() => setShowFeatureSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="feature-settings-body">
                <div className="feature-settings-section">
                  <h4>📝 日記リマインダー設定</h4>
                  <button
                    onClick={() => setShowDiaryReminderSettings(true)}
                    className="reminder-settings-btn"
                  >
                    📝 リマインダー設定を開く
                  </button>
                </div>

                <div className="feature-settings-section">
                  <h4>📋 機能の並び順</h4>
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
      </div>
    );
  }

  return (
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
  );
}

export default App;
