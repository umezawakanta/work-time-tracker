import React, { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import HeaderComponent from "./components/HeaderComponent";
import TimeTrackingComponent from "./components/TimeTrackingComponent";
import CookingTimerSection from "./components/CookingTimerSection";
import ProjectsSection from "./components/ProjectsSection";
import SelfAnalysisComponent from "./components/SelfAnalysisComponent";
import BookshelfComponent from "./components/BookshelfComponent";
import MemosComponent from "./components/MemosComponent";
import ReportsComponent from "./components/ReportsComponent";
import AdminPanelComponent from "./components/AdminPanelComponent";
import TimersComponent from "./components/TimersComponent";
import PublicMemosComponent from "./components/PublicMemosComponent";
import WorkRecordsComponent from "./components/WorkRecordsComponent";
import SoundAppComponent from "./components/SoundAppComponent";
import NotificationComponent from "./components/NotificationComponent";
import VersionInfo from "./components/VersionInfo";
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
  // エラーハンドリングの追加
  const [appError, setAppError] = useState<Error | null>(null);

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

  // 追加の状態管理（バックアップファイルから復元）
  const [projects, setProjects] = useState<Project[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [incomeExpenseRecords, setIncomeExpenseRecords] = useState<IncomeExpenseRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [reportSummary, setReportSummary] = useState<any>({});

  // プロジェクト関連の状態
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#007bff");

  // 本棚関連の状態
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

  // メモ関連の状態
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoTags, setMemoTags] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [memoIsFamilyOnly, setMemoIsFamilyOnly] = useState(false);
  const [memoIsAdminOnly, setMemoIsAdminOnly] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // 管理者関連の状態
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);

  // 料理タイマー関連の状態
  const [selectedRecipe, setSelectedRecipe] = useState("boiled-egg");
  const [selectedEggType, setSelectedEggType] = useState<"soft" | "medium" | "hard">("medium");
  const [eggTimerActive, setEggTimerActive] = useState(false);
  const [eggTimerPaused, setEggTimerPaused] = useState(false);
  const [eggTimerTime, setEggTimerTime] = useState(0);
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = useState(0);
  const [eggTimerPhase, setEggTimerPhase] = useState<"heating" | "boiling" | "cooking">("heating");
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = useState(0);
  const [eggTimerPhaseName, setEggTimerPhaseName] = useState("");
  const [eggTimerSound, setEggTimerSound] = useState<"bell" | "chime" | "beep" | "alarm">("bell");
  const [eggTimerInterval, setEggTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [message, setMessage] = useState("");

  // カスタムタイマー関連の状態
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerTime, setCustomTimerTime] = useState(0);
  const [customTimerInterval, setCustomTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerName, setCustomTimerName] = useState("");
  const [customTimerSound, setCustomTimerSound] = useState<"bell" | "chime" | "beep" | "alarm">("bell");
  const [customTimerOriginalTime, setCustomTimerOriginalTime] = useState(0);

  // タイマープリセット関連の状態
  const [timerPresets, setTimerPresets] = useState([
    { id: 1, name: "ポモドーロ", minutes: 25, seconds: 0 },
    { id: 2, name: "短休憩", minutes: 5, seconds: 0 },
    { id: 3, name: "長休憩", minutes: 15, seconds: 0 },
    { id: 4, name: "集中作業", minutes: 45, seconds: 0 },
  ]);

  const [timerHistory, setTimerHistory] = useState<Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: string;
    type: "custom" | "egg" | "preset";
  }>>([]);

  // キャラクター関連の状態
  const [currentCharacter, setCurrentCharacter] = useState<any>(null);

  // その他の状態
  const [isTimeTrackingActive, setIsTimeTrackingActive] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);

  // エラーキャッチ用のuseEffect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('App.tsx - Global error caught:', event.error);
      console.error('App.tsx - Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      setAppError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('App.tsx - Unhandled promise rejection:', event.reason);
      console.error('App.tsx - Rejection details:', {
        reason: event.reason,
        type: event.type,
        promise: event.promise
      });
      setAppError(new Error(`Unhandled promise rejection: ${event.reason}`));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 認証エラーの監視
  useEffect(() => {
    if (!auth.isCheckingAuth && !auth.isLoggedIn && !auth.loading) {
      console.log('App.tsx - User is not logged in, showing login form');
    }
  }, [auth.isCheckingAuth, auth.isLoggedIn, auth.loading]);

  // 認証状態の詳細ログ
  useEffect(() => {
    console.log('App.tsx - Authentication flow:', {
      isCheckingAuth: auth.isCheckingAuth,
      isLoggedIn: auth.isLoggedIn,
      hasUser: !!auth.user,
      loading: auth.loading,
      message: auth.message
    });
  }, [auth.isCheckingAuth, auth.isLoggedIn, auth.user, auth.loading, auth.message]);

  // デバッグログの追加
  React.useEffect(() => {
    console.log('App.tsx - Auth state:', {
      isLoggedIn: auth.isLoggedIn,
      isCheckingAuth: auth.isCheckingAuth,
      user: auth.user,
      loading: auth.loading,
      message: auth.message
    });
  }, [auth.isLoggedIn, auth.isCheckingAuth, auth.user, auth.loading, auth.message]);

  // エラーハンドリングの状態もログ出力
  React.useEffect(() => {
    console.log('App.tsx - Error handling state:', {
      showErrorModal: errorHandling.showErrorModal,
      currentError: errorHandling.currentError,
      showSimpleErrorModal: errorHandling.showSimpleErrorModal,
      showUpdateRequestModal: errorHandling.showUpdateRequestModal,
      showBugReportModal: errorHandling.showBugReportModal
    });
  }, [errorHandling.showErrorModal, errorHandling.currentError, errorHandling.showSimpleErrorModal, errorHandling.showUpdateRequestModal, errorHandling.showBugReportModal]);

  // UI状態もログ出力
  React.useEffect(() => {
    console.log('App.tsx - UI state:', {
      showCharacterHome: uiState.showCharacterHome,
      showProjects: uiState.showProjects,
      showCookingTimer: uiState.showCookingTimer,
      showSelfAnalysis: uiState.showSelfAnalysis,
      showBookshelf: uiState.showBookshelf,
      showMemos: uiState.showMemos,
      showReports: uiState.showReports,
      showAdminPanel: uiState.showAdminPanel,
      showTimeTracking: uiState.showTimeTracking,
      showTimers: uiState.showTimers,
      showPublicMemos: uiState.showPublicMemos,
      showWorkRecords: uiState.showWorkRecords,
      showSoundApp: uiState.showSoundApp,
      showNotifications: uiState.showNotifications,
      showVersionInfo: uiState.showVersionInfo,
      showThemeSettings: uiState.showThemeSettings,
      showFontSettings: uiState.showFontSettings,
      showFeatureSettings: uiState.showFeatureSettings
    });
  }, [uiState]);

  // エラーレポートコールバックの設定
  React.useEffect(() => {
    console.log('App.tsx - Setting error report callback:', errorHandling.handleApiErrorReport);
    setErrorReportCallback(errorHandling.handleApiErrorReport);
  }, [errorHandling.handleApiErrorReport]);

  // 更新要望のハンドラー
  const handleUpdateRequest = async (updateRequest: { title: string; content: string; priority: string; category: string }) => {
    console.log('App.tsx - Update request submitted:', updateRequest);
    // ここで更新要望をAPIに送信する処理を実装
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
    // ここで不具合報告をAPIに送信する処理を実装
    try {
      // API呼び出しの実装
      console.log('Bug report sent successfully');
    } catch (error) {
      console.error('Failed to send bug report:', error);
    }
  };

  // データローディング関数
  const loadProjects = async () => {
    console.log('App.tsx - Loading projects');
    setProjectsLoading(true);
    try {
      // プロジェクトデータの読み込み
      // const response = await fetch('/api/projects');
      // const data = await response.json();
      // setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadTimeEntries = async () => {
    console.log('App.tsx - Loading time entries');
    // 時間記録データの読み込み
  };

  const loadBooks = async () => {
    console.log('App.tsx - Loading books');
    setBooksLoading(true);
    try {
      // 本のデータの読み込み
      // const response = await fetch('/api/books');
      // const data = await response.json();
      // setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  const loadMemos = async () => {
    console.log('App.tsx - Loading memos');
    try {
      // メモデータの読み込み
      // const response = await fetch('/api/memos');
      // const data = await response.json();
      // setMemos(data);
    } catch (error) {
      console.error('Failed to load memos:', error);
    }
  };

  const loadPublicMemos = async () => {
    console.log('App.tsx - Loading public memos');
    setPublicMemosLoading(true);
    try {
      // 公開メモデータの読み込み
      // const response = await fetch('/api/memos/public');
      // const data = await response.json();
      // setPublicMemos(data);
    } catch (error) {
      console.error('Failed to load public memos:', error);
    } finally {
      setPublicMemosLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    console.log('App.tsx - Loading admin users');
    setAdminUsersLoading(true);
    try {
      // 管理者ユーザーデータの読み込み
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      // setAdminUsers(data);
    } catch (error) {
      console.error('Failed to load admin users:', error);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadReportSummary = async () => {
    console.log('App.tsx - Loading report summary');
    try {
      // レポートサマリーデータの読み込み
      // const response = await fetch('/api/reports/summary');
      // const data = await response.json();
      // setReportSummary(data);
    } catch (error) {
      console.error('Failed to load report summary:', error);
    }
  };

  // 時間記録ハンドラー
  const handleStartTracking = () => {
    console.log('App.tsx - Starting time tracking');
    setIsTimeTrackingActive(true);
    // 時間記録開始処理
  };

  const handleStopTracking = () => {
    console.log('App.tsx - Stopping time tracking');
    setIsTimeTrackingActive(false);
    // 時間記録停止処理
  };

  const handleResetTracking = () => {
    console.log('App.tsx - Resetting time tracking');
    setIsTimeTrackingActive(false);
    // 時間記録リセット処理
  };

  // プロジェクト関連のハンドラー
  const handleCreateProject = async () => {
    console.log('App.tsx - Creating project');
    try {
      // プロジェクト作成処理
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: projectName,
      //     description: projectDescription,
      //     color: projectColor
      //   })
      // });
      // const newProject = await response.json();
      // setProjects([...projects, newProject]);
      setShowProjectForm(false);
      setProjectName("");
      setProjectDescription("");
      setProjectColor("#007bff");
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // 本棚関連のハンドラー
  const handleCreateBook = async () => {
    console.log('App.tsx - Creating book');
    try {
      // 本の作成処理
      // const response = await fetch('/api/books', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: bookTitle,
      //     author: bookAuthor,
      //     isbn: bookIsbn,
      //     publishedYear: bookPublishedYear,
      //     totalPages: bookTotalPages,
      //     category: bookCategory,
      //     notes: bookNotes
      //   })
      // });
      // const newBook = await response.json();
      // setBooks([...books, newBook]);
      setShowBookForm(false);
      setBookTitle("");
      setBookAuthor("");
      setBookIsbn("");
      setBookPublishedYear(new Date().getFullYear());
      setBookTotalPages(0);
      setBookCategory("");
      setBookNotes("");
    } catch (error) {
      console.error('Failed to create book:', error);
    }
  };

  const handleUpdateBook = async () => {
    console.log('App.tsx - Updating book');
    // 本の更新処理
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

  const handleDeleteBook = async (bookId: string) => {
    console.log('App.tsx - Deleting book');
    try {
      // 本の削除処理
      // await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      // setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const handleBookCategoryChange = (category: string) => {
    setSelectedBookCategory(category);
  };

  const getBookCategories = () => {
    return ['小説', '技術書', 'ビジネス', '自己啓発', 'その他'];
  };

  const getReadingProgress = (book: Book & { currentPage?: number }) => {
    return book.currentPage ? (book.currentPage / book.totalPages) * 100 : 0;
  };

  // メモ関連のハンドラー
  const handleCreateMemo = async () => {
    console.log('App.tsx - Creating memo');
    try {
      // メモ作成処理
      // const response = await fetch('/api/memos', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title: memoTitle,
      //     content: memoContent,
      //     category: memoCategory,
      //     tags: memoTags,
      //     isPublic: memoIsPublic,
      //     isFamilyOnly: memoIsFamilyOnly,
      //     isAdminOnly: memoIsAdminOnly
      //   })
      // });
      // const newMemo = await response.json();
      // setMemos([...memos, newMemo]);
      setMemoTitle("");
      setMemoContent("");
      setMemoCategory("");
      setMemoTags("");
      setMemoIsPublic(false);
      setMemoIsFamilyOnly(false);
      setMemoIsAdminOnly(false);
    } catch (error) {
      console.error('Failed to create memo:', error);
    }
  };

  const handleUpdateMemo = async () => {
    console.log('App.tsx - Updating memo');
    // メモ更新処理
  };

  const handleDeleteMemo = async (memoId: string) => {
    console.log('App.tsx - Deleting memo');
    try {
      // メモ削除処理
      // await fetch(`/api/memos/${memoId}`, { method: 'DELETE' });
      // setMemos(memos.filter(memo => memo.id !== memoId));
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  };

  // 管理者関連のハンドラー
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    console.log('App.tsx - Updating user');
    // ユーザー更新処理
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('App.tsx - Deleting user');
    try {
      // ユーザー削除処理
      // await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      // setAdminUsers(adminUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // 料理タイマー関連のハンドラー
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon });
    }
  };

  const startSoundLoop = (soundType: "bell" | "chime" | "beep" | "alarm") => {
    console.log(`Starting sound loop: ${soundType}`);
  };

  const addToTimerHistory = (name: string, duration: number, type: "custom" | "egg" | "preset") => {
    const newEntry = {
      id: Date.now().toString(),
      name,
      duration,
      completedAt: new Date().toISOString(),
      type
    };
    setTimerHistory([newEntry, ...timerHistory]);
  };

  const playEggTimerSound = async () => {
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

  // その他のハンドラー
  const handleCharacterHomeToggle = () => {
    uiState.closeOtherFeatures('character-home');
    uiState.setShowCharacterHome(true);
  };

  const handleLogout = () => {
    console.log('App.tsx - Logout button clicked');
    localStorage.removeItem('access_token');
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  // ユーザー設定の読み込み
  const loadUserSettings = async () => {
    console.log('App.tsx - Loading user settings');
    // ユーザー設定の読み込み
  };

  // 機能の定義
  const features: Feature[] = [
    {
      id: "time-tracking",
      name: "時間管理",
      description: "作業時間の記録と管理",
      component: null,
      icon: "⏰",
      category: "productivity",
      isPopular: true
    },
    {
      id: "cooking-timer",
      name: "料理タイマー",
      description: "ゆでたまごタイマーなど料理用タイマー",
      component: null,
      icon: "🍳",
      category: "lifestyle"
    },
    {
      id: "projects",
      name: "プロジェクト",
      description: "プロジェクト管理",
      component: null,
      icon: "📋",
      category: "productivity"
    },
    {
      id: "self-analysis",
      name: "じぶん図鑑",
      description: "自己分析と目標管理",
      component: null,
      icon: "📊",
      category: "personal",
      isPopular: true
    },
    {
      id: "bookshelf",
      name: "本棚",
      description: "読書管理と記録",
      component: null,
      icon: "📚",
      category: "learning"
    },
    {
      id: "memos",
      name: "メモ",
      description: "個人メモの管理",
      component: null,
      icon: "📝",
      category: "productivity"
    },
    {
      id: "reports",
      name: "レポート",
      description: "収支記録と日記",
      component: null,
      icon: "📈",
      category: "finance"
    },
    {
      id: "admin-panel",
      name: "管理パネル",
      description: "システム管理機能",
      component: null,
      icon: "⚙️",
      category: "admin"
    },
    {
      id: "timers",
      name: "タイマー",
      description: "カスタムタイマー機能",
      component: null,
      icon: "⏲️",
      category: "productivity"
    },
    {
      id: "public-memos",
      name: "公開メモ",
      description: "公開メモの閲覧と投稿",
      component: null,
      icon: "🌐",
      category: "social"
    },
    {
      id: "work-records",
      name: "勤務記録",
      description: "勤務時間と収支管理",
      component: null,
      icon: "💼",
      category: "work"
    },
    {
      id: "sound-app",
      name: "サウンドアプリ",
      description: "音声再生と管理",
      component: null,
      icon: "🎵",
      category: "entertainment"
    }
  ];

  // ユーザー設定の取得（簡易版）
  const userSettings = {
    featureOrder: features.map(f => f.id),
    hiddenFeatures: [] as string[]
  };

  // 機能の順序を取得
  const getFeatureOrder = () => {
    if (!userSettings) {
      return features.map((f) => f.id);
    }
    return userSettings.featureOrder || features.map((f) => f.id);
  };

  // 表示する機能を取得
  const getVisibleFeatures = () => {
    const order = getFeatureOrder();
    let hiddenFeatures = userSettings?.hiddenFeatures || [];

    // 「じぶん図鑑」が隠されている場合は表示に戻す
    if ((hiddenFeatures || []).includes("self-analysis")) {
      hiddenFeatures = (hiddenFeatures || []).filter((id) => id !== "self-analysis");
    }

    return (order || [])
      .filter((id) => !(hiddenFeatures || []).includes(id))
      .map((id) => features.find((f) => f.id === id))
      .filter(Boolean) as Feature[];
  };

  // アプリエラーが発生した場合
  if (appError) {
    return (
      <div className="error-container">
        <h2>アプリケーションエラーが発生しました</h2>
        <p>エラー詳細: {appError.message}</p>
        <button onClick={() => window.location.reload()}>
          ページを再読み込み
        </button>
      </div>
    );
  }

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
    console.log('App.tsx - Rendering login form');
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
      </div>
    );
  }

  // ログイン済みの場合はメインレイアウトを表示
  return (
    <div className="app">
      <div className="dashboard">
        <HeaderComponent
          user={auth.user}
          isLoggedIn={auth.isLoggedIn}
          onShowCharacterHome={() => uiState.closeOtherFeatures('character-home')}
          onShowProjects={() => uiState.closeOtherFeatures('projects')}
          onShowCookingTimer={() => uiState.closeOtherFeatures('cooking-timer')}
          onShowSelfAnalysis={() => uiState.closeOtherFeatures('self-analysis')}
          onShowBookshelf={() => uiState.closeOtherFeatures('bookshelf')}
          onShowMemos={() => uiState.closeOtherFeatures('memos')}
          onShowReports={() => uiState.closeOtherFeatures('reports')}
          onShowAdminPanel={() => uiState.closeOtherFeatures('admin-panel')}
          onShowTimeTracking={() => uiState.closeOtherFeatures('time-tracking')}
          onShowTimers={() => uiState.closeOtherFeatures('timers')}
          onShowPublicMemos={() => uiState.closeOtherFeatures('public-memos')}
          onShowWorkRecords={() => uiState.closeOtherFeatures('work-records')}
          onShowSoundApp={() => uiState.closeOtherFeatures('sound-app')}
          onShowNotifications={() => uiState.closeOtherFeatures('notifications')}
          onShowVersionInfo={() => uiState.closeOtherFeatures('version-info')}
          currentCharacter={currentCharacter}
          showThemeSettings={uiState.showThemeSettings}
          showFontSettings={uiState.showFontSettings}
          showFeatureSettings={uiState.showFeatureSettings}
          handleCharacterHomeToggle={handleCharacterHomeToggle}
          handleLogout={handleLogout}
          closeOtherFeatures={uiState.closeOtherFeatures}
          setShowThemeSettings={uiState.setShowThemeSettings}
          setShowFontSettings={uiState.setShowFontSettings}
          setShowFeatureSettings={uiState.setShowFeatureSettings}
          loadUserSettings={loadUserSettings}
          isTimeTrackingActive={isTimeTrackingActive}
          onUpdateRequestClick={() => uiState.setShowUpdateRequestModal(true)}
          onBugReportClick={() => uiState.setShowBugReportModal(true)}
        />

        {/* 通知コンポーネント */}
        <div className="notification-wrapper">
          <NotificationComponent 
            onNavigateToMemo={(memoId: string) => {
              // メモセクションを表示
              uiState.setShowMemos(true);
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
        {getVisibleFeatures().map((feature) => {
          if (feature.id === "time-tracking") {
            return (
              <TimeTrackingComponent
                key={feature.id}
                showTimeTracking={uiState.showTimeTracking}
                setShowTimeTracking={uiState.setShowTimeTracking}
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
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "cooking-timer") {
            return (
              <CookingTimerSection
                key={feature.id}
                showCookingTimer={uiState.showCookingTimer}
                setShowCookingTimer={uiState.setShowCookingTimer}
                closeOtherFeatures={uiState.closeOtherFeatures}
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
                selectedEggType={selectedEggType}
                setSelectedEggType={setSelectedEggType}
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
                eggTimerType={selectedEggType}
              />
            );
          } else if (feature.id === "projects") {
            return (
              <ProjectsSection
                key={feature.id}
                showProjects={uiState.showProjects}
                setShowProjects={uiState.setShowProjects}
                closeOtherFeatures={uiState.closeOtherFeatures}
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
                loading={false}
                handleCreateProject={handleCreateProject}
                loadProjects={loadProjects}
              />
            );
          } else if (feature.id === "self-analysis") {
            return (
              <SelfAnalysisComponent
                key={feature.id}
                showSelfAnalysis={uiState.showSelfAnalysis}
                setShowSelfAnalysis={uiState.setShowSelfAnalysis}
                selfAnalysisTab="profile"
                setSelfAnalysisTab={() => {}}
                personalProfile={{
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
                }}
                setPersonalProfile={() => {}}
                habits={[]}
                setHabits={() => {}}
                habitHistory={{}}
                setHabitHistory={() => {}}
                habitStreak={{}}
                setHabitStreak={() => {}}
                moodLogs={[]}
                setMoodLogs={() => {}}
                goals={[]}
                setGoals={() => {}}
                learningRecords={[]}
                setLearningRecords={() => {}}
                timeEntries={[]}
                calculateTimeBreakdown={() => ({})}
                calculateProductivityTrend={() => []}
                calculateProductivityStats={() => ({
                  averageHours: 0,
                  maxHours: 0,
                  totalHours: 0,
                  productiveDays: 0,
                  productivityRate: 0
                })}
                loadTimeEntries={() => {}}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "bookshelf") {
            return (
              <BookshelfComponent
                key={feature.id}
                showBookshelf={uiState.showBookshelf}
                setShowBookshelf={uiState.setShowBookshelf}
                closeOtherFeatures={uiState.closeOtherFeatures}
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
                getBookCategories={getBookCategories}
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
          } else if (feature.id === "memos") {
            return (
              <MemosComponent
                key={feature.id}
                showMemos={uiState.showMemos}
                setShowMemos={uiState.setShowMemos}
                closeOtherFeatures={uiState.closeOtherFeatures}
                memos={memos}
                publicMemos={publicMemos}
                memosLoading={false}
                customCategories={customCategories}
                setCustomCategories={setCustomCategories}
                loadMemos={loadMemos}
                handleDeleteMemo={handleDeleteMemo}
                user={auth.user}
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
                handleReplySubmit={() => {}}
                handleReplyCancel={() => {}}
                handleEditReply={() => {}}
                handleSaveEditReply={() => {}}
                handleDeleteReply={() => {}}
                handleCancelEditReply={() => {}}
                replyContent=""
                setReplyContent={() => {}}
                replyingToMemo={null}
                setReplyingToMemo={() => {}}
              />
            );
          } else if (feature.id === "reports") {
            return (
              <ReportsComponent
                key={feature.id}
                showReports={uiState.showReports}
                setShowReports={uiState.setShowReports}
                incomeExpenseRecords={incomeExpenseRecords}
                workDiaries={workDiaries}
                reportsLoading={loadingState.reportsLoading}
                reportSummary={reportSummary}
                loadReportSummary={loadReportSummary}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "admin-panel" && auth.user?.role === "admin") {
            return (
              <AdminPanelComponent
                key={feature.id}
                showAdminPanel={uiState.showAdminPanel}
                setShowAdminPanel={uiState.setShowAdminPanel}
                adminUsers={adminUsers}
                adminUsersLoading={adminUsersLoading}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                loadAdminUsers={loadAdminUsers}
                handleEditUser={handleEditUser}
                handleUpdateUser={handleUpdateUser}
                handleDeleteUser={handleDeleteUser}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "timers") {
            return (
              <TimersComponent
                key={feature.id}
                showTimers={uiState.showTimers}
                setShowTimers={uiState.setShowTimers}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "public-memos") {
            return (
              <PublicMemosComponent
                key={feature.id}
                showPublicMemos={uiState.showPublicMemos}
                setShowPublicMemos={uiState.setShowPublicMemos}
                closeOtherFeatures={uiState.closeOtherFeatures}
                publicMemos={publicMemos}
                publicMemosLoading={publicMemosLoading}
                user={auth.user}
                loadPublicMemos={loadPublicMemos}
                handleReplySubmit={() => {}}
                handleReplyCancel={() => {}}
                handleEditReply={() => {}}
                handleSaveEditReply={() => {}}
                handleDeleteReply={() => {}}
                handleCancelEditReply={() => {}}
                replyContent=""
                setReplyContent={() => {}}
              />
            );
          } else if (feature.id === "work-records") {
            return (
              <WorkRecordsComponent
                key={feature.id}
                showWorkRecords={uiState.showWorkRecords}
                setShowWorkRecords={uiState.setShowWorkRecords}
                showIncomeExpenseForm={false}
                setShowIncomeExpenseForm={() => {}}
                showDiaryForm={false}
                setShowDiaryForm={() => {}}
                incomeExpenseRecords={incomeExpenseRecords}
                workDiaries={workDiaries}
                incomeExpenseLoading={false}
                diaryLoading={false}
                workRecordsLoading={false}
                incomeExpenseForm={{
                  id: "",
                  date: "",
                  type: "income",
                  amount: 0,
                  category: "",
                  description: "",
                  createdAt: "",
                  updatedAt: ""
                }}
                setIncomeExpenseForm={() => {}}
                diaryForm={{
                  id: "",
                  date: "",
                  title: "",
                  content: "",
                  mood: "neutral",
                  weather: "",
                  tags: [],
                  createdAt: "",
                  updatedAt: ""
                }}
                setDiaryForm={() => {}}
                workRecordForm={{
                  id: "",
                  date: "",
                  startTime: "",
                  endTime: "",
                  breakTime: 0,
                  workTime: 0,
                  hourlyWage: 0,
                  dailyWage: 0,
                  notes: "",
                  createdAt: "",
                  updatedAt: ""
                }}
                setWorkRecordForm={() => {}}
                editingIncomeExpense={null}
                setEditingIncomeExpense={() => {}}
                editingDiary={null}
                setEditingDiary={() => {}}
                editingWorkRecord={null}
                setEditingWorkRecord={() => {}}
                selectedDate={new Date()}
                setSelectedDate={() => {}}
                selectedMonth={new Date().getMonth()}
                setSelectedMonth={() => {}}
                selectedYear={new Date().getFullYear()}
                setSelectedYear={() => {}}
                viewMode="calendar"
                setViewMode={() => {}}
                filterCategory="all"
                setFilterCategory={() => {}}
                searchQuery=""
                setSearchQuery={() => {}}
                sortBy="date"
                setSortBy={() => {}}
                sortOrder="desc"
                setSortOrder={() => {}}
                handleCreateIncomeExpense={() => {}}
                handleUpdateIncomeExpense={() => {}}
                handleDeleteIncomeExpense={() => {}}
                handleEditIncomeExpense={() => {}}
                handleCreateDiary={() => {}}
                handleUpdateDiary={() => {}}
                handleDeleteDiary={() => {}}
                handleEditDiary={() => {}}
                handleCreateWorkRecord={() => {}}
                handleUpdateWorkRecord={() => {}}
                handleDeleteWorkRecord={() => {}}
                handleEditWorkRecord={() => {}}
                loadIncomeExpenseRecords={() => {}}
                loadWorkDiaries={() => {}}
                loadWorkRecords={() => {}}
                getTotalIncome={() => 0}
                getTotalExpense={() => 0}
                getNetIncome={() => 0}
                getMonthlyStats={() => ({ income: 0, expense: 0, net: 0 })}
                getCategoryStats={() => ({})}
                exportToCSV={() => {}}
                exportToPDF={() => {}}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          } else if (feature.id === "sound-app") {
            return (
              <SoundAppComponent
                key={feature.id}
                showSoundApp={uiState.showSoundApp}
                setShowSoundApp={uiState.setShowSoundApp}
                closeOtherFeatures={uiState.closeOtherFeatures}
              />
            );
          }
          return null;
        })}

        {uiState.showNotifications && (
          <NotificationComponent />
        )}

        {uiState.showVersionInfo && (
          <VersionInfo />
        )}
      </main>

      {/* エラーモーダル */}
      {errorHandling.showErrorModal && errorHandling.currentError && (
        <SimpleErrorReportingModal
          isOpen={errorHandling.showErrorModal}
          onClose={() => errorHandling.setShowErrorModal(false)}
          onSubmit={errorHandling.handleSimpleErrorReport}
        />
      )}

      {/* 更新要望モーダル */}
      {errorHandling.showUpdateRequestModal && (
        <UpdateRequestModal
          isOpen={errorHandling.showUpdateRequestModal}
          onClose={() => errorHandling.setShowUpdateRequestModal(false)}
          onSubmit={errorHandling.handleUpdateRequest}
        />
      )}

      {/* 不具合報告モーダル */}
      {errorHandling.showBugReportModal && (
        <BugReportModal
          isOpen={errorHandling.showBugReportModal}
          onClose={() => errorHandling.setShowBugReportModal(false)}
          onSubmit={errorHandling.handleBugReport}
        />
      )}
    </div>
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
