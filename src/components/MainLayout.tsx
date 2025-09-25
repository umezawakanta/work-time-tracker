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
import TimeTrackingComponent from './TimeTrackingComponent';
import TimersComponent from './TimersComponent';
import PublicMemosComponent from './PublicMemosComponent';
import WorkRecordsComponent from './WorkRecordsComponent';
import SoundAppComponent from './SoundAppComponent';
import NotificationComponent from './NotificationComponent';
import VersionInfo from './VersionInfo';
import { User } from '../types';

interface MainLayoutProps {
  user: User | null;
  isLoggedIn: boolean;
  // UI状態
  showCharacterHome: boolean;
  showProjects: boolean;
  showCookingTimer: boolean;
  showSelfAnalysis: boolean;
  showBookshelf: boolean;
  showMemos: boolean;
  showReports: boolean;
  showAdminPanel: boolean;
  showTimeTracking: boolean;
  showTimers: boolean;
  showPublicMemos: boolean;
  showWorkRecords: boolean;
  showSoundApp: boolean;
  showNotifications: boolean;
  showVersionInfo: boolean;
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
  setShowTimers: (show: boolean) => void;
  setShowPublicMemos: (show: boolean) => void;
  setShowWorkRecords: (show: boolean) => void;
  setShowSoundApp: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setShowVersionInfo: (show: boolean) => void;
  // その他の関数
  closeOtherFeatures: (activeFeature: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
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
  setShowCharacterHome,
  setShowProjects,
  setShowCookingTimer,
  setShowSelfAnalysis,
  setShowBookshelf,
  setShowMemos,
  setShowReports,
  setShowAdminPanel,
  setShowTimeTracking,
  setShowTimers,
  setShowPublicMemos,
  setShowWorkRecords,
  setShowSoundApp,
  setShowNotifications,
  setShowVersionInfo,
  closeOtherFeatures,
}) => {
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
    });
  }, [user, isLoggedIn, showCharacterHome, showProjects, showCookingTimer, showSelfAnalysis, showBookshelf, showMemos, showReports, showAdminPanel, showTimeTracking, showTimers, showPublicMemos, showWorkRecords, showSoundApp, showNotifications, showVersionInfo]);
  return (
    <div className="app">
      <HeaderComponent
        user={user}
        isLoggedIn={isLoggedIn}
        onShowCharacterHome={() => {
          closeOtherFeatures('character-home');
          setShowCharacterHome(true);
        }}
        onShowProjects={() => {
          closeOtherFeatures('projects');
          setShowProjects(true);
        }}
        onShowCookingTimer={() => {
          closeOtherFeatures('cooking-timer');
          setShowCookingTimer(true);
        }}
        onShowSelfAnalysis={() => {
          closeOtherFeatures('self-analysis');
          setShowSelfAnalysis(true);
        }}
        onShowBookshelf={() => {
          closeOtherFeatures('bookshelf');
          setShowBookshelf(true);
        }}
        onShowMemos={() => {
          closeOtherFeatures('memos');
          setShowMemos(true);
        }}
        onShowReports={() => {
          closeOtherFeatures('reports');
          setShowReports(true);
        }}
        onShowAdminPanel={() => {
          closeOtherFeatures('admin-panel');
          setShowAdminPanel(true);
        }}
        onShowTimeTracking={() => {
          closeOtherFeatures('time-tracking');
          setShowTimeTracking(true);
        }}
        onShowTimers={() => {
          closeOtherFeatures('timers');
          setShowTimers(true);
        }}
        onShowPublicMemos={() => {
          closeOtherFeatures('public-memos');
          setShowPublicMemos(true);
        }}
        onShowWorkRecords={() => {
          closeOtherFeatures('work-records');
          setShowWorkRecords(true);
        }}
        onShowSoundApp={() => {
          closeOtherFeatures('sound-app');
          setShowSoundApp(true);
        }}
        onShowNotifications={() => {
          closeOtherFeatures('notifications');
          setShowNotifications(true);
        }}
        onShowVersionInfo={() => {
          closeOtherFeatures('version-info');
          setShowVersionInfo(true);
        }}
      />

      <main className="main-content">
        {showCharacterHome && (
          <CharacterHome
            showCharacterHome={showCharacterHome}
            setShowCharacterHome={setShowCharacterHome}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showProjects && (
          <ProjectsSection
            showProjects={showProjects}
            setShowProjects={setShowProjects}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showCookingTimer && (
          <CookingTimerSection
            showCookingTimer={showCookingTimer}
            setShowCookingTimer={setShowCookingTimer}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showSelfAnalysis && (
          <SelfAnalysisComponent
            showSelfAnalysis={showSelfAnalysis}
            setShowSelfAnalysis={setShowSelfAnalysis}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showBookshelf && (
          <BookshelfComponent
            showBookshelf={showBookshelf}
            setShowBookshelf={setShowBookshelf}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showMemos && (
          <MemosComponent
            showMemos={showMemos}
            setShowMemos={setShowMemos}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showReports && (
          <ReportsComponent
            showReports={showReports}
            setShowReports={setShowReports}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showAdminPanel && (
          <AdminPanelComponent
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showTimeTracking && (
          <TimeTrackingComponent
            showTimeTracking={showTimeTracking}
            setShowTimeTracking={setShowTimeTracking}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showTimers && (
          <TimersComponent
            showTimers={showTimers}
            setShowTimers={setShowTimers}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showPublicMemos && (
          <PublicMemosComponent
            showPublicMemos={showPublicMemos}
            setShowPublicMemos={setShowPublicMemos}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showWorkRecords && (
          <WorkRecordsComponent
            showWorkRecords={showWorkRecords}
            setShowWorkRecords={setShowWorkRecords}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showSoundApp && (
          <SoundAppComponent
            showSoundApp={showSoundApp}
            setShowSoundApp={setShowSoundApp}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showNotifications && (
          <NotificationComponent
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showVersionInfo && (
          <VersionInfo
            showVersionInfo={showVersionInfo}
            setShowVersionInfo={setShowVersionInfo}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}
      </main>
    </div>
  );
};

export default MainLayout;
