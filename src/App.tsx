import React from "react";
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
  // カスタムフックの使用
  const auth = useAuth();
  const errorHandling = useErrorHandling();
  const dataFetching = useDataFetching(auth.isLoggedIn, auth.user);
  const uiState = useUIState();

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

  // エラーレポートコールバックの設定
  React.useEffect(() => {
    setErrorReportCallback(errorHandling.handleApiErrorReport);
  }, [errorHandling.handleApiErrorReport]);

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
