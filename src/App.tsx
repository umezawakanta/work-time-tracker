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

  // データローディング関数
  const loadProjects = async () => {
    console.log('App.tsx - Loading projects');
    try {
      // プロジェクトデータの読み込み
      // const response = await fetch('/api/projects');
      // const data = await response.json();
      // setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTimeEntries = async () => {
    console.log('App.tsx - Loading time entries');
    // 時間記録データの読み込み
  };

  const loadBooks = async () => {
    console.log('App.tsx - Loading books');
    try {
      // 本のデータの読み込み
      // const response = await fetch('/api/books');
      // const data = await response.json();
      // setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
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
    try {
      // 公開メモデータの読み込み
      // const response = await fetch('/api/memos/public');
      // const data = await response.json();
      // setPublicMemos(data);
    } catch (error) {
      console.error('Failed to load public memos:', error);
    }
  };

  const loadAdminUsers = async () => {
    console.log('App.tsx - Loading admin users');
    try {
      // 管理者ユーザーデータの読み込み
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      // setAdminUsers(data);
    } catch (error) {
      console.error('Failed to load admin users:', error);
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
    // 時間記録開始処理
  };

  const handleStopTracking = () => {
    console.log('App.tsx - Stopping time tracking');
    // 時間記録停止処理
  };

  const handleResetTracking = () => {
    console.log('App.tsx - Resetting time tracking');
    // 時間記録リセット処理
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
      showBugReportModal={errorHandling.showBugReportModal}
      showUpdateRequestModal={errorHandling.showUpdateRequestModal}
      setShowCharacterHome={uiState.setShowCharacterHome}
      setShowProjects={uiState.setShowProjects}
      setShowCookingTimer={uiState.setShowCookingTimer}
      setShowSelfAnalysis={uiState.setShowSelfAnalysis}
      setShowBookshelf={uiState.setShowBookshelf}
      setShowMemos={uiState.setShowMemos}
      setShowReports={uiState.setShowReports}
      setShowAdminPanel={uiState.setShowAdminPanel}
      setShowTimeTracking={uiState.setShowTimeTracking}
      setShowTimers={uiState.setShowTimers}
      setShowPublicMemos={uiState.setShowPublicMemos}
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
      handleStartTracking={handleStartTracking}
      handleStopTracking={handleStopTracking}
      handleResetTracking={handleResetTracking}
      loadUserSettings={loadUserSettings}
      getVisibleFeatures={getVisibleFeatures}
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
