import React from "react";
import HeaderComponent from "./HeaderComponent";
import CharacterHome from "./CharacterHome";
import ProjectsSection from "./ProjectsSection";
import CookingTimerSection from "./CookingTimerSection";
import SelfAnalysisComponent from "./SelfAnalysisComponent";
import BookshelfComponent from "./BookshelfComponent";
import MemosComponent from "./MemosComponent";
import ReportsComponent from "./ReportsComponent";
import AdminPanelComponent from "./AdminPanelComponent";
import { PersonalProfile } from "./SelfAnalysisComponent";
import { Habit, Goal, LearningRecord } from "../types";
import TimeTrackingComponent from "./TimeTrackingComponent";
import TimersComponent from "./TimersComponent";
import PublicMemosComponent from "./PublicMemosComponent";
import WorkRecordsComponent from "./WorkRecordsComponent";
import SoundAppComponent from "./SoundAppComponent";
import NotificationComponent from "./NotificationComponent";
import VersionInfo from "./VersionInfo";
import UpdateRequestModal from "./UpdateRequestModal";
import BugReportModal from "./BugReportModal";
import EggTimerComponent from "./EggTimerComponent";
import HetamaIconComponent from "./HetamaIconComponent";
import LanguageFontSettings from "./LanguageFontSettings";
import DiaryReminderIntegration from "./DiaryReminderIntegration";
import SimpleErrorReportingModal from "./SimpleErrorReportingModal";
import { User } from "../types";

// App_backup.tsxから復元するための追加インポート
import { useState, useEffect } from "react";

