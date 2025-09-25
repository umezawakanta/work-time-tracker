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
  const loadTimeEntries = () => {};

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
    });
  }, [user, isLoggedIn, showCharacterHome, showProjects, showCookingTimer, showSelfAnalysis, showBookshelf, showMemos, showReports, showAdminPanel, showTimeTracking, showTimers, showPublicMemos, showWorkRecords, showSoundApp, showNotifications, showVersionInfo]);

  // 認証されていない場合は何も表示しない
  if (!isLoggedIn || !user) {
    console.log('MainLayout - User not authenticated, not rendering content');
    return null;
  }
  return (
    <div className="app">
      <HeaderComponent
        user={user}
        isLoggedIn={isLoggedIn}
        onShowCharacterHome={() => {
          setShowCharacterHome(true);
          closeOtherFeatures('character-home');
        }}
        onShowProjects={() => {
          setShowProjects(true);
          closeOtherFeatures('projects');
        }}
        onShowCookingTimer={() => {
          setShowCookingTimer(true);
          closeOtherFeatures('cooking-timer');
        }}
        onShowSelfAnalysis={() => {
          setShowSelfAnalysis(true);
          closeOtherFeatures('self-analysis');
        }}
        onShowBookshelf={() => {
          setShowBookshelf(true);
          closeOtherFeatures('bookshelf');
        }}
        onShowMemos={() => {
          setShowMemos(true);
          closeOtherFeatures('memos');
        }}
        onShowReports={() => {
          setShowReports(true);
          closeOtherFeatures('reports');
        }}
        onShowAdminPanel={() => {
          setShowAdminPanel(true);
          closeOtherFeatures('admin-panel');
        }}
        onShowTimeTracking={() => {
          setShowTimeTracking(true);
          closeOtherFeatures('time-tracking');
        }}
        onShowTimers={() => {
          setShowTimers(true);
          closeOtherFeatures('timers');
        }}
        onShowPublicMemos={() => {
          setShowPublicMemos(true);
          closeOtherFeatures('public-memos');
        }}
        onShowWorkRecords={() => {
          setShowWorkRecords(true);
          closeOtherFeatures('work-records');
        }}
        onShowSoundApp={() => {
          setShowSoundApp(true);
          closeOtherFeatures('sound-app');
        }}
        onShowNotifications={() => {
          setShowNotifications(true);
          closeOtherFeatures('notifications');
        }}
        onShowVersionInfo={() => {
          setShowVersionInfo(true);
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
          // ログアウト処理
        }}
        closeOtherFeatures={closeOtherFeatures}
        setShowThemeSettings={() => {}}
        setShowFontSettings={() => {}}
        setShowFeatureSettings={() => {}}
        loadUserSettings={() => {}}
        isTimeTrackingActive={false}
        onUpdateRequestClick={() => {}}
        onBugReportClick={() => {}}
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
            showProjectForm={false}
            setShowProjectForm={() => {}}
            projects={[]}
            projectsLoading={false}
            selectedProject=""
            setSelectedProject={() => {}}
            projectName=""
            setProjectName={() => {}}
            projectDescription=""
            setProjectDescription={() => {}}
            projectColor="#007bff"
            setProjectColor={() => {}}
            loading={false}
            handleCreateProject={async () => {}}
            loadProjects={async () => {}}
          />
        )}

        {showCookingTimer && (
          <CookingTimerSection
            showCookingTimer={showCookingTimer}
            setShowCookingTimer={setShowCookingTimer}
            closeOtherFeatures={closeOtherFeatures}
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
        )}

        {showSelfAnalysis && (
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
        )}

        {showBookshelf && (
          <BookshelfComponent
            showBookshelf={showBookshelf}
            setShowBookshelf={setShowBookshelf}
            closeOtherFeatures={closeOtherFeatures}
            books={[]}
            booksLoading={false}
            showBookForm={false}
            setShowBookForm={() => {}}
            editingBook={null}
            setEditingBook={() => {}}
            bookTitle=""
            setBookTitle={() => {}}
            bookAuthor=""
            setBookAuthor={() => {}}
            bookIsbn=""
            setBookIsbn={() => {}}
            bookPublishedYear={new Date().getFullYear()}
            setBookPublishedYear={() => {}}
            bookTotalPages={0}
            setBookTotalPages={() => {}}
            bookCategory=""
            setBookCategory={() => {}}
            bookNotes=""
            setBookNotes={() => {}}
            selectedBookCategory="all"
            setSelectedBookCategory={() => {}}
            getBookCategories={() => ['小説', '技術書', 'ビジネス', '自己啓発', 'その他']}
            loading={false}
            loadBooks={() => {}}
            handleCreateBook={() => {}}
            handleUpdateBook={() => {}}
            handleEditBook={() => {}}
            handleDeleteBook={() => {}}
            handleBookCategoryChange={() => {}}
            getReadingProgress={() => 0}
          />
        )}

        {showMemos && (
          <MemosComponent
            showMemos={showMemos}
            setShowMemos={setShowMemos}
            closeOtherFeatures={closeOtherFeatures}
            memos={[]}
            publicMemos={[]}
            memosLoading={false}
            customCategories={[]}
            setCustomCategories={() => {}}
            loadMemos={() => {}}
            handleDeleteMemo={() => {}}
            user={user}
            handleCreateMemo={() => {}}
            handleUpdateMemo={() => {}}
            editingMemo={null}
            setEditingMemo={() => {}}
            memoTitle=""
            setMemoTitle={() => {}}
            memoContent=""
            setMemoContent={() => {}}
            memoCategory=""
            setMemoCategory={() => {}}
            memoTags=""
            setMemoTags={() => {}}
            memoIsPublic={false}
            setMemoIsPublic={() => {}}
            memoIsFamilyOnly={false}
            setMemoIsFamilyOnly={() => {}}
            memoIsAdminOnly={false}
            setMemoIsAdminOnly={() => {}}
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
        )}

        {showReports && (
          <ReportsComponent
            showReports={showReports}
            setShowReports={setShowReports}
            closeOtherFeatures={closeOtherFeatures}
            incomeExpenseRecords={[]}
            workDiaries={[]}
            reportsLoading={false}
            reportSummary={{}}
            loadReportSummary={() => {}}
          />
        )}

        {showAdminPanel && (
          <AdminPanelComponent
            showAdminPanel={showAdminPanel}
            setShowAdminPanel={setShowAdminPanel}
            closeOtherFeatures={closeOtherFeatures}
            adminUsers={[]}
            adminUsersLoading={false}
            editingUser={null}
            setEditingUser={() => {}}
            loadAdminUsers={() => {}}
            handleEditUser={() => {}}
            handleUpdateUser={() => {}}
            handleDeleteUser={() => {}}
          />
        )}

        {showTimeTracking && (
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
            loadProjects={() => {}}
            loadTimeEntries={() => {}}
            handleStartTracking={() => {}}
            handleStopTracking={() => {}}
            handleResetTracking={() => {}}
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
            publicMemos={[]}
            publicMemosLoading={false}
            user={user}
            loadPublicMemos={() => {}}
            handleReplySubmit={() => {}}
            handleReplyCancel={() => {}}
            handleEditReply={() => {}}
            handleSaveEditReply={() => {}}
            handleDeleteReply={() => {}}
            handleCancelEditReply={() => {}}
            replyContent=""
            setReplyContent={() => {}}
          />
        )}

        {/* {showWorkRecords && (
          <WorkRecordsComponent />
        )} */}

        {showSoundApp && (
          <SoundAppComponent
            showSoundApp={showSoundApp}
            setShowSoundApp={setShowSoundApp}
            closeOtherFeatures={closeOtherFeatures}
          />
        )}

        {showNotifications && (
          <NotificationComponent />
        )}

        {showVersionInfo && (
          <VersionInfo />
        )}
      </main>
    </div>
  );
};

export default MainLayout;
