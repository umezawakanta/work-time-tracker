import React, { useState, useEffect } from "react";
import "./App.css";
import LoginForm from "./components/LoginForm";
import MainLayout from "./components/MainLayout";
import { useAuth } from "./hooks/useAuth";
import { useErrorHandling } from "./hooks/useErrorHandling";
import { useDataFetching } from "./hooks/useDataFetching";
import { useUIState } from "./hooks/useUIState";
import { LoadingStateProvider } from "./components/LoadingStateManager";
import { TimeTrackingStateProvider } from "./components/TimeTrackingStateManager";
import { TimerPresetProvider } from "./components/TimerPresetManager";
import { MoodLogProvider } from "./components/MoodLogManager";
import SimpleErrorReportingModal from "./components/SimpleErrorReportingModal";
import UpdateRequestModal from "./components/UpdateRequestModal";
import BugReportModal from "./components/BugReportModal";
import { setErrorReportCallback } from "./utils/apiClient";

function App() {
  // エラーハンドリングの追加
  const [appError, setAppError] = useState<Error | null>(null);

  // カスタムフックの使用
  const auth = useAuth();
  const errorHandling = useErrorHandling();
  const dataFetching = useDataFetching(auth.isLoggedIn, auth.user);
  const uiState = useUIState();

  // エラーキャッチ用のuseEffect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('App.tsx - Global error caught:', event.error);
      setAppError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('App.tsx - Unhandled promise rejection:', event.reason);
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
      showVersionInfo: uiState.showVersionInfo
    });
  }, [uiState]);

  // エラーレポートコールバックの設定
  React.useEffect(() => {
    setErrorReportCallback(errorHandling.handleApiErrorReport);
  }, [errorHandling.handleApiErrorReport]);

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
        closeOtherFeatures={uiState.closeOtherFeatures}
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
