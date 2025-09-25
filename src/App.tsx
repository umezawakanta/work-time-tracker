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
    // プロジェクトデータの読み込み
  };

  const loadTimeEntries = async () => {
    console.log('App.tsx - Loading time entries');
    // 時間記録データの読み込み
  };

  const loadBooks = async () => {
    console.log('App.tsx - Loading books');
    // 本のデータの読み込み
  };

  const loadMemos = async () => {
    console.log('App.tsx - Loading memos');
    // メモデータの読み込み
  };

  const loadPublicMemos = async () => {
    console.log('App.tsx - Loading public memos');
    // 公開メモデータの読み込み
  };

  const loadAdminUsers = async () => {
    console.log('App.tsx - Loading admin users');
    // 管理者ユーザーデータの読み込み
  };

  const loadReportSummary = async () => {
    console.log('App.tsx - Loading report summary');
    // レポートサマリーデータの読み込み
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
        showBugReportModal={uiState.showBugReportModal}
        showUpdateRequestModal={uiState.showUpdateRequestModal}
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
        setShowBugReportModal={uiState.setShowBugReportModal}
        setShowUpdateRequestModal={uiState.setShowUpdateRequestModal}
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
