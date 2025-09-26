import React from 'react';
import HeaderComponent from './HeaderComponent';
import CharacterHome from './CharacterHome';
import ProjectsSection from './ProjectsSection';
import CookingTimerSection from './CookingTimerSection';
import SelfAnalysisComponent from './SelfAnalysisComponent';
import BookshelfComponent from './BookshelfComponent';
import MemosComponent from './MemosComponent';
import ReportsComponent from './ReportsComponent';
import AdminPanelComponent from './AdminPanelComponent';
import { PersonalProfile } from './SelfAnalysisComponent';
import { Habit, Goal, LearningRecord } from '../types';
import TimeTrackingComponent from './TimeTrackingComponent';
import TimersComponent from './TimersComponent';
import PublicMemosComponent from './PublicMemosComponent';
import WorkRecordsComponent from './WorkRecordsComponent';
import SoundAppComponent from './SoundAppComponent';
import NotificationComponent from './NotificationComponent';
import VersionInfo from './VersionInfo';
import UpdateRequestModal from './UpdateRequestModal';
import BugReportModal from './BugReportModal';
import EggTimerComponent from './EggTimerComponent';
import HetamaIconComponent from './HetamaIconComponent';
import LanguageFontSettings from './LanguageFontSettings';
import DiaryReminderIntegration from './DiaryReminderIntegration';
import { User } from '../types';

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
  onUpdateRequestSubmit: (updateRequest: { title: string; content: string; priority: string; category: string }) => Promise<void>;
  onBugReportSubmit: (bugReport: { title: string; content: string; severity: string; category: string }) => Promise<void>;
  // データローディング関数
  loadProjects: () => Promise<void>;
  loadTimeEntries: () => Promise<void>;
  loadBooks: () => Promise<void>;
  loadMemos: () => Promise<void>;
  loadPublicMemos: () => Promise<void>;
  loadAdminUsers: () => Promise<void>;
  loadReportSummary: () => Promise<void>;
  loadIncomeExpenseRecords: () => Promise<void>;
  loadWorkDiaries: () => Promise<void>;
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
  // 追加のプロパティ（App_backup.tsxから復元）
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
  setTimerPresets: (presets: Array<{
    id: number;
    name: string;
    minutes: number;
    seconds: number;
    color: string;
  }>) => void;
  timerHistory: Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: Date;
    type: "custom" | "egg" | "preset";
  }>;
  setTimerHistory: (history: Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: Date;
    type: "custom" | "egg" | "preset";
  }>) => void;
  addToTimerHistory: (name: string, duration: number, type: "custom" | "egg" | "preset") => void;
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
  setSelectedRecordType: React.Dispatch<React.SetStateAction<"income" | "expense" | "diary" | null>>;
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
    eggTimerSound: 'bell' | 'chime' | 'beep' | 'alarm';
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
  loadIncomeExpenseRecords,
  loadWorkDiaries,
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
    return features.filter(feature => {
      // 管理者パネルは管理者のみ表示
      if (feature.id === "admin-panel" && user?.role !== "admin") {
        return false;
      }
      return true;
    });
  };
  // CookingTimerSection の状態管理
  const [selectedRecipe, setSelectedRecipe] = React.useState("boiled-egg");
  const [selectedEggType, setSelectedEggType] = React.useState<"soft" | "medium" | "hard">("medium");
  const [eggTimerActive, setEggTimerActive] = React.useState(false);
  const [eggTimerPaused, setEggTimerPaused] = React.useState(false);
  const [eggTimerTime, setEggTimerTime] = React.useState(0);
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = React.useState(0);
  const [eggTimerPhase, setEggTimerPhase] = React.useState<"heating" | "boiling" | "cooking">("heating");
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = React.useState(0);
  const [eggTimerPhaseName, setEggTimerPhaseName] = React.useState("");
  const [eggTimerSound, setEggTimerSound] = React.useState<"bell" | "chime" | "beep" | "alarm">("bell");
  const [eggTimerInterval, setEggTimerInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [message, setMessage] = React.useState("");

  // SelfAnalysisComponent の状態管理
  const [selfAnalysisTab, setSelfAnalysisTab] = React.useState("profile");
  const [personalProfile, setPersonalProfile] = React.useState<PersonalProfile>({
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
    notes: ""
  });
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [habitHistory, setHabitHistory] = React.useState({});
  const [habitStreak, setHabitStreak] = React.useState({});
  const [moodLogs, setMoodLogs] = React.useState<any[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [learningRecords, setLearningRecords] = React.useState<LearningRecord[]>([]);
  const [timeEntries, setTimeEntries] = React.useState([]);

  // SelfAnalysisComponent の関数
  const calculateTimeBreakdown = () => ({});
  const calculateProductivityTrend = () => [];
  const calculateProductivityStats = () => ({
    averageHours: 0,
    maxHours: 0,
    totalHours: 0,
    productiveDays: 0,
    productivityRate: 0
  });

  // CookingTimerSection の関数
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon });
    }
  };

  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    // 音声ループの実装（簡易版）
    console.log(`Starting sound loop: ${soundType}`);
  };

  const addToTimerHistory = (name: string, duration: number, type: "custom" | "egg" | "preset") => {
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

  const getTotalCookingTime = (recipeKey: string, eggType?: "soft" | "medium" | "hard") => {
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
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // デバッグログの追加
  React.useEffect(() => {
    console.log('MainLayout - Props received:', {
      user: user ? { id: user.id, email: user.email, displayName: user.displayName } : null,
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
  }, [user, isLoggedIn, showCharacterHome, showProjects, showCookingTimer, showSelfAnalysis, showBookshelf, showMemos, showReports, showAdminPanel, showTimeTracking, showTimers, showPublicMemos, showWorkRecords, showSoundApp, showNotifications, showVersionInfo, showThemeSettings, showFontSettings, showFeatureSettings]);

  // 認証されていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    console.log('MainLayout - User not authenticated, not rendering content');
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
      `}</style>
      <div className="app">
      <div className="dashboard">
        <HeaderComponent
          user={user}
          isLoggedIn={isLoggedIn}
          onShowCharacterHome={() => {
            closeOtherFeatures('character-home');
          }}
          onShowProjects={() => {
            closeOtherFeatures('projects');
          }}
          onShowCookingTimer={() => {
            closeOtherFeatures('cooking-timer');
          }}
          onShowSelfAnalysis={() => {
            closeOtherFeatures('self-analysis');
          }}
          onShowBookshelf={() => {
            closeOtherFeatures('bookshelf');
          }}
          onShowMemos={() => {
            closeOtherFeatures('memos');
          }}
          onShowReports={() => {
            closeOtherFeatures('reports');
          }}
          onShowAdminPanel={() => {
            closeOtherFeatures('admin-panel');
          }}
          onShowTimeTracking={() => {
            closeOtherFeatures('time-tracking');
          }}
          onShowTimers={() => {
            closeOtherFeatures('timers');
          }}
          onShowEggTimer={() => {
            closeOtherFeatures('egg-timer');
            setShowEggTimer(true);
          }}
          onShowPublicMemos={() => {
            closeOtherFeatures('public-memos');
          }}
          onShowWorkRecords={() => {
            closeOtherFeatures('work-records');
          }}
          onShowSoundApp={() => {
            closeOtherFeatures('sound-app');
          }}
          onShowNotifications={() => {
            closeOtherFeatures('notifications');
          }}
          onShowVersionInfo={() => {
            closeOtherFeatures('version-info');
          }}
          currentCharacter={null}
          showThemeSettings={false}
          showFontSettings={false}
          showFeatureSettings={false}
          handleCharacterHomeToggle={() => {
            closeOtherFeatures('character-home');
            setShowCharacterHome(true);
          }}
          handleLogout={() => {
            console.log('MainLayout - Logout button clicked');
            // ログアウト処理
            localStorage.removeItem('access_token');
            localStorage.removeItem('authToken');
            window.location.reload();
          }}
          closeOtherFeatures={closeOtherFeatures}
          setShowThemeSettings={setShowThemeSettings}
          setShowFontSettings={setShowFontSettings}
          setShowFeatureSettings={setShowFeatureSettings}
          loadUserSettings={loadUserSettings}
          isTimeTrackingActive={false}
          onUpdateRequestClick={() => {
            console.log('MainLayout - Update request button clicked');
            setShowUpdateRequestModal(true);
          }}
          onBugReportClick={() => {
            console.log('MainLayout - Bug report button clicked');
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
                console.log('Navigating to memo:', memoId);
              }, 100);
            }}
          />
        </div>
      </div>

      <main className="dashboard-main">
        {getVisibleFeaturesList().map((feature) => {
          if (feature.id === "time-tracking" && showTimeTracking) {
            return (
              <TimeTrackingComponent
                key={feature.id}
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
            );
          } else if (feature.id === "cooking-timer" && showCookingTimer) {
            return (
              <CookingTimerSection
                key={feature.id}
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
                getTotalCookingTime={(recipeKey: string, eggType?: "soft" | "medium" | "hard") => {
                  if (recipeKey === "boiled-egg" && eggType) {
                    return getEggTimerDuration(eggType);
                  }
                  return 0;
                }}
                formatTime={formatTime}
                eggTimerType={selectedEggType}
              />
            );
          } else if (feature.id === "projects" && showProjects) {
            return (
              <ProjectsSection
                key={feature.id}
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
            );
          } else if (feature.id === "self-analysis" && showSelfAnalysis) {
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
            );
          } else if (feature.id === "bookshelf" && showBookshelf) {
            return (
              <BookshelfComponent
                key={feature.id}
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
                getBookCategories={() => ['小説', '技術書', 'ビジネス', '自己啓発', 'その他']}
                loading={false}
                loadBooks={loadBooks}
                handleCreateBook={handleCreateBook}
                handleUpdateBook={handleUpdateBook}
                handleEditBook={handleEditBook}
                handleDeleteBook={handleDeleteBook}
                handleBookCategoryChange={handleBookCategoryChange}
                getReadingProgress={getReadingProgress}
              />
            );
          } else if (feature.id === "memos" && showMemos) {
            return (
              <MemosComponent
                key={feature.id}
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
                handleReplySubmit={() => {}}
                handleReplyCancel={() => {}}
                handleEditReply={() => {}}
                handleSaveEditReply={() => {}}
                handleDeleteReply={() => {}}
                handleCancelEditReply={() => {}}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                replyingToMemo={replyingToMemo}
                setReplyingToMemo={setReplyingToMemo}
              />
            );
          } else if (feature.id === "reports" && showReports) {
            return (
              <ReportsComponent
                key={feature.id}
                showReports={showReports}
                setShowReports={setShowReports}
                closeOtherFeatures={closeOtherFeatures}
                incomeExpenseRecords={[]}
                workDiaries={[]}
                reportsLoading={false}
                reportSummary={reportSummary}
                loadReportSummary={loadReportSummary}
              />
            );
          } else if (feature.id === "admin-panel" && showAdminPanel) {
            return (
              <AdminPanelComponent
                key={feature.id}
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
            );
          } else if (feature.id === "timers" && showTimers) {
            return (
              <TimersComponent
                key={feature.id}
                showTimers={showTimers}
                setShowTimers={setShowTimers}
                closeOtherFeatures={closeOtherFeatures}
              />
            );
          } else if (feature.id === "egg-timer" && showEggTimer) {
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
                getTotalCookingTime={(type: 'soft' | 'medium' | 'hard') => getEggTimerDuration(type)}
                formatTime={formatTime}
                playBellSound={playBellSound}
                playChimeSound={playChimeSound}
                playBeepSound={playBeepSound}
                playAlarmSound={playAlarmSound}
                timerSettings={timerSettings}
              />
            );
          } else if (feature.id === "public-memos" && showPublicMemos) {
            return (
              <PublicMemosComponent
                key={feature.id}
                showPublicMemos={showPublicMemos}
                setShowPublicMemos={setShowPublicMemos}
                closeOtherFeatures={closeOtherFeatures}
                publicMemos={publicMemos}
                publicMemosLoading={false}
                user={user}
                loadPublicMemos={loadPublicMemos}
                handleReplySubmit={() => {}}
                handleReplyCancel={() => {}}
                handleEditReply={() => {}}
                handleSaveEditReply={() => {}}
                handleDeleteReply={() => {}}
                handleCancelEditReply={() => {}}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
              />
            );
          } else if (feature.id === "work-records" && showWorkRecords) {
            return (
              <WorkRecordsComponent
                key={feature.id}
                showWorkRecords={showWorkRecords}
                setShowWorkRecords={setShowWorkRecords}
                closeOtherFeatures={closeOtherFeatures}
                incomeExpenseRecords={[]}
                workDiaries={[]}
                incomeExpenseLoading={false}
                diaryLoading={false}
                workRecordsLoading={false}
                showIncomeExpenseForm={showIncomeExpenseForm}
                setShowIncomeExpenseForm={setShowIncomeExpenseForm}
                showDiaryForm={showDiaryForm}
                setShowDiaryForm={setShowDiaryForm}
                editingIncomeExpenseRecord={editingIncomeExpenseRecord}
                setEditingIncomeExpenseRecord={setEditingIncomeExpenseRecord}
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
                handleCreateIncomeExpenseRecord={handleCreateIncomeExpenseRecord}
                handleCreateDiary={handleCreateDiary}
                handleUpdateIncomeExpenseRecord={handleUpdateIncomeExpenseRecord}
                handleUpdateDiary={handleUpdateDiary}
                handleDeleteIncomeExpenseRecord={handleDeleteIncomeExpenseRecord}
                handleDeleteDiary={handleDeleteDiary}
                editDiary={() => {}}
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
            );
          } else if (feature.id === "sound-app" && showSoundApp) {
            return (
              <SoundAppComponent
                key={feature.id}
                showSoundApp={showSoundApp}
                setShowSoundApp={setShowSoundApp}
                closeOtherFeatures={closeOtherFeatures}
              />
            );
          }
          return null;
        })}

        {showNotifications && (
          <NotificationComponent />
        )}

        {showVersionInfo && (
          <VersionInfo />
        )}

        {showThemeSettings && (
          <div className="theme-settings-modal">
            <div className="modal-overlay" onClick={() => setShowThemeSettings(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                      {availableThemes.find((t) => t.value === selectedTheme)?.preview}{" "}
                      {availableThemes.find((t) => t.value === selectedTheme)?.label}
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
            <div className="modal-overlay" onClick={() => setShowFontSettings(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
          </div>
        )}

        {showFeatureSettings && (
          <div className="feature-settings-modal">
            <div className="modal-overlay" onClick={() => setShowFeatureSettings(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                      {getVisibleFeaturesList().map((feature) => (
                        <div key={feature.id} className="feature-item">
                          <div className="feature-item-content">
                            <div className="feature-info">
                              <div className="feature-name">{feature.name}</div>
                              <div className="feature-description">
                                {feature.description}
                              </div>
                            </div>
                          </div>
                          <div className="feature-controls">
                            <div className="feature-toggle">
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={true} // 簡易実装：すべて有効
                                  onChange={() => {
                                    // 簡易実装：機能の切り替えは今後実装
                                    console.log(`Toggle feature: ${feature.id}`);
                                  }}
                                  aria-label={`${feature.name}の表示/非表示を切り替え`}
                                />
                                <span className="toggle-slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
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

      </main>

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
      </div>
    </>
  );
};

export default MainLayout;