interface MainLayoutProps {
  user: User | null;
  isLoggedIn: boolean;
  // UI状態
  showCharacterHome: boolean;
  showProjects: boolean;
  showCookingTimer: boolean;
  showSelfAnalysis: boolean;
  showReports: boolean;
  showAdminPanel: boolean;
  showTimeTracking: boolean;
  showWorkRecords: boolean;
  showSoundApp: boolean;
  showNotifications: boolean;
  showVersionInfo: boolean;
  showThemeSettings: boolean;
  showFontSettings: boolean;
  showFeatureSettings: boolean;
  showBugReportModal: boolean;
  showUpdateRequestModal: boolean;
  // 追加のUI状態（App_backup.tsxから復元）
  showDiaryReminderSettings: boolean;
  setShowDiaryReminderSettings: (show: boolean) => void;
  showMoodForm: boolean;
  setShowMoodForm: (show: boolean) => void;
  showGoalForm: boolean;
  setShowGoalForm: (show: boolean) => void;
  // 日記リマインダー関連
  diaryReminderSnoozeUntil: number | null;
  setDiaryReminderSnoozeUntil: (time: number | null) => void;
  // UI設定関連
  selectedTheme: string;
  selectedFont: string;
  fontSettings: any;
  showLanguageFontSettings: boolean;
  setShowLanguageFontSettings: (show: boolean) => void;
  handleThemeChange: (theme: string) => void;
  handleFontChange: (font: string) => void;
  handleLanguageFontSave: (settings: any) => void;
  availableThemes: Array<{
    value: string;
    label: string;
    preview: string;
  }>;
  availableFonts: Array<{
    value: string;
    label: string;
  }>;
  // お仕事記録関連の状態
  showIncomeExpenseForm: boolean;
  setShowIncomeExpenseForm: (show: boolean) => void;
  showDiaryForm: boolean;
  setShowDiaryForm: (show: boolean) => void;
  editingIncomeExpenseRecord: any;
  setEditingIncomeExpenseRecord: (record: any) => void;
  editingDiary: any;
  setEditingDiary: (diary: any) => void;
  // 収入・支出記録フォームの状態
  incomeExpenseDate: string;
  setIncomeExpenseDate: (date: string) => void;
  incomeExpenseAmount: string;
  setIncomeExpenseAmount: (amount: string) => void;
  incomeExpenseType: "income" | "expense";
  setIncomeExpenseType: (type: "income" | "expense") => void;
  incomeExpenseNotes: string;
  setIncomeExpenseNotes: (notes: string) => void;
  // 日記フォームの状態
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
  diaryTags: string;
  setDiaryTags: (tags: string) => void;
  diaryIsPrivate: boolean;
  setDiaryIsPrivate: (isPrivate: boolean) => void;
  // 新しい日記項目の状態
  diaryWorkSummary: string;
  setDiaryWorkSummary: (summary: string) => void;
  diaryAchievements: string[];
  setDiaryAchievements: React.Dispatch<React.SetStateAction<string[]>>;
  diaryChallenges: string[];
  setDiaryChallenges: React.Dispatch<React.SetStateAction<string[]>>;
  diaryLearnings: string[];
  setDiaryLearnings: (learnings: string[]) => void;
  diaryNextGoals: string[];
  setDiaryNextGoals: React.Dispatch<React.SetStateAction<string[]>>;
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
  diaryNotes: string;
  setDiaryNotes: (notes: string) => void;
  diaryGratitude: string;
  setDiaryGratitude: (gratitude: string) => void;
  diaryReflection: string;
  setDiaryReflection: (reflection: string) => void;
  // 配列項目の一時入力状態
  newAchievement: string;
  setNewAchievement: (achievement: string) => void;
  newChallenge: string;
  setNewChallenge: (challenge: string) => void;
  newLearning: string;
  setNewLearning: (learning: string) => void;
  newNextGoal: string;
  setNewNextGoal: (goal: string) => void;
  // メモ関連の状態
  showMemos: boolean;
  showMemoForm: boolean;
  setShowMemoForm: (show: boolean) => void;
  editingMemo: any;
  setEditingMemo: (memo: any) => void;
  memoTitle: string;
  setMemoTitle: (title: string) => void;
  memoContent: string;
  setMemoContent: (content: string) => void;
  memoCategory: string;
  setMemoCategory: (category: string) => void;
  memoTags: string;
  setMemoTags: (tags: string) => void;
  memoIsPublic: boolean;
  setMemoIsPublic: (isPublic: boolean) => void;
  memoIsFamilyOnly: boolean;
  setMemoIsFamilyOnly: (isFamilyOnly: boolean) => void;
  memoIsAdminOnly: boolean;
  setMemoIsAdminOnly: (isAdminOnly: boolean) => void;
  memoSearchTerm: string;
  setMemoSearchTerm: (term: string) => void;
  selectedMemoCategory: string;
  setSelectedMemoCategory: (category: string) => void;
  // 公開メモ関連の状態
  showPublicMemos: boolean;
  publicMemoSearchTerm: string;
  setPublicMemoSearchTerm: (term: string) => void;
  selectedPublicMemoCategory: string;
  setSelectedPublicMemoCategory: (category: string) => void;
  publicMemoCurrentDate: Date;
  setPublicMemoCurrentDate: (date: Date) => void;
  publicMemoSelectedDate: Date | null;
  setPublicMemoSelectedDate: (date: Date | null) => void;
  // 返信機能の状態
  replyingToMemo: string | null;
  setReplyingToMemo: (memoId: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  editingReply: string | null;
  setEditingReply: (replyId: string | null) => void;
  editReplyContent: string;
  setEditReplyContent: (content: string) => void;
  // 本棚関連の状態
  showBookshelf: boolean;
  showBookForm: boolean;
  setShowBookForm: (show: boolean) => void;
  editingBook: any;
  setEditingBook: (book: any) => void;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  bookAuthor: string;
  setBookAuthor: (author: string) => void;
  bookIsbn: string;
  setBookIsbn: (isbn: string) => void;
  bookPublishedYear: number;
  setBookPublishedYear: (year: number) => void;
  bookTotalPages: number;
  setBookTotalPages: (pages: number) => void;
  bookCategory: string;
  setBookCategory: (category: string) => void;
  bookNotes: string;
  setBookNotes: (notes: string) => void;
  selectedBookCategory: string;
  setSelectedBookCategory: (category: string) => void;
  // 料理タイマー関連の状態
  selectedRecipe: string;
  // 音響関連のハンドラー関数
  playBellSound: (audioContext: AudioContext) => void;
  playChimeSound: (audioContext: AudioContext) => void;
  playBeepSound: (audioContext: AudioContext) => void;
  playAlarmSound: (audioContext: AudioContext) => void;
  // セッター関数
  setShowCharacterHome: (show: boolean) => void;
  setShowProjects: (show: boolean) => void;
  setShowCookingTimer: (show: boolean) => void;
  setShowSelfAnalysis: (show: boolean) => void;
  setShowBookshelf: (show: boolean) => void;
  setShowMemos: (show: boolean) => void;
  setShowReports: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setShowTimeTracking: (show: boolean) => void;
  setShowPublicMemos: (show: boolean) => void;
  setShowWorkRecords: (show: boolean) => void;
  setShowSoundApp: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setShowVersionInfo: (show: boolean) => void;
  setShowThemeSettings: (show: boolean) => void;
  setShowFontSettings: (show: boolean) => void;
  setShowFeatureSettings: (show: boolean) => void;
  setShowBugReportModal: (show: boolean) => void;
  setShowUpdateRequestModal: (show: boolean) => void;
  // その他の関数
  closeOtherFeatures: (activeFeature: string) => void;
  onUpdateRequestSubmit: (updateRequest: {
    title: string;
    content: string;
    priority: string;
    category: string;
  }) => Promise<void>;
  onBugReportSubmit: (bugReport: {
    title: string;
    content: string;
    severity: string;
    category: string;
  }) => Promise<void>;
  // データローディング関数
  loadProjects: () => Promise<void>;
  loadTimeEntries: () => Promise<void>;
  loadBooks: () => Promise<void>;
  loadMemos: () => Promise<void>;
  loadPublicMemos: () => Promise<void>;
  loadAdminUsers: () => Promise<void>;
  loadReportSummary: () => Promise<void>;
  // 時間記録ハンドラー
  handleStartTracking: () => void;
  handleStopTracking: () => void;
  handleResetTracking: () => void;
  handleCreateIncomeExpenseRecord: (e: React.FormEvent) => Promise<void>;
  handleCreateDiary: (e: React.FormEvent) => Promise<void>;
  handleUpdateIncomeExpenseRecord: (e: React.FormEvent) => Promise<void>;
  handleUpdateDiary: (e: React.FormEvent) => Promise<void>;
  handleDeleteIncomeExpenseRecord: (id: string) => Promise<void>;
  handleDeleteDiary: (id: string) => Promise<void>;
  // ユーザー設定
  loadUserSettings: () => Promise<void>;
  // 機能管理
  getVisibleFeatures: () => any[];
  // データ関連のプロパティ（追加）
  projects: any[];
  books: any[];
  memos: any[];
  publicMemos: any[];
  adminUsers: any[];
  reportSummary: any;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  projectColor: string;
  setProjectColor: (color: string) => void;
  handleCreateProject: (e: React.FormEvent) => Promise<void>;
  handleCreateBook: (e: React.FormEvent) => Promise<void>;
  handleUpdateBook: (e: React.FormEvent) => Promise<void>;
  handleEditBook: (book: any) => void;
  handleDeleteBook: (bookId: string) => Promise<void>;
  handleBookCategoryChange: (category: string) => void;
  getReadingProgress: (book: any) => number;
  handleCreateMemo: (e: React.FormEvent) => Promise<void>;
  // タイマー関連のプロパティ
  showTimers: boolean;
  setShowTimers: (show: boolean) => void;
  customTimerActive: boolean;
  setCustomTimerActive: (active: boolean) => void;
  customTimerPaused: boolean;
  setCustomTimerPaused: (paused: boolean) => void;
  customTimerTime: number;
  setCustomTimerTime: (time: number) => void;
  customTimerInterval: NodeJS.Timeout | null;
  setCustomTimerInterval: (interval: NodeJS.Timeout | null) => void;
  customTimerMinutes: number;
  setCustomTimerMinutes: (minutes: number) => void;
  customTimerSeconds: number;
  setCustomTimerSeconds: (seconds: number) => void;
  customTimerName: string;
  setCustomTimerName: (name: string) => void;
  customTimerSound: "bell" | "chime" | "beep" | "alarm";
  setCustomTimerSound: (sound: "bell" | "chime" | "beep" | "alarm") => void;
  customTimerOriginalTime: number;
  setCustomTimerOriginalTime: (time: number) => void;
  startCustomTimer: () => void;
  pauseCustomTimer: () => void;
  stopCustomTimer: () => void;
  resetCustomTimer: () => void;
  // 料理タイマー関連のプロパティ
  setSelectedRecipe: (recipe: string) => void;
  selectedEggType: "soft" | "medium" | "hard";
  setSelectedEggType: (type: "soft" | "medium" | "hard") => void;
  eggTimerActive: boolean;
  setEggTimerActive: (active: boolean) => void;
  eggTimerPaused: boolean;
  setEggTimerPaused: (paused: boolean) => void;
  eggTimerTime: number;
  setEggTimerTime: (time: number) => void;
  eggTimerInterval: NodeJS.Timeout | null;
  setEggTimerInterval: (interval: NodeJS.Timeout | null) => void;
  eggTimerType: "soft" | "medium" | "hard";
  setEggTimerType: (type: "soft" | "medium" | "hard") => void;
  eggTimerSound: "bell" | "chime" | "beep" | "alarm";
  setEggTimerSound: (sound: "bell" | "chime" | "beep" | "alarm") => void;
  eggTimerOriginalTime: number;
  setEggTimerOriginalTime: (time: number) => void;
  eggTimerPhase: "heating" | "boiling" | "cooking";
  setEggTimerPhase: (phase: "heating" | "boiling" | "cooking") => void;
  eggTimerPhaseTime: number;
  setEggTimerPhaseTime: (time: number) => void;
  eggTimerPhaseName: string;
  setEggTimerPhaseName: (name: string) => void;
  startEggTimer: () => void;
  pauseEggTimer: () => void;
  stopEggTimer: () => void;
  resetEggTimer: () => void;
  getEggTimerDuration: (type: "soft" | "medium" | "hard") => number;
  // 音声関連のプロパティ
  soundLoopInterval: NodeJS.Timeout | null;
  setSoundLoopInterval: (interval: NodeJS.Timeout | null) => void;
  isSoundPlaying: boolean;
  setIsSoundPlaying: (playing: boolean) => void;
  playEggTimerSound: () => Promise<void>;
  startSoundLoop: (soundType: "bell" | "chime" | "beep" | "alarm") => void;
  stopSoundLoop: () => void;
  // タイマープリセット関連のプロパティ
  timerPresets: Array<{
    id: number;
    name: string;
    minutes: number;
    seconds: number;
    color: string;
  }>;
  setTimerPresets: (
    presets: Array<{
      id: number;
      name: string;
      minutes: number;
      seconds: number;
      color: string;
    }>
  ) => void;
  timerHistory: Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: Date;
    type: "custom" | "egg" | "preset";
  }>;
  setTimerHistory: (
    history: Array<{
      id: string;
      name: string;
      duration: number;
      completedAt: Date;
      type: "custom" | "egg" | "preset";
    }>
  ) => void;
  addToTimerHistory: (
    name: string,
    duration: number,
    type: "custom" | "egg" | "preset"
  ) => void;
  // 時間フォーマット関数
  formatTime: (seconds: number) => string;
  formatEggTimerTime: (seconds: number) => string;
  // 通知機能
  sendNotification: (title: string, body: string, icon?: string) => void;
  // カレンダー関連のプロパティ
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  showRecordDetail: boolean;
  setShowRecordDetail: (show: boolean) => void;
  selectedRecord: any;
  setSelectedRecord: (record: any) => void;
  selectedRecordType: "income" | "expense" | "diary" | null;
  setSelectedRecordType: React.Dispatch<
    React.SetStateAction<"income" | "expense" | "diary" | null>
  >;
  // 月収支メモ関連のプロパティ
  monthlyMemo: string;
  setMonthlyMemo: (memo: string) => void;
  editingMonthlyMemo: boolean;
  setEditingMonthlyMemo: (editing: boolean) => void;
  loadMonthlyMemo: () => void;
  saveMonthlyMemo: () => void;
  startEditingMonthlyMemo: () => void;
  cancelEditingMonthlyMemo: () => void;
  // カレンダー操作関数
  navigateMonth: (direction: "prev" | "next") => void;
  openDiaryForm: () => void;
  openIncomeExpenseForm: () => void;
  // カスタムカテゴリ管理
  customCategories: string[];
  setCustomCategories: (categories: string[]) => void;
  newGenreName: string;
  setNewGenreName: (name: string) => void;
  handleAddCategory: () => void;
  handleDeleteCategory: (category: string) => void;
  getAllGenres: () => string[];
  // EggTimerComponent用のプロパティ
  showEggTimer: boolean;
  setShowEggTimer: (show: boolean) => void;
  timerSettings: {
    eggTimerSound: "bell" | "chime" | "beep" | "alarm";
    enableSounds: boolean;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  isLoggedIn,
  showCharacterHome,
  showProjects,
  showCookingTimer,
  showSelfAnalysis,
  showReports,
  showAdminPanel,
  showTimeTracking,
  showWorkRecords,
  // UI設定関連
  selectedTheme,
  selectedFont,
  fontSettings,
  showLanguageFontSettings,
  setShowLanguageFontSettings,
  handleThemeChange,
  handleFontChange,
  handleLanguageFontSave,
  availableThemes,
  availableFonts,
  showSoundApp,
  showNotifications,
  showVersionInfo,
  showThemeSettings,
  showFontSettings,
  showFeatureSettings,
  showBugReportModal,
  showUpdateRequestModal,
  // 追加のUI状態（App_backup.tsxから復元）
  showDiaryReminderSettings,
  setShowDiaryReminderSettings,
  showMoodForm,
  setShowMoodForm,
  showGoalForm,
  setShowGoalForm,
  // 日記リマインダー関連
  diaryReminderSnoozeUntil,
  setDiaryReminderSnoozeUntil,
  // お仕事記録関連の状態
  showIncomeExpenseForm,
  setShowIncomeExpenseForm,
  showDiaryForm,
  setShowDiaryForm,
  editingIncomeExpenseRecord,
  setEditingIncomeExpenseRecord,
  editingDiary,
  setEditingDiary,
  // 収入・支出記録フォームの状態
  incomeExpenseDate,
  setIncomeExpenseDate,
  incomeExpenseAmount,
  setIncomeExpenseAmount,
  incomeExpenseType,
  setIncomeExpenseType,
  incomeExpenseNotes,
  setIncomeExpenseNotes,
  // 日記フォームの状態
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
  diaryTags,
  setDiaryTags,
  diaryIsPrivate,
  setDiaryIsPrivate,
  // 新しい日記項目の状態
  diaryWorkSummary,
  setDiaryWorkSummary,
  diaryAchievements,
  setDiaryAchievements,
  diaryChallenges,
  setDiaryChallenges,
  diaryLearnings,
  setDiaryLearnings,
  diaryNextGoals,
  setDiaryNextGoals,
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
  diaryNotes,
  setDiaryNotes,
  diaryGratitude,
  setDiaryGratitude,
  diaryReflection,
  setDiaryReflection,
  // 配列項目の一時入力状態
  newAchievement,
  setNewAchievement,
  newChallenge,
  setNewChallenge,
  newLearning,
  setNewLearning,
  newNextGoal,
  setNewNextGoal,
  // メモ関連の状態
  showMemos,
  showMemoForm,
  setShowMemoForm,
  editingMemo,
  setEditingMemo,
  memoTitle,
  setMemoTitle,
  memoContent,
  setMemoContent,
  memoCategory,
  setMemoCategory,
  memoTags,
  setMemoTags,
  memoIsPublic,
  setMemoIsPublic,
  memoIsFamilyOnly,
  setMemoIsFamilyOnly,
  memoIsAdminOnly,
  setMemoIsAdminOnly,
  memoSearchTerm,
  setMemoSearchTerm,
  selectedMemoCategory,
  setSelectedMemoCategory,
  // 公開メモ関連の状態
  showPublicMemos,
  publicMemoSearchTerm,
  setPublicMemoSearchTerm,
  selectedPublicMemoCategory,
  setSelectedPublicMemoCategory,
  publicMemoCurrentDate,
  setPublicMemoCurrentDate,
  publicMemoSelectedDate,
  setPublicMemoSelectedDate,
  // 返信機能の状態
  replyingToMemo,
  setReplyingToMemo,
  replyContent,
  setReplyContent,
  editingReply,
  setEditingReply,
  editReplyContent,
  setEditReplyContent,
  // 本棚関連の状態
  showBookshelf,
  showBookForm,
  setShowBookForm,
  editingBook,
  setEditingBook,
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  bookIsbn,
  setBookIsbn,
  bookPublishedYear,
  setBookPublishedYear,
  bookTotalPages,
  setBookTotalPages,
  bookCategory,
  setBookCategory,
  bookNotes,
  setBookNotes,
  selectedBookCategory,
  setSelectedBookCategory,
  // 音響関連のハンドラー関数
  playBellSound,
  playChimeSound,
  playBeepSound,
  playAlarmSound,
  setShowCharacterHome,
  setShowProjects,
  setShowCookingTimer,
  setShowSelfAnalysis,
  setShowBookshelf,
  setShowMemos,
  setShowReports,
  setShowAdminPanel,
  setShowTimeTracking,
  setShowPublicMemos,
  setShowWorkRecords,
  setShowSoundApp,
  setShowNotifications,
  setShowVersionInfo,
  setShowThemeSettings,
  setShowFontSettings,
  setShowFeatureSettings,
  setShowBugReportModal,
  setShowUpdateRequestModal,
  closeOtherFeatures,
  onUpdateRequestSubmit,
  onBugReportSubmit,
  loadProjects,
  loadTimeEntries,
  loadBooks,
  loadMemos,
  loadPublicMemos,
  loadAdminUsers,
  loadReportSummary,
  handleStartTracking,
  handleStopTracking,
  handleResetTracking,
  handleCreateIncomeExpenseRecord,
  handleCreateDiary,
  handleUpdateIncomeExpenseRecord,
  handleUpdateDiary,
  handleDeleteIncomeExpenseRecord,
  handleDeleteDiary,
  loadUserSettings,
  getVisibleFeatures,
  // 追加のプロパティ（App_backup.tsxから復元）
  projects,
  books,
  memos,
  publicMemos,
  adminUsers,
  reportSummary,
  selectedProject,
  setSelectedProject,
  showProjectForm,
  setShowProjectForm,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  projectColor,
  setProjectColor,
  handleCreateProject,
  handleCreateBook,
  handleUpdateBook,
  handleEditBook,
  handleDeleteBook,
  handleBookCategoryChange,
  getReadingProgress,
  handleCreateMemo,
  // タイマー関連のプロパティ
  showTimers,
  setShowTimers,
  customTimerActive,
  setCustomTimerActive,
  customTimerPaused,
  setCustomTimerPaused,
  customTimerTime,
  setCustomTimerTime,
  customTimerInterval,
  setCustomTimerInterval,
  customTimerMinutes,
  setCustomTimerMinutes,
  customTimerSeconds,
  setCustomTimerSeconds,
  customTimerName,
  setCustomTimerName,
  customTimerSound,
  setCustomTimerSound,
  customTimerOriginalTime,
  setCustomTimerOriginalTime,
  startCustomTimer,
  pauseCustomTimer,
  stopCustomTimer,
  resetCustomTimer,
  eggTimerType,
  setEggTimerType,
  startEggTimer,
  // 音声関連のプロパティ
  soundLoopInterval,
  setSoundLoopInterval,
  isSoundPlaying,
  setIsSoundPlaying,
  stopSoundLoop,
  // タイマープリセット関連のプロパティ
  timerPresets,
  setTimerPresets,
  timerHistory,
  setTimerHistory,
  formatEggTimerTime,
  // カレンダー関連のプロパティ
  showCalendar,
  setShowCalendar,
  currentDate,
  setCurrentDate,
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  showRecordDetail,
  setShowRecordDetail,
  selectedRecord,
  setSelectedRecord,
  selectedRecordType,
  setSelectedRecordType,
  // 月収支メモ関連のプロパティ
  monthlyMemo,
  setMonthlyMemo,
  editingMonthlyMemo,
  setEditingMonthlyMemo,
  loadMonthlyMemo,
  saveMonthlyMemo,
  startEditingMonthlyMemo,
  cancelEditingMonthlyMemo,
  // カレンダー操作関数
  navigateMonth,
  openDiaryForm,
  openIncomeExpenseForm,
  // カスタムカテゴリ管理
  customCategories,
  setCustomCategories,
  newGenreName,
  setNewGenreName,
  handleAddCategory,
  handleDeleteCategory,
  getAllGenres,
  // EggTimerComponent用のプロパティ
  showEggTimer,
  setShowEggTimer,
  timerSettings,
}) => {
  // App_backup.tsxから復元する追加の状態変数
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [isRegisterMode, setIsRegisterMode] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  
  // エラー報告関連の状態
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [currentError, setCurrentError] = React.useState<Error | null>(null);
  const [showSimpleErrorModal, setShowSimpleErrorModal] = React.useState(false);
  const [errorModalButtonPosition, setErrorModalButtonPosition] = React.useState<{ x: number; y: number } | undefined>(undefined);
  
  // 各機能のローディング状態
  const [publicMemosLoading, setPublicMemosLoading] = React.useState(false);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [booksLoading, setBooksLoading] = React.useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = React.useState(false);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = React.useState(false);
  const [diaryLoading, setDiaryLoading] = React.useState(false);
  
  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = React.useState<any>(null);
  const [isTracking, setIsTracking] = React.useState(false);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [currentProject, setCurrentProject] = React.useState<string>("");
  
  // 追加の状態変数（propsで受け取っていないもののみ）
  
  // バックグラウンドタイマー関連の状態
  const [backgroundTimerActive, setBackgroundTimerActive] = React.useState(false);
  const [serviceWorker, setServiceWorker] = React.useState<ServiceWorker | null>(null);
  const [isMannerMode, setIsMannerMode] = React.useState(false);
  
  // 時間記録の進行状態
  const [isTimeTrackingActive, setIsTimeTrackingActive] = React.useState(false);
  
  // ジャンル管理の状態
  const [showGenreManagement, setShowGenreManagement] = React.useState(false);
  const [editingGenre, setEditingGenre] = React.useState<string | null>(null);
  const [editingGenreName, setEditingGenreName] = React.useState("");
  
  // キャラクター関連の状態
  const [characters, setCharacters] = React.useState<any[]>([]);
  const [currentCharacter, setCurrentCharacter] = React.useState<any>(null);
  
  // 機能設定の状態
  const [userSettings, setUserSettings] = React.useState<any>(null);
  const [draggedFeature, setDraggedFeature] = React.useState<string | null>(null);
  
  // 習慣トラッカー関連の状態
  const [newHabit, setNewHabit] = React.useState("");
  
  // 感情ログ関連の状態（propsで受け取っていないもののみ）
  const [editingMoodLog, setEditingMoodLog] = React.useState<string | null>(null);
  const [moodForm, setMoodForm] = React.useState({
    date: new Date().toISOString().split("T")[0],
    mood: 5,
    energy: 5,
    stress: 5,
    notes: "",
    activities: [] as string[],
    weather: "sunny",
    sleep: 8,
  });
  const [newActivity, setNewActivity] = React.useState("");
  
  // 目標管理関連の状態（propsで受け取っていないもののみ）
  const [editingGoal, setEditingGoal] = React.useState<string | null>(null);
  const [goalForm, setGoalForm] = React.useState({
    title: "",
    description: "",
    category: "personal",
    priority: "medium" as "low" | "medium" | "high",
    status: "not-started" as "not-started" | "in-progress" | "completed" | "paused",
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
  const [newMilestone, setNewMilestone] = React.useState("");
  
  // 不足している変数を追加（propsで受け取っていないもののみ）
  const [incomeExpenseRecords, setIncomeExpenseRecords] = React.useState<any[]>([]);
  const [workDiaries, setWorkDiaries] = React.useState<any[]>([]);
  
  // 機能の定義（App_backup.tsxから復元）
  const features = [
    {
      id: "time-tracking",
      name: "時間管理",
      description: "作業時間の記録と管理",
      component: null,
    },
    {
      id: "cooking-timer",
      name: "料理タイマー",
      description: "料理の調理時間管理",
      component: null,
    },
    {
      id: "projects",
      name: "プロジェクト",
      description: "プロジェクトの管理",
      component: null,
    },
    {
      id: "reports",
      name: "レポート",
      description: "作業時間のレポート表示",
      component: null,
    },
    {
      id: "admin-panel",
      name: "管理者パネル",
      description: "ユーザー管理とシステム設定",
      component: null,
    },
    {
      id: "bookshelf",
      name: "本棚",
      description: "本の管理と記録",
      component: null,
    },
    {
      id: "memos",
      name: "メモ",
      description: "個人メモの管理",
      component: null,
    },
    {
      id: "public-memos",
      name: "公開メモ",
      description: "公開メモの閲覧と投稿",
      component: null,
    },
    {
      id: "work-records",
      name: "お仕事記録",
      description: "給料記録と日記",
      component: null,
    },
    {
      id: "timers",
      name: "タイマー",
      description: "カスタムタイマーとプリセットタイマー",
      component: null,
    },
    {
      id: "egg-timer",
      name: "ゆでたまごタイマー",
      description: "ゆでたまごの調理時間管理",
      component: null,
    },
    {
      id: "self-analysis",
      name: "じぶん図鑑",
      description: "自分自身を深く理解するための分析ツール",
      component: null,
    },
    {
      id: "sound-app",
      name: "音アプリ",
      description: "食事バランスを音で表現するアプリ",
      component: null,
    },
  ];

  // 表示する機能を取得
  const getVisibleFeaturesList = () => {
    return features.filter((feature) => {
      // 管理者パネルは管理者のみ表示
      if (feature.id === "admin-panel" && user?.role !== "admin") {
        return false;
      }
      return true;
    });
  };
  // CookingTimerSection の状態管理
  const [selectedRecipe, setSelectedRecipe] = React.useState("boiled-egg");
  const [selectedEggType, setSelectedEggType] = React.useState<
    "soft" | "medium" | "hard"
  >("medium");
  const [eggTimerActive, setEggTimerActive] = React.useState(false);
  const [eggTimerPaused, setEggTimerPaused] = React.useState(false);
  const [eggTimerTime, setEggTimerTime] = React.useState(0);
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = React.useState(0);
  const [eggTimerPhase, setEggTimerPhase] = React.useState<
    "heating" | "boiling" | "cooking"
  >("heating");
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = React.useState(0);
  const [eggTimerPhaseName, setEggTimerPhaseName] = React.useState("");
  const [eggTimerSound, setEggTimerSound] = React.useState<
    "bell" | "chime" | "beep" | "alarm"
  >("bell");
  const [eggTimerInterval, setEggTimerInterval] =
    React.useState<NodeJS.Timeout | null>(null);
  const [message, setMessage] = React.useState("");

  // SelfAnalysisComponent の状態管理
  const [selfAnalysisTab, setSelfAnalysisTab] = React.useState("profile");
  const [personalProfile, setPersonalProfile] = React.useState<PersonalProfile>(
    {
      values: [],
      goals: [],
      skills: [],
      interests: [],
      strengths: [],
      weaknesses: [],
      personality: "",
      lifestyle: "",
      workStyle: "",
      learningStyle: "",
      motivation: "",
      challenges: [],
      achievements: [],
      futureVision: "",
      notes: "",
    }
  );
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [habitHistory, setHabitHistory] = React.useState({});
  const [habitStreak, setHabitStreak] = React.useState({});
  const [moodLogs, setMoodLogs] = React.useState<any[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [learningRecords, setLearningRecords] = React.useState<
    LearningRecord[]
  >([]);
  const [timeEntries, setTimeEntries] = React.useState([]);

  // SelfAnalysisComponent の関数
  const calculateTimeBreakdown = () => ({});
  const calculateProductivityTrend = () => [];
  const calculateProductivityStats = () => ({
    averageHours: 0,
    maxHours: 0,
    totalHours: 0,
    productiveDays: 0,
    productivityRate: 0,
  });

  // CookingTimerSection の関数
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { 
        body, 
        ...(icon && { icon }) 
      });
    }
  };

  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    // 音声ループの実装（簡易版）
    console.log(`Starting sound loop: ${soundType}`);
  };

  const addToTimerHistory = (
    name: string,
    duration: number,
    type: "custom" | "egg" | "preset"
  ) => {
    // タイマー履歴の追加（簡易版）
    console.log(`Added to timer history: ${name}, ${duration}s, ${type}`);
  };

  const playEggTimerSound = async () => {
    // 音声再生の実装（簡易版）
    console.log("Playing egg timer sound");
  };

  const pauseEggTimer = () => {
    setEggTimerPaused(true);
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
  };

  const stopEggTimer = () => {
    setEggTimerActive(false);
    setEggTimerPaused(false);
    setEggTimerTime(0);
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
  };

  const resetEggTimer = () => {
    setEggTimerTime(eggTimerOriginalTime);
    setEggTimerPhase("heating");
    setEggTimerPhaseTime(0);
    setEggTimerPhaseName("");
  };

  const getEggTimerDuration = (type: "soft" | "medium" | "hard") => {
    const durations = { soft: 6 * 60, medium: 8 * 60, hard: 10 * 60 };
    return durations[type];
  };

  const getTotalCookingTime = (
    recipeKey: string,
    eggType?: "soft" | "medium" | "hard"
  ) => {
    if (recipeKey === "boiled-egg" && eggType) {
      return getEggTimerDuration(eggType);
    }
    return 0;
  };

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

  // App_backup.tsxから復元する関数群
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
      
      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("authToken", data.access_token);
        // Note: setUser and setIsLoggedIn should be passed as props from parent component
        console.log("Login successful:", data.user);
      } else {
        setMessage(data.message || "ログインに失敗しました");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("ログイン中にエラーが発生しました");
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
      
      if (response.ok) {
        setMessage("登録に成功しました。ログインしてください。");
        setIsRegisterMode(false);
      } else {
        setMessage(data.message || "登録に失敗しました");
      }
    } catch (error) {
      console.error("Register error:", error);
      setMessage("登録中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterHomeToggle = () => {
    setShowCharacterHome(!showCharacterHome);
  };

  const handleSelectCharacter = (character: any) => {
    setCurrentCharacter(character);
    setShowCharacterHome(false);
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    setDraggedFeature(featureId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetFeatureId: string) => {
    e.preventDefault();
    if (!draggedFeature || draggedFeature === targetFeatureId) return;
    
    // 機能の並び順を更新する処理
    console.log(`Moving ${draggedFeature} to ${targetFeatureId}`);
    setDraggedFeature(null);
  };

  const handleTouchStart = (e: React.TouchEvent, featureId: string) => {
    setDraggedFeature(featureId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // タッチ移動の処理
  };

  const handleTouchEnd = (e: React.TouchEvent, targetFeatureId: string) => {
    if (draggedFeature && draggedFeature !== targetFeatureId) {
      console.log(`Moving ${draggedFeature} to ${targetFeatureId}`);
    }
    setDraggedFeature(null);
  };

  const moveFeatureUp = (featureId: string) => {
    // 機能を上に移動する処理
    console.log(`Moving ${featureId} up`);
  };

  const moveFeatureDown = (featureId: string) => {
    // 機能を下に移動する処理
    console.log(`Moving ${featureId} down`);
  };

  const handleFeatureToggle = (featureId: string) => {
    // 機能の表示/非表示を切り替える処理
    console.log(`Toggling ${featureId}`);
  };

  const getFeatureOrder = () => {
    return userSettings?.featureOrder || features.map(f => f.id);
  };

  const handleErrorReport = async (errorReport: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => {
    try {
      const response = await fetch("/api/error-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
      
      // レスポンスが有効なJSONかチェック
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("サーバーがJSON以外のレスポンスを返しました:", textResponse);
        throw new Error(`サーバーエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage("エラーレポートを送信しました");
        setShowErrorModal(false);
        setCurrentError(null);
      } else {
        setMessage(data.message || "エラーレポートの送信に失敗しました");
      }
    } catch (error) {
      console.error("Error reporting failed:", error);
      setMessage("エラーレポートの送信中にエラーが発生しました");
    }
  };

  const handleSimpleErrorReport = async (errorReport: {
    title: string;
    content: string;
    errorDetails: string;
    userAgent: string;
    timestamp: string;
  }) => {
    try {
      const response = await fetch("/api/error-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
      
      // レスポンスが有効なJSONかチェック
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("サーバーがJSON以外のレスポンスを返しました:", textResponse);
        throw new Error(`サーバーエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage("エラーレポートを送信しました");
        setShowSimpleErrorModal(false);
        setCurrentError(null);
      } else {
        setMessage(data.message || "エラーレポートの送信に失敗しました");
      }
    } catch (error) {
      console.error("Error reporting failed:", error);
      setMessage("エラーレポートの送信中にエラーが発生しました");
    }
  };

  const getErrorInfo = (error: Error | null) => {
    if (!error) return undefined;
    
    return {
      message: error.message,
      stack: error.stack || "",
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      filename: "",
      lineno: 0,
      colno: 0,
      type: "error",
      url: window.location.href,
    };
  };

  const editDiary = (diary: any) => {
    setEditingDiary(diary);
    setDiaryDate(diary.date);
    setDiaryTitle(diary.title);
    setDiaryContent(diary.content);
    setDiaryMood(diary.mood?.toString() || "4");
    setDiaryActivities(diary.activities || []);
    setDiaryTags(diary.tags || "");
    setDiaryIsPrivate(diary.isPrivate !== false);
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
    setDiaryGratitude(diary.gratitude || "");
    setDiaryReflection(diary.reflection || "");
    setShowDiaryForm(true);
  };

  // メモ関連のハンドラー関数
  const handleReplySubmit = async (memoId: string) => {
    const content = replyContent;
    try {
      const response = await fetch(`/api/memos/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ memoId, content }),
      });
      
      if (response.ok) {
        setReplyContent("");
        setReplyingToMemo(null);
        loadMemos();
      } else {
        setMessage("返信の投稿に失敗しました");
      }
    } catch (error) {
      console.error("Reply submit error:", error);
      setMessage("返信の投稿中にエラーが発生しました");
    }
  };

  const handleReplyCancel = () => {
    setReplyContent("");
    setReplyingToMemo(null);
  };

  const handleEditReply = (replyId: string, content: string) => {
    setEditingReply(replyId);
    setEditReplyContent(content);
  };

  const handleSaveEditReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ content: editReplyContent }),
      });
      
      if (response.ok) {
        setEditingReply(null);
        setEditReplyContent("");
        loadMemos();
      } else {
        setMessage("返信の更新に失敗しました");
      }
    } catch (error) {
      console.error("Edit reply error:", error);
      setMessage("返信の更新中にエラーが発生しました");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("この返信を削除しますか？")) return;
    
    try {
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      
      if (response.ok) {
        loadMemos();
      } else {
        setMessage("返信の削除に失敗しました");
      }
    } catch (error) {
      console.error("Delete reply error:", error);
      setMessage("返信の削除中にエラーが発生しました");
    }
  };

  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditReplyContent("");
  };

  // データ読み込み関数
  const loadIncomeExpenseRecords = async () => {
    try {
      const token = localStorage.getItem("access_token");
      
      // JWTトークンから実際のユーザーIDを取得
      let actualUserId = user?.id || 'temp-id';
      if (token) {
        try {
          console.log("MainLayout - loadIncomeExpenseRecords token:", token.substring(0, 50) + "...");
          const parts = token.split('.');
          console.log("MainLayout - loadIncomeExpenseRecords token parts length:", parts.length);
          if (parts.length === 3) {
            let payload = parts[1];
            console.log("MainLayout - loadIncomeExpenseRecords payload part:", payload);
            
            // JWT uses URL-safe base64, so we need to handle it properly
            // Replace URL-safe characters
            payload = payload?.replace(/-/g, '+').replace(/_/g, '/') || '';
            
            // Add padding if necessary
            const pad = payload.length % 4;
            if (pad) {
              if (pad === 1) {
                throw new Error('Invalid token');
              }
              payload += new Array(5 - pad).join('=');
            }
            
            // Now decode
            const decoded = JSON.parse(atob(payload));
            console.log("MainLayout - loadIncomeExpenseRecords Successfully decoded JWT payload:", decoded);
            
            actualUserId = decoded.userId || decoded.user_id || user?.id || 'temp-id';
            console.log("MainLayout - loadIncomeExpenseRecords actual user ID from token:", actualUserId);
          } else {
            console.warn("MainLayout - Invalid token format for income records");
          }
        } catch (e) {
          console.warn("MainLayout - Failed to decode token for income records:", e);
          // Fall back to user.id
          actualUserId = user?.id || 'temp-id';
        }
      }
      
      const response = await fetch(`/api/work-records/salary?userId=${actualUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIncomeExpenseRecords(data.records || []);
      }
    } catch (error) {
      console.error("Failed to load income expense records:", error);
    }
  };

  const loadWorkDiaries = async () => {
    console.log("MainLayout - loadWorkDiaries called with user:", user?.id);
    try {
      const token = localStorage.getItem("access_token");
      console.log("MainLayout - loadWorkDiaries token exists:", !!token);
      
      // JWTトークンから実際のユーザーIDを取得
      let actualUserId = user?.id || 'temp-id';
      if (token) {
        try {
          console.log("MainLayout - loadWorkDiaries token:", token.substring(0, 50) + "...");
          const parts = token.split('.');
          console.log("MainLayout - loadWorkDiaries token parts length:", parts.length);
          if (parts.length === 3) {
            let payload = parts[1];
            console.log("MainLayout - loadWorkDiaries payload part:", payload);
            
            // JWT uses URL-safe base64, so we need to handle it properly
            // Replace URL-safe characters
            payload = payload?.replace(/-/g, '+').replace(/_/g, '/') || '';
            
            // Add padding if necessary
            const pad = payload.length % 4;
            if (pad) {
              if (pad === 1) {
                throw new Error('Invalid token');
              }
              payload += new Array(5 - pad).join('=');
            }
            
            // Now decode
            const decoded = JSON.parse(atob(payload));
            console.log("MainLayout - loadWorkDiaries Successfully decoded JWT payload:", decoded);
            
            actualUserId = decoded.userId || decoded.user_id || user?.id || 'temp-id';
            console.log("MainLayout - loadWorkDiaries actual user ID from token:", actualUserId);
          } else {
            console.warn("MainLayout - Invalid token format");
          }
        } catch (e) {
          console.warn("MainLayout - Failed to decode token:", e);
          // Fall back to user.id
          actualUserId = user?.id || 'temp-id';
        }
      }
      
      const response = await fetch(`/api/work-records/diary?userId=${actualUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("MainLayout - loadWorkDiaries response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("MainLayout - loadWorkDiaries data:", data);
        setWorkDiaries(data.diaries || []);
        console.log("MainLayout - setWorkDiaries called with:", data.diaries || []);
      } else {
        console.error("MainLayout - loadWorkDiaries failed with status:", response.status);
      }
    } catch (error) {
      console.error("MainLayout - Failed to load work diaries:", error);
    }
  };

  // コンポーネントマウント時にデータを読み込み
  React.useEffect(() => {
    if (isLoggedIn && user) {
      console.log("MainLayout - useEffect triggered, loading data for user:", user.id);
      loadIncomeExpenseRecords();
      loadWorkDiaries();
    }
  }, [isLoggedIn, user]);

  // workDiariesの状態変化を監視
  React.useEffect(() => {
    console.log("MainLayout - workDiaries state changed:", workDiaries);
  }, [workDiaries]);



  // デバッグログの追加
  React.useEffect(() => {
    console.log("MainLayout - Props received:", {
      user: user
        ? { id: user.id, email: user.email, displayName: user.displayName }
        : null,
      isLoggedIn,
      showCharacterHome,
      showProjects,
      showCookingTimer,
      showSelfAnalysis,
      showBookshelf,
      showMemos,
      showReports,
      showAdminPanel,
      showTimeTracking,
      showTimers,
      showPublicMemos,
      showWorkRecords,
      showSoundApp,
      showNotifications,
      showVersionInfo,
      showThemeSettings,
      showFontSettings,
      showFeatureSettings,
    });
  }, [
    user,
    isLoggedIn,
    showCharacterHome,
    showProjects,
    showCookingTimer,
    showSelfAnalysis,
    showBookshelf,
    showMemos,
    showReports,
    showAdminPanel,
    showTimeTracking,
    showTimers,
    showPublicMemos,
    showWorkRecords,
    showSoundApp,
    showNotifications,
    showVersionInfo,
    showThemeSettings,
    showFontSettings,
    showFeatureSettings,
  ]);

  // 認証されていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    console.log("MainLayout - User not authenticated, not rendering content");
    return null;
  }
  return (
    <>
      <style>{`
        .theme-settings-modal,
        .font-settings-modal,
        .feature-settings-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }
        
        .modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.2em;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
        }
        
        .close-button:hover {
          background-color: #f0f0f0;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-body p {
          margin: 10px 0;
          line-height: 1.5;
        }
        
        .theme-preview {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
        }
        
        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .theme-option {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .theme-option:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }
        
        .theme-option input[type="radio"] {
          margin-right: 10px;
        }
        
        .theme-preview-icon {
          font-size: 1.5em;
          margin-right: 8px;
        }
        
        .theme-label {
          font-weight: 500;
        }
        
        .theme-option input[type="radio"]:checked + .theme-preview-icon + .theme-label {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .header-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .language-font-button {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s ease;
        }
        
        .language-font-button:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }
        
        .font-preview {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          text-align: center;
        }
        
        .font-preview p {
          margin: 8px 0;
          font-size: 1.1em;
        }
        
        .font-preview-text {
          margin: 8px 0;
          font-size: 1.1em;
        }
        
        .font-option-text {
          font-size: 1em;
          font-weight: 500;
        }
        
        .font-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .font-option {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .font-option:hover {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }
        
        .font-option input[type="radio"] {
          margin-right: 10px;
        }
        
        .font-option span {
          font-size: 1em;
          font-weight: 500;
        }
        
        .font-option input[type="radio"]:checked + span {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .feature-settings-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .feature-settings-section:last-child {
          border-bottom: none;
        }
        
        .feature-settings-section h4 {
          margin: 0 0 15px 0;
          color: #374151;
          font-size: 1.1em;
        }
        
        .reminder-settings-btn,
        .settings-option-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 0.95em;
          transition: all 0.2s ease;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        
        .reminder-settings-btn:hover,
        .settings-option-btn:hover {
          background: #e9ecef;
          border-color: #3b82f6;
        }
        
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .feature-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f8f9fa;
        }
        
        .feature-item-content {
          flex: 1;
        }
        
        .feature-info {
          display: flex;
          flex-direction: column;
        }
        
        .feature-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }
        
        .feature-description {
          font-size: 0.9em;
          color: #6b7280;
        }
        
        .feature-controls {
          display: flex;
          align-items: center;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        
        .toggle-switch input:checked + .toggle-slider {
          background-color: #3b82f6;
        }
        
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }
        
        .settings-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .feature-settings-actions {
          margin-top: 20px;
          text-align: center;
        }
        
        .save-button {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 1em;
          transition: all 0.2s ease;
        }
        
        .save-button:hover {
          background: #2563eb;
        }
        
        /* メインコンテンツエリアのスタイリング */
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        .dashboard {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
        }
        
        .dashboard-main {
          flex: 1;
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
          min-height: calc(100vh - 120px);
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        /* 各機能コンポーネントの表示制御 */
        .feature-section {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        
        .feature-section:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }
        
        .feature-section:last-child {
          margin-bottom: 0;
        }
        
        /* レスポンシブデザイン */
        @media (max-width: 768px) {
          .dashboard-main {
            padding: 0.75rem;
            min-height: calc(100vh - 100px);
            gap: 0.75rem;
          }
          
          .feature-section {
            border-radius: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-main {
            padding: 0.5rem;
            min-height: calc(100vh - 80px);
            gap: 0.5rem;
          }
          
          .feature-section {
            border-radius: 6px;
          }
        }
        
        /* 高解像度ディスプレイ対応 */
        @media (min-width: 1400px) {
          .dashboard-main {
            max-width: 1400px;
          }
        }
        
        /* 印刷時のスタイル */
        @media print {
          .feature-section {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ccc;
          }
        }
        
        /* スクロールバーのスタイリング */
        .dashboard-main::-webkit-scrollbar {
          width: 8px;
        }
        
        .dashboard-main::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .dashboard-main::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .dashboard-main::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* キャラクター達のお家モーダル */
        .character-home-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }
        
        .character-home-modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 90vw;
          max-height: 90vh;
          width: 600px;
          overflow: hidden;
        }
        
        .character-home-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .character-home-modal-header h2 {
          margin: 0;
          font-size: 1.5em;
        }
        
        .character-home-modal-header .close-button {
          background: none;
          border: none;
          color: white;
          font-size: 1.5em;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
        }
        
        .character-home-modal-header .close-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* 機能設定のドラッグ&ドロップスタイル */
        .feature-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f8f9fa;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        
        .feature-item.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
        }
        
        .feature-drag-handle {
          cursor: grab;
          color: #6b7280;
          font-size: 1.2em;
          margin-right: 10px;
          padding: 5px;
        }
        
        .feature-drag-handle:active {
          cursor: grabbing;
        }
        
        .feature-item-content {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .feature-icon {
          margin-right: 15px;
        }
        
        .feature-info {
          flex: 1;
        }
        
        .feature-name {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }
        
        .feature-description {
          font-size: 0.9em;
          color: #6b7280;
        }
        
        .feature-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .feature-order-controls {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .order-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 0.8em;
          transition: all 0.2s ease;
        }
        
        .order-button:hover:not(:disabled) {
          background: #e5e7eb;
          border-color: #9ca3af;
        }
        
        .order-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .up-button {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .down-button {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
      `}</style>
      <div className="app">
        <div className="dashboard">
          <HeaderComponent
            user={user}
            isLoggedIn={isLoggedIn}
            onShowCharacterHome={() => {
              closeOtherFeatures("character-home");
            }}
            onShowProjects={() => {
              closeOtherFeatures("projects");
            }}
            onShowCookingTimer={() => {
              closeOtherFeatures("cooking-timer");
            }}
            onShowSelfAnalysis={() => {
              closeOtherFeatures("self-analysis");
            }}
            onShowBookshelf={() => {
              closeOtherFeatures("bookshelf");
            }}
            onShowMemos={() => {
              closeOtherFeatures("memos");
            }}
            onShowReports={() => {
              closeOtherFeatures("reports");
            }}
            onShowAdminPanel={() => {
              closeOtherFeatures("admin-panel");
            }}
            onShowTimeTracking={() => {
              closeOtherFeatures("time-tracking");
            }}
            onShowTimers={() => {
              closeOtherFeatures("timers");
            }}
            onShowEggTimer={() => {
              closeOtherFeatures("egg-timer");
              setShowEggTimer(true);
            }}
            onShowPublicMemos={() => {
              closeOtherFeatures("public-memos");
            }}
            onShowWorkRecords={() => {
              closeOtherFeatures("work-records");
            }}
            onShowSoundApp={() => {
              closeOtherFeatures("sound-app");
            }}
            onShowNotifications={() => {
              closeOtherFeatures("notifications");
            }}
            onShowVersionInfo={() => {
              closeOtherFeatures("version-info");
            }}
            currentCharacter={null}
            showThemeSettings={false}
            showFontSettings={false}
            showFeatureSettings={false}
            handleCharacterHomeToggle={() => {
              closeOtherFeatures("character-home");
              setShowCharacterHome(true);
            }}
            handleLogout={() => {
              console.log("MainLayout - Logout button clicked");
              // ログアウト処理
              localStorage.removeItem("access_token");
              localStorage.removeItem("authToken");
              window.location.reload();
            }}
            closeOtherFeatures={closeOtherFeatures}
            setShowThemeSettings={setShowThemeSettings}
            setShowFontSettings={setShowFontSettings}
            setShowFeatureSettings={setShowFeatureSettings}
            loadUserSettings={loadUserSettings}
            isTimeTrackingActive={false}
            onUpdateRequestClick={() => {
              console.log("MainLayout - Update request button clicked");
              setShowUpdateRequestModal(true);
            }}
            onBugReportClick={() => {
              console.log("MainLayout - Bug report button clicked");
              setShowBugReportModal(true);
            }}
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
                  console.log("Navigating to memo:", memoId);
                }, 100);
              }}
            />
          </div>

          <main className="dashboard-main">
            {/* キャラクター達のお家 */}
            {showCharacterHome && (
              <div className="feature-section">
                <CharacterHome
                  showCharacterHome={showCharacterHome}
                  setShowCharacterHome={setShowCharacterHome}
                  closeOtherFeatures={closeOtherFeatures}
                  onSelectCharacter={() => {}}
                  currentCharacter={null}
                />
              </div>
            )}

            {/* 各機能コンポーネント */}
            {getVisibleFeaturesList().map((feature) => {
              if (feature.id === "time-tracking" && showTimeTracking) {
                return (
                  <div key={feature.id} className="feature-section">
                    <TimeTrackingComponent
                      showTimeTracking={showTimeTracking}
                      setShowTimeTracking={setShowTimeTracking}
                      closeOtherFeatures={closeOtherFeatures}
                      projects={[]}
                      projectsLoading={false}
                      timeEntries={[]}
                      timeEntriesLoading={false}
                      startTime={null}
                      description=""
                      setDescription={() => {}}
                      isTracking={false}
                      currentProject=""
                      setCurrentProject={() => {}}
                      elapsedTime={0}
                      loadProjects={loadProjects}
                      loadTimeEntries={loadTimeEntries}
                      handleStartTracking={handleStartTracking}
                      handleStopTracking={handleStopTracking}
                      handleResetTracking={handleResetTracking}
                    />
                  </div>
                );
              } else if (feature.id === "cooking-timer" && showCookingTimer) {
                return (
                  <div key={feature.id} className="feature-section">
                    <CookingTimerSection
                      showCookingTimer={showCookingTimer}
                      setShowCookingTimer={setShowCookingTimer}
                      closeOtherFeatures={closeOtherFeatures}
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
                      startSoundLoop={startSoundLoop}
                      setMessage={() => {}}
                      sendNotification={sendNotification}
                      addToTimerHistory={addToTimerHistory}
                      playEggTimerSound={playEggTimerSound}
                      getTotalCookingTime={(
                        recipeKey: string,
                        eggType?: "soft" | "medium" | "hard"
                      ) => {
                        if (recipeKey === "boiled-egg" && eggType) {
                          return getEggTimerDuration(eggType);
                        }
                        return 0;
                      }}
                      formatTime={formatTime}
                      eggTimerType={selectedEggType}
                    />
                  </div>
                );
              } else if (feature.id === "projects" && showProjects) {
                return (
                  <div key={feature.id} className="feature-section">
                    <ProjectsSection
                      showProjects={showProjects}
                      setShowProjects={setShowProjects}
                      closeOtherFeatures={closeOtherFeatures}
                      showProjectForm={showProjectForm}
                      setShowProjectForm={setShowProjectForm}
                      projects={projects}
                      projectsLoading={false}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      projectName={projectName}
                      setProjectName={setProjectName}
                      projectDescription={projectDescription}
                      setProjectDescription={setProjectDescription}
                      projectColor={projectColor}
                      setProjectColor={setProjectColor}
                      loading={false}
                      handleCreateProject={handleCreateProject}
                      loadProjects={loadProjects}
                    />
                  </div>
                );
              } else if (feature.id === "self-analysis" && showSelfAnalysis) {
                return (
                  <div key={feature.id} className="feature-section">
                    <SelfAnalysisComponent
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
                      moodLogs={moodLogs}
                      setMoodLogs={setMoodLogs}
                      goals={goals}
                      setGoals={setGoals}
                      learningRecords={learningRecords}
                      setLearningRecords={setLearningRecords}
                      timeEntries={timeEntries}
                      calculateTimeBreakdown={calculateTimeBreakdown}
                      calculateProductivityTrend={calculateProductivityTrend}
                      calculateProductivityStats={calculateProductivityStats}
                      loadTimeEntries={loadTimeEntries}
                      closeOtherFeatures={closeOtherFeatures}
                    />
                  </div>
                );
              } else if (feature.id === "bookshelf" && showBookshelf) {
                return (
                  <div key={feature.id} className="feature-section">
                    <BookshelfComponent
                      showBookshelf={showBookshelf}
                      setShowBookshelf={setShowBookshelf}
                      closeOtherFeatures={closeOtherFeatures}
                      books={books}
                      booksLoading={false}
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
                      getBookCategories={() => [
                        "小説",
                        "技術書",
                        "ビジネス",
                        "自己啓発",
                        "その他",
                      ]}
                      loading={false}
                      loadBooks={loadBooks}
                      handleCreateBook={handleCreateBook}
                      handleUpdateBook={handleUpdateBook}
                      handleEditBook={handleEditBook}
                      handleDeleteBook={handleDeleteBook}
                      handleBookCategoryChange={handleBookCategoryChange}
                      getReadingProgress={getReadingProgress}
                    />
                  </div>
                );
              } else if (feature.id === "memos" && showMemos) {
                return (
                  <div key={feature.id} className="feature-section">
                    <MemosComponent
                      showMemos={showMemos}
                      setShowMemos={setShowMemos}
                      closeOtherFeatures={closeOtherFeatures}
                      memos={memos}
                      publicMemos={publicMemos}
                      memosLoading={false}
                      customCategories={customCategories}
                      setCustomCategories={setCustomCategories}
                      loadMemos={loadMemos}
                      handleDeleteMemo={() => {}}
                      user={user}
                      handleCreateMemo={handleCreateMemo}
                      handleUpdateMemo={() => {}}
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
                      handleDeleteReply={handleDeleteReply}
                      handleCancelEditReply={handleCancelEditReply}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      replyingToMemo={replyingToMemo}
                      setReplyingToMemo={setReplyingToMemo}
                    />
                  </div>
                );
              } else if (feature.id === "reports" && showReports) {
                return (
                  <div key={feature.id} className="feature-section">
                    <ReportsComponent
                      showReports={showReports}
                      setShowReports={setShowReports}
                      closeOtherFeatures={closeOtherFeatures}
                      incomeExpenseRecords={[]}
                      workDiaries={[]}
                      reportsLoading={false}
                      reportSummary={reportSummary}
                      loadReportSummary={loadReportSummary}
                    />
                  </div>
                );
              } else if (feature.id === "admin-panel" && showAdminPanel) {
                return (
                  <div key={feature.id} className="feature-section">
                    <AdminPanelComponent
                      showAdminPanel={showAdminPanel}
                      setShowAdminPanel={setShowAdminPanel}
                      closeOtherFeatures={closeOtherFeatures}
                      adminUsers={adminUsers}
                      adminUsersLoading={false}
                      editingUser={null}
                      setEditingUser={() => {}}
                      loadAdminUsers={loadAdminUsers}
                      handleEditUser={() => {}}
                      handleUpdateUser={() => {}}
                      handleDeleteUser={() => {}}
                    />
                  </div>
                );
              } else if (feature.id === "timers" && showTimers) {
                return (
                  <div key={feature.id} className="feature-section">
                    <TimersComponent
                      showTimers={showTimers}
                      setShowTimers={setShowTimers}
                      closeOtherFeatures={closeOtherFeatures}
                    />
                  </div>
                );
              } else if (feature.id === "egg-timer" && showEggTimer) {
                return (
                  <div key={feature.id} className="feature-section">
                    <EggTimerComponent
                      eggTimerActive={eggTimerActive}
                      eggTimerPaused={eggTimerPaused}
                      eggTimerTime={eggTimerTime}
                      eggTimerOriginalTime={eggTimerOriginalTime}
                      eggTimerPhase={eggTimerPhase}
                      eggTimerPhaseTime={eggTimerPhaseTime}
                      eggTimerPhaseName={eggTimerPhaseName}
                      eggTimerSound={eggTimerSound}
                      eggTimerType={selectedEggType}
                      setEggTimerActive={setEggTimerActive}
                      setEggTimerPaused={setEggTimerPaused}
                      setEggTimerTime={setEggTimerTime}
                      setEggTimerOriginalTime={setEggTimerOriginalTime}
                      setEggTimerPhase={setEggTimerPhase}
                      setEggTimerPhaseTime={setEggTimerPhaseTime}
                      setEggTimerPhaseName={setEggTimerPhaseName}
                      setEggTimerSound={setEggTimerSound}
                      setEggTimerType={setSelectedEggType}
                      setEggTimerInterval={setEggTimerInterval}
                      getEggTimerDuration={getEggTimerDuration}
                      getTotalCookingTime={(type: "soft" | "medium" | "hard") =>
                        getEggTimerDuration(type)
                      }
                      formatTime={formatTime}
                      playBellSound={playBellSound}
                      playChimeSound={playChimeSound}
                      playBeepSound={playBeepSound}
                      playAlarmSound={playAlarmSound}
                      timerSettings={timerSettings}
                    />
                  </div>
                );
              } else if (feature.id === "public-memos" && showPublicMemos) {
                return (
                  <div key={feature.id} className="feature-section">
                    <PublicMemosComponent
                      showPublicMemos={showPublicMemos}
                      setShowPublicMemos={setShowPublicMemos}
                      closeOtherFeatures={closeOtherFeatures}
                      publicMemos={publicMemos}
                      publicMemosLoading={false}
                      user={user}
                      loadPublicMemos={loadPublicMemos}
                      handleReplySubmit={handleReplySubmit}
                      handleReplyCancel={handleReplyCancel}
                      handleEditReply={handleEditReply}
                      handleSaveEditReply={handleSaveEditReply}
                      handleDeleteReply={handleDeleteReply}
                      handleCancelEditReply={handleCancelEditReply}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                    />
                  </div>
                );
              } else if (feature.id === "work-records" && showWorkRecords) {
                return (
                  <div key={feature.id} className="feature-section">
                    <WorkRecordsComponent
                      showWorkRecords={showWorkRecords}
                      setShowWorkRecords={setShowWorkRecords}
                      closeOtherFeatures={closeOtherFeatures}
                      incomeExpenseRecords={incomeExpenseRecords}
                      workDiaries={workDiaries}
                      incomeExpenseLoading={false}
                      diaryLoading={false}
                      workRecordsLoading={false}
                      showIncomeExpenseForm={showIncomeExpenseForm}
                      setShowIncomeExpenseForm={setShowIncomeExpenseForm}
                      showDiaryForm={showDiaryForm}
                      setShowDiaryForm={setShowDiaryForm}
                      editingIncomeExpenseRecord={editingIncomeExpenseRecord}
                      setEditingIncomeExpenseRecord={
                        setEditingIncomeExpenseRecord
                      }
                      editingDiary={editingDiary}
                      setEditingDiary={setEditingDiary}
                      incomeExpenseDate={incomeExpenseDate}
                      setIncomeExpenseDate={setIncomeExpenseDate}
                      incomeExpenseAmount={incomeExpenseAmount}
                      setIncomeExpenseAmount={setIncomeExpenseAmount}
                      incomeExpenseType={incomeExpenseType}
                      setIncomeExpenseType={setIncomeExpenseType}
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
                      diaryAchievements={diaryAchievements}
                      setDiaryAchievements={setDiaryAchievements}
                      diaryChallenges={diaryChallenges}
                      setDiaryChallenges={setDiaryChallenges}
                      diaryNextGoals={diaryNextGoals}
                      setDiaryNextGoals={setDiaryNextGoals}
                      diaryNotes={diaryNotes}
                      setDiaryNotes={setDiaryNotes}
                      diaryGratitude={diaryGratitude}
                      setDiaryGratitude={setDiaryGratitude}
                      diaryReflection={diaryReflection}
                      setDiaryReflection={setDiaryReflection}
                      loadIncomeExpenseRecords={loadIncomeExpenseRecords}
                      loadWorkDiaries={loadWorkDiaries}
                      handleCreateIncomeExpenseRecord={
                        handleCreateIncomeExpenseRecord
                      }
                      handleCreateDiary={handleCreateDiary}
                      handleUpdateIncomeExpenseRecord={
                        handleUpdateIncomeExpenseRecord
                      }
                      handleUpdateDiary={handleUpdateDiary}
                      handleDeleteIncomeExpenseRecord={
                        handleDeleteIncomeExpenseRecord
                      }
                      handleDeleteDiary={handleDeleteDiary}
                      editDiary={editDiary}
                      showCalendar={showCalendar}
                      setShowCalendar={setShowCalendar}
                      currentMonth={currentMonth}
                      setCurrentMonth={setCurrentMonth}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedRecord={selectedRecord}
                      setSelectedRecord={setSelectedRecord}
                      selectedRecordType={selectedRecordType}
                      setSelectedRecordType={setSelectedRecordType}
                      monthlyMemo={monthlyMemo}
                      setMonthlyMemo={setMonthlyMemo}
                      editingMonthlyMemo={editingMonthlyMemo}
                      setEditingMonthlyMemo={setEditingMonthlyMemo}
                      loadMonthlyMemo={loadMonthlyMemo}
                      saveMonthlyMemo={saveMonthlyMemo}
                      startEditingMonthlyMemo={startEditingMonthlyMemo}
                      cancelEditingMonthlyMemo={cancelEditingMonthlyMemo}
                      openDiaryForm={openDiaryForm}
                      user={user}
                    />
                  </div>
                );
              } else if (feature.id === "sound-app" && showSoundApp) {
                return (
                  <div key={feature.id} className="feature-section">
                    <SoundAppComponent
                      showSoundApp={showSoundApp}
                      setShowSoundApp={setShowSoundApp}
                      closeOtherFeatures={closeOtherFeatures}
                    />
                  </div>
                );
              }
              return null;
            })}
          </main>
        </div>

        {showNotifications && <NotificationComponent />}

        {showVersionInfo && <VersionInfo />}

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
                showCharacterHome={showCharacterHome}
                setShowCharacterHome={setShowCharacterHome}
                closeOtherFeatures={closeOtherFeatures}
                onSelectCharacter={handleSelectCharacter}
                currentCharacter={currentCharacter}
              />
            </div>
          </div>
        )}

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

        {showThemeSettings && (
          <div className="theme-settings-modal">
            <div
              className="modal-overlay"
              onClick={() => setShowThemeSettings(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>🎨 テーマ設定</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowThemeSettings(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
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
          </div>
        )}

        {showFontSettings && (
          <div className="font-settings-modal">
            <div
              className="modal-overlay"
              onClick={() => setShowFontSettings(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>🔤 フォント設定</h3>
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
                      className="close-button"
                      onClick={() => setShowFontSettings(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="modal-body">
                  <div className="font-preview">
                    <p
                      className="font-preview-text"
                      style={{
                        fontFamily:
                          selectedFont === "system" ? "" : selectedFont,
                      }}
                    >
                      時間記録 | プロジェクト | レポート | 管理者パネル
                    </p>
                    <p
                      className="font-preview-text"
                      style={{
                        fontFamily:
                          selectedFont === "system" ? "" : selectedFont,
                      }}
                    >
                      本棚 | メモ | 公開メモ | お仕事記録
                    </p>
                    <p
                      className="font-preview-text"
                      style={{
                        fontFamily:
                          selectedFont === "system" ? "" : selectedFont,
                      }}
                    >
                      作業内容を入力してください | ▶ 記録開始
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
                          className="font-option-text"
                          style={{
                            fontFamily:
                              font.value === "system" ? "" : font.value,
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
          </div>
        )}

        {showFeatureSettings && (
          <div className="feature-settings-modal">
            <div
              className="modal-overlay"
              onClick={() => setShowFeatureSettings(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>⚙️ 機能設定</h3>
                  <button
                    className="close-button"
                    onClick={() => setShowFeatureSettings(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <div className="feature-settings-section">
                    <h4>📝 日記リマインダー設定</h4>
                    <button
                      onClick={() => {
                        setShowFeatureSettings(false);
                        setShowDiaryReminderSettings(true);
                      }}
                      className="reminder-settings-btn"
                    >
                      📝 リマインダー設定を開く
                    </button>
                  </div>

                  <div className="feature-settings-section">
                    <h4>🎯 利用可能な機能</h4>
                    <p>各機能の表示/非表示を設定できます</p>
                    <div className="feature-list">
                      {getFeatureOrder().map((featureId: string) => {
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
                                    aria-label={`${feature.name}の表示/非表示を切り替え`}
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

                  <div className="feature-settings-section">
                    <h4>🔧 その他の設定</h4>
                    <div className="settings-options">
                      <button
                        onClick={() => {
                          setShowFeatureSettings(false);
                          setShowThemeSettings(true);
                        }}
                        className="settings-option-btn"
                      >
                        🎨 テーマ設定
                      </button>
                      <button
                        onClick={() => {
                          setShowFeatureSettings(false);
                          setShowFontSettings(true);
                        }}
                        className="settings-option-btn"
                      >
                        🔤 フォント設定
                      </button>
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
          </div>
        )}
      </div>

      <LanguageFontSettings
        isOpen={showLanguageFontSettings}
        onClose={() => setShowLanguageFontSettings(false)}
        onSave={handleLanguageFontSave}
        currentSettings={fontSettings}
      />

      <DiaryReminderIntegration
        showDiaryReminderSettings={showDiaryReminderSettings}
        setShowDiaryReminderSettings={setShowDiaryReminderSettings}
        diaryReminderSnoozeUntil={diaryReminderSnoozeUntil}
        setDiaryReminderSnoozeUntil={setDiaryReminderSnoozeUntil}
        onOpenDiaryForm={openDiaryForm}
      />

      <UpdateRequestModal
        isOpen={showUpdateRequestModal}
        onClose={() => setShowUpdateRequestModal(false)}
        onSubmit={onUpdateRequestSubmit}
      />

      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
        onSubmit={onBugReportSubmit}
      />
    </>
  );
};

export default MainLayout;
