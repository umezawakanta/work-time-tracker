import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAnalytics } from './lib/analytics';

// Loading spinner component using Tailwind
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy wrapper with error boundary
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

// Layout wrapper for consistent styling
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 text-gray-900">
    <Layout>
      <div className="text-gray-900 bg-white min-h-full">{children}</div>
    </Layout>
  </div>
);

import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdaptiveUIProvider } from './components/ui/AdaptiveUIProvider';
import { RealtimeAdaptationProvider } from './components/realtime/RealtimeAdaptationProvider';
import { PomodoroProvider } from './context/PomodoroContext';
import { InternationalizationProvider } from './hooks/useInternationalization';
import { useAuth } from './hooks/useAuth';
import ProcrastinationGuard from '@/components/productivity/ProcrastinationGuard';
// Admin dashboard (lazy)
const AdminDashboard = lazy(() =>
  import('@/pages/AdminDashboard').then((m) => ({ default: m.default }))
);
const AIAssistantPage = lazy(() =>
  import('@/pages/AIAssistant').then((m) => ({ default: m.default }))
);
const AssessmentsHub = lazy(() =>
  import('@/pages/AssessmentsHub').then((m) => ({ default: m.default }))
);
const LearningHub = lazy(() => import('@/pages/LearningHub').then((m) => ({ default: m.default })));
const IQTest = lazy(() => import('@/pages/IQTest').then((m) => ({ default: m.default })));
const MBTITest = lazy(() => import('@/pages/MBTITest').then((m) => ({ default: m.default })));
const InvitePage = lazy(() => import('@/pages/Invite').then((m) => ({ default: m.default })));
const InviteThanks = lazy(() =>
  import('@/pages/InviteThanks').then((m) => ({ default: m.default }))
);

// Guarded route: requires admin
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth() as any;
  // 許容: ローディング中はスピナー表示（直接リダイレクトしない）
  if (loading) return <LoadingSpinner />;
  const isAdmin = Boolean(user?.isAdmin) || user?.role === 'admin';
  if (!isAuthenticated) {
    // /admin を希望していることを覚えてログイン後に戻す
    try {
      if (typeof window !== 'undefined') sessionStorage.setItem('post_login_redirect', '/admin');
    } catch {}
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Core pages - Always loaded
// import HomePage from './pages/HomePage';
// import DashboardPage from './pages/DashboardPage';
// import CognitiveDashboard from './pages/CognitiveDashboard';
import { ADHDTaskManager } from './components/cognitive/ADHDTaskManager';
import { ADHDLifeManagementHub } from './components/cognitive/ADHDLifeManagementHub';
// import CognitiveIntegratedDashboard from './components/cognitive/CognitiveIntegratedDashboard';

// 🚀 Time Tracking & Work Management - High Priority
const RealtimeClockPage = lazy(() =>
  import('@/pages/RealtimeClockPage').then((m) => ({ default: m.default }))
);
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.default })));
const DailyWorkVisualizationPage = lazy(() =>
  import('@/pages/DailyWorkVisualizationPage').then((m) => ({ default: m.default }))
);
const MonthlyTimesheetPage = lazy(() =>
  import('@/pages/MonthlyTimesheetPage').then((m) => ({ default: m.default }))
);
const WorkPatternSettingsPage = lazy(() =>
  import('@/pages/WorkPatternSettingsPage').then((m) => ({ default: m.default }))
);
const NotificationSettingsPage = lazy(() =>
  import('@/pages/NotificationSettingsPage').then((m) => ({ default: m.default }))
);
const ApprovalWorkflowPage = lazy(() =>
  import('@/pages/ApprovalWorkflowPage').then((m) => ({ default: m.default }))
);

// 📊 Chart-heavy pages
// const TimeTrackingPage = lazy(() => import('./pages/TimeTrackingPage'));
// const HabitsTrackerPage = lazy(() => import('./pages/HabitsTrackerPage'));
// const TodoAnalysisPage = lazy(() => import('./pages/TodoAnalysisPage'));

// 📅 Calendar & Task Management
const CalendarPage = lazy(() =>
  import('@/pages/CalendarPage').then((m) => ({ default: m.default }))
);
const UnifiedTaskPage = lazy(() =>
  import('@/pages/UnifiedTaskPage').then((m) => ({ default: m.default }))
);

// ⚙️ Settings
const NotificationSettings = lazy(() =>
  import('@/components/settings/NotificationSettings').then((m) => ({ default: m.default }))
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.default }))
);

// 📚 Personal & Lifestyle
const BookShelfPage = lazy(() =>
  import('@/pages/BookShelfPage').then((m) => ({ default: m.default }))
);
const AssetCalendarPage = lazy(() =>
  import('@/pages/AssetCalendarPage').then((module) => ({ default: module.AssetCalendarPage }))
);

// 🛠️ Project Management
const WBSCreatorPage = lazy(() =>
  import('@/pages/WBSCreatorPage').then((m) => ({ default: m.default }))
);

// 🏠 Home & Core Pages
const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.default })));
const WorkTimeEntry = lazy(() =>
  import('@/pages/WorkTimeEntry').then((m) => ({ default: m.default }))
);
const WorkTimeEntryForm = lazy(() =>
  import('@/components/forms/WorkTimeEntryForm').then((m) => ({ default: m.default }))
);
const WorkTimeReports = lazy(() =>
  import('@/pages/WorkTimeReports').then((m) => ({ default: m.default }))
);
// const UserProfile = lazy(() => import('./pages/UserProfile'));

// 🔐 Authentication Pages
const Login = lazy(() => import('@/pages/Login').then((m) => ({ default: m.default })));
const Register = lazy(() => import('@/pages/Register').then((m) => ({ default: m.default })));
const FirebaseLogin = lazy(() =>
  import('@/pages/FirebaseLogin').then((m) => ({ default: m.default }))
);
const ForgotPassword = lazy(() =>
  import('@/pages/ForgotPassword').then((m) => ({ default: m.default }))
);
const ResetPassword = lazy(() =>
  import('@/pages/ResetPassword').then((m) => ({ default: m.default }))
);

// 🗳️ Election & Political
const ElectionCandidatesPage = lazy(() =>
  import('@/pages/ElectionCandidatesPage').then((m) => ({ default: m.default }))
);
const CandidateRegistrationPage = lazy(() =>
  import('@/pages/CandidateRegistrationPage').then((m) => ({ default: m.default }))
);
const DistrictPage = lazy(() =>
  import('@/pages/DistrictPage').then((m) => ({ default: m.default }))
);
const TwitterPage = lazy(() => import('@/pages/TwitterPage').then((m) => ({ default: m.default })));
const PoliticalTrends = lazy(() =>
  import('@/pages/PoliticalTrends').then((m) => ({ default: m.default }))
);

// 💳 Subscription & Billing
const SubscriptionPage = lazy(() =>
  import('@/pages/SubscriptionPage').then((m) => ({ default: m.default }))
);
const SubscriptionManagementPage = lazy(() =>
  import('@/pages/subscription/SiteSubscriptionManagementPage').then((m) => ({
    default: m.default,
  }))
);
const SubscriptionManagement = lazy(() =>
  import('@/components/SubscriptionManagement').then((m) => ({ default: m.default }))
);
const SubscriptionUpgradePage = lazy(() =>
  import('@/pages/subscription/SubscriptionUpgradePage').then((m) => ({ default: m.default }))
);
const BillingHistoryPage = lazy(() =>
  import('@/pages/subscription/BillingHistoryPage').then((m) => ({ default: m.default }))
);

// 🤖 AI & Assistant (dedupe)
// const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));

// 💰 Finance & Reports
const AssetLiabilityReportPage = lazy(() =>
  import('@/pages/AssetLiabilityReportPage').then((m) => ({ default: m.default }))
);

// 🏆 Development & Gamification
const DevelopmentBadgeShowcasePage = lazy(() =>
  import('@/pages/DevelopmentBadgeShowcasePage').then((module) => ({
    default: module.DevelopmentBadgeShowcasePage,
  }))
);
const AIGamificationPage = lazy(() =>
  import('@/pages/AIGamificationPage').then((m) => ({ default: m.default }))
);
const PricingPage = lazy(() => import('@/pages/Pricing').then((m) => ({ default: m.default })));
const OnboardingPage = lazy(() =>
  import('@/pages/Onboarding').then((m) => ({ default: m.default }))
);
const PrivacyPage = lazy(() => import('@/pages/Privacy').then((m) => ({ default: m.default })));
const HowItWorksPage = lazy(() =>
  import('@/pages/HowItWorksPage').then((m) => ({ default: m.default }))
);

// 🧠 ADHD/ASD specialized pages
// const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const ADHDCognitiveAssessmentPage = lazy(() =>
  import('@/pages/ADHDCognitiveAssessmentPage').then((m) => ({ default: m.default }))
);
const ADHDIntegratedLifePage = lazy(() =>
  import('@/pages/ADHDIntegratedLifePage').then((m) => ({ default: m.default }))
);
const CognitiveFinancePage = lazy(() =>
  import('@/pages/CognitiveFinancePage').then((m) => ({ default: m.default }))
);
const BetaUserRecruitmentPage = lazy(() =>
  import('@/pages/BetaUserRecruitmentPage').then((m) => ({ default: m.default }))
);
const UserTestingPage = lazy(() =>
  import('@/pages/UserTestingPage').then((m) => ({ default: m.default }))
);
const AccessibilityAuditPage = lazy(() =>
  import('@/pages/AccessibilityAuditPage').then((module) => ({
    default: module.AccessibilityAuditPage,
  }))
);

// 💰 Finance & Goal Management
// const AssetQuestManagerPage = lazy(() => import('./pages/AssetQuestManagerPage'));
// const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage'));
// const GoalManagementPage = lazy(() => import('./pages/GoalManagementPage'));

// 📝 Content & Communication
const BlogPage = lazy(() => import('@/pages/BlogPage').then((m) => ({ default: m.default })));
const NewBlogPost = lazy(() => import('@/pages/NewBlogPost').then((m) => ({ default: m.default })));
const EditBlogPost = lazy(() =>
  import('@/pages/EditBlogPost').then((m) => ({ default: m.default }))
);
const BlogPostDetail = lazy(() =>
  import('@/pages/BlogPostDetail').then((m) => ({ default: m.default }))
);
// const EnhancedNewsPage = lazy(() => import('./pages/EnhancedNewsPage'));

// 🔧 System & Analysis
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.default }))
);
const QualityDashboardPage = lazy(() =>
  import('@/pages/QualityDashboardPage').then((m) => ({ default: m.default }))
);
// QuadrantDashboard は統合タスクページに統合済み
const SitemapPage = lazy(() => import('@/pages/SitemapPage').then((m) => ({ default: m.default })));
const SiteImprovementPlan = lazy(() =>
  import('@/pages/SiteImprovementPlan').then((m) => ({ default: m.default }))
);
const CoverageReportPage = lazy(() =>
  import('@/pages/CoverageReportPage').then((m) => ({ default: m.default }))
);
const ErrorDashboardPage = lazy(() =>
  import('@/pages/ErrorDashboardPage').then((m) => ({ default: m.default }))
);
const TestingDashboard = lazy(() =>
  import('@/pages/TestingDashboard').then((m) => ({ default: m.default }))
);
const AnalyticsDashboard = lazy(() =>
  import('@/pages/AnalyticsDashboard').then((m) => ({ default: m.default }))
);
const SNSSharePage = lazy(() =>
  import('@/pages/SNSSharePage').then((m) => ({ default: m.default }))
);
const KpiNamingRulesPage = lazy(() =>
  import('@/pages/KpiNamingRules').then((m) => ({ default: m.default }))
);
const AdvancedPerformanceMonitoringPage = lazy(() =>
  import('@/pages/AdvancedPerformanceMonitoringPage').then((m) => ({ default: m.default }))
);
const ProductionOptimizationPage = lazy(() =>
  import('@/pages/ProductionOptimizationPage').then((m) => ({ default: m.default }))
);
const MobileOptimizationPage = lazy(() =>
  import('@/pages/MobileOptimizationPage').then((m) => ({ default: m.default }))
);
const ChangelogPage = lazy(() => import('@/pages/Changelog').then((m) => ({ default: m.default })));
const DevelopmentStatusPage = lazy(() =>
  import('@/pages/DevelopmentStatus').then((m) => ({ default: m.default }))
);
const FeaturesStatusPage = lazy(() =>
  import('@/pages/FeaturesStatus').then((m) => ({ default: m.default }))
);
const DocsViewerPage = lazy(() =>
  import('@/pages/DocsViewer').then((m) => ({ default: m.default }))
);
const BugListPage = lazy(() => import('@/pages/BugList').then((m) => ({ default: m.default })));
const BugFormPage = lazy(() => import('@/pages/BugForm').then((m) => ({ default: m.default })));

// 🎯 Personal Development & Life Management
const AbstinenceManager = lazy(() =>
  import('@/pages/AbstinenceManager').then((m) => ({ default: m.default }))
);
const SleepTrackerPage = lazy(() =>
  import('@/pages/SleepTrackerPage').then((m) => ({ default: m.default }))
);
const ImpulseTrackerPage = lazy(() =>
  import('@/pages/ImpulseTrackerPage').then((m) => ({ default: m.default }))
);
const QuitSmokingCoachPage = lazy(() =>
  import('@/pages/QuitSmokingCoachPage').then((m) => ({ default: m.default }))
);
// const LifeEventTimelinePage = lazy(() => import('./pages/LifeEventTimelinePage'));
// const PersonalAnalyticsPage = lazy(() => import('./pages/PersonalAnalyticsPage'));

// 🎸 Hobbies & Learning
const GuitarPracticePage = lazy(() =>
  import('@/pages/GuitarPracticePage').then((m) => ({ default: m.default }))
);
const DiaryPage = lazy(() => import('@/pages/DiaryPage').then((m) => ({ default: m.default })));

// ⚙️ System Management
// const AdminPage = lazy(() => import('./pages/AdminPage'));
// const SubscriptionPage = lazy(() => import('./pages/subscription/SubscriptionPage'));
// const PremiumPage = lazy(() => import('./pages/subscription/PremiumPage'));

// 🗳️ Social & External Systems
// const ElectionPage = lazy(() => import('./pages/ElectionPage'));
// const TwitterIntegrationPage = lazy(() => import('./pages/TwitterIntegrationPage'));

// 📋 Project & Task Management
// const WBSPage = lazy(() => import('./pages/WBSPage'));
const ImprovementPlanDetail = lazy(() =>
  import('@/pages/ImprovementPlanDetail').then((m) => ({ default: m.default }))
);
const ImprovementImplementation = lazy(() =>
  import('@/pages/ImprovementImplementation').then((m) => ({ default: m.default }))
);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    // アプリケーション初期化
    const initializeApp = async () => {
      try {
        // 必要な初期化処理
        await new Promise((resolve) => setTimeout(resolve, 500)); // シミュレーション
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider>
      <LocaleProvider>
        <TodoProvider>
          <ThemeProvider>
            <AdaptiveUIProvider>
              <RealtimeAdaptationProvider>
                <PomodoroProvider>
                  <InternationalizationProvider>
                    <ErrorBoundary variant="app">
                      <div className="App">
                        {/* Router pageview tracking */}
                        <RouteChangeTracker
                          path={location.pathname + location.search}
                          onTrack={(path) => {
                            try {
                              trackPageView(path);
                            } catch {}
                          }}
                        />
                        {/* PWA install tracking */}
                        <PwaInstallTracker
                          onEvent={(name) => {
                            try {
                              trackEvent(name, {});
                            } catch {}
                          }}
                        />
                        <Suspense fallback={<LoadingSpinner />}>
                          <div className="min-h-screen bg-gray-50">
                            <Routes>
                              {/* ホームページ */}
                              <Route
                                path="/admin"
                                element={
                                  <RequireAdmin>
                                    <LayoutWrapper>
                                      <LazyWrapper>
                                        <AdminDashboard />
                                      </LazyWrapper>
                                    </LayoutWrapper>
                                  </RequireAdmin>
                                }
                              />
                              <Route
                                path="/"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <HomePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/home"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <HomePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/* New primary navigation routes */}
                              <Route
                                path="/ai-assistant"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AIAssistantPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/assessments"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AssessmentsHub />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/learning"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <LearningHub />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/invite"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <InvitePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/invite/thanks"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <InviteThanks />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/iq-test"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <IQTest />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/mbti-test"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <MBTITest />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 🔐 Authentication Routes */}
                              <Route
                                path="/login"
                                element={
                                  <LazyWrapper>
                                    <Login />
                                  </LazyWrapper>
                                }
                              />
                              <Route
                                path="/register"
                                element={
                                  <LazyWrapper>
                                    <Register />
                                  </LazyWrapper>
                                }
                              />
                              <Route
                                path="/firebase-login"
                                element={
                                  <LazyWrapper>
                                    <FirebaseLogin />
                                  </LazyWrapper>
                                }
                              />
                              <Route
                                path="/forgot-password"
                                element={
                                  <LazyWrapper>
                                    <ForgotPassword />
                                  </LazyWrapper>
                                }
                              />
                              <Route
                                path="/reset-password"
                                element={
                                  <LazyWrapper>
                                    <ResetPassword />
                                  </LazyWrapper>
                                }
                              />

                              <Route
                                path="/integrated-dashboard"
                                element={<Navigate to="/?tab=dashboard" replace />}
                              />
                              <Route
                                path="/dashboard"
                                element={<Navigate to="/?tab=dashboard" replace />}
                              />
                              <Route
                                path="/sitemap"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SitemapPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/features"
                                element={
                                  <RequireAdmin>
                                    <LayoutWrapper>
                                      <LazyWrapper>
                                        <FeaturesStatusPage />
                                      </LazyWrapper>
                                    </LayoutWrapper>
                                  </RequireAdmin>
                                }
                              />
                              <Route
                                path="/docs/*"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <DocsViewerPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/* Background feature anchors → redirect to docs */}
                              <Route
                                path="/_bg/share-dev-progress"
                                element={
                                  <Navigate
                                    to="/docs/features/share-dev-progress/detailed-design"
                                    replace
                                  />
                                }
                              />
                              <Route
                                path="/_bg/logout"
                                element={
                                  <Navigate to="/docs/features/logout/detailed-design" replace />
                                }
                              />
                              <Route
                                path="/bugs"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BugListPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/bugs/new"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BugFormPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/pricing"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <PricingPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/changelog"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ChangelogPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/privacy"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <PrivacyPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/how-it-works"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <HowItWorksPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/onboarding"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <OnboardingPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/*<Route
                                path="/cognitive-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <CognitiveDashboard />
                                  </LayoutWrapper>
                                }
                              />*/}
                              <Route
                                path="/adhd-task-manager"
                                element={<Navigate to="/tasks" replace />}
                              />
                              <Route
                                path="/game-loop-tasks"
                                element={<Navigate to="/tasks" replace />}
                              />
                              <Route
                                path="/todo-analytics"
                                element={<Navigate to="/tasks" replace />}
                              />
                              <Route
                                path="/adhd-integrated-life"
                                element={
                                  <LayoutWrapper>
                                    <ADHDLifeManagementHub />
                                  </LayoutWrapper>
                                }
                              />
                              {/*<Route
                                path="/cognitive-integrated-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <CognitiveIntegratedDashboard />
                                  </LayoutWrapper>
                                }
                              />*/}

                              {/* 🚀 Time Tracking & Work Management */}
                              <Route
                                path="/worktime-entry"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WorkTimeEntry />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/worktime-form"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WorkTimeEntryForm />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/reports"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WorkTimeReports />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/realtime-clock"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <RealtimeClockPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/daily-work-visualization"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <DailyWorkVisualizationPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/monthly-timesheet"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <MonthlyTimesheetPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/work-pattern-settings"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WorkPatternSettingsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/notification-settings"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <NotificationSettingsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/approval-workflow"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ApprovalWorkflowPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 📊 Chart-heavy pages */}
                              {/*<Route
                                path="/time-tracking"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <TimeTrackingPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              {/*<Route
                                path="/habits-tracker"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <HabitsTrackerPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              {/*<Route
                                path="/todo-analysis"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <TodoAnalysisPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}

                              {/* 🧠 ADHD/ASD specialized pages */}
                              {/*<Route
                                path="/pomodoro"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <PomodoroPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              <Route
                                path="/adhd-cognitive-assessment"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ADHDCognitiveAssessmentPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/adhd-integrated-life-page"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ADHDIntegratedLifePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/cognitive-finance"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <CognitiveFinancePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/beta-user-recruitment"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BetaUserRecruitmentPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/user-testing"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <UserTestingPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/accessibility-audit"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AccessibilityAuditPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 💰 Finance & Goal Management */}
                              {/*<Route
                                path="/asset-quest"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AssetQuestManagerPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              {/*<Route
                                path="/finance-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <FinanceDashboardPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              {/*<Route
                                path="/goal-management"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper><GoalManagementPage /></LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}

                              {/* 📅 Calendar & Task Management */}
                              <Route
                                path="/calendar"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <CalendarPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/tasks"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <UnifiedTaskPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/settings"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SettingsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/settings/notifications"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <NotificationSettings />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/* Legacy redirects */}
                              <Route
                                path="/task-management"
                                element={<Navigate to="/tasks" replace />}
                              />
                              <Route path="/todos" element={<Navigate to="/tasks" replace />} />
                              <Route
                                path="/todo-manager"
                                element={<Navigate to="/tasks" replace />}
                              />
                              <Route
                                path="/diary"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <DiaryPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 📚 Personal & Lifestyle */}
                              <Route
                                path="/bookshelf"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BookShelfPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/asset-calendar"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AssetCalendarPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 🛠️ Project Management */}
                              <Route
                                path="/wbs-creator"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WBSCreatorPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 📝 Content & Communication */}
                              <Route
                                path="/blog"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BlogPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/blog/new"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <NewBlogPost />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/blog/:id"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BlogPostDetail />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/blog/edit/:id"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <EditBlogPost />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/*<Route
                                path="/news"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <EnhancedNewsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}

                              {/* 🔧 System & Analysis */}
                              <Route
                                path="/analytics"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AnalyticsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/kpi-naming-rules"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <KpiNamingRulesPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/quality-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <QualityDashboardPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/* 4象限マトリックスは統合タスクページにリダイレクト */}
                              <Route
                                path="/quadrant-dashboard"
                                element={<Navigate to="/tasks?tab=quadrant" replace />}
                              />
                              <Route
                                path="/advanced-performance-monitoring"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AdvancedPerformanceMonitoringPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/production-optimization"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ProductionOptimizationPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/mobile-optimization"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <MobileOptimizationPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/error-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ErrorDashboardPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/testing-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <TestingDashboard />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/analytics-dashboard"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AnalyticsDashboard />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/sns-share"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SNSSharePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/coverage-report"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <CoverageReportPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              <Route
                                path="/dev-status"
                                element={
                                  <RequireAdmin>
                                    <LayoutWrapper>
                                      <LazyWrapper>
                                        <DevelopmentStatusPage />
                                      </LazyWrapper>
                                    </LayoutWrapper>
                                  </RequireAdmin>
                                }
                              />

                              {/* 🤖 AI & Assistant (route defined earlier; duplicate removed) */}

                              {/* 🧘 Personal Development */}
                              <Route
                                path="/sleep-tracker"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SleepTrackerPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/impulse-tracker"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ImpulseTrackerPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/quit-smoking"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <QuitSmokingCoachPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              {/*<Route
                                path="/life-timeline"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <LifeEventTimelinePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              {/*<Route
                                path="/personal-analytics"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <PersonalAnalyticsPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}

                              {/* 🎸 Hobbies & Learning */}
                              <Route
                                path="/guitar-practice"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <GuitarPracticePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* ⚙️ System Management */}
                              <Route
                                path="/subscription-management"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SubscriptionManagementPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/subscription"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SubscriptionPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/subscription-upgrade"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SubscriptionUpgradePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/billing-history"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <BillingHistoryPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/asset-liability-report"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AssetLiabilityReportPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/profile"
                                element={<Navigate to="/settings?tab=account" replace />}
                              />

                              {/* 🏆 Development & Gamification */}
                              <Route
                                path="/development-badges"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <DevelopmentBadgeShowcasePage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/ai-gamification"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <AIGamificationPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 🗳️ Social & External Systems */}
                              <Route
                                path="/election-candidates"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ElectionCandidatesPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/candidate-registration"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <CandidateRegistrationPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/district/:id"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <DistrictPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/twitter"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <TwitterPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/political-trends"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <PoliticalTrends />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* 📋 Project & Task Management */}
                              {/*<Route
                                path="/wbs"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <WBSPage />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />*/}
                              <Route
                                path="/improvement-plan"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <SiteImprovementPlan />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/improvement-plan/:id"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ImprovementPlanDetail />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                              <Route
                                path="/improvement-implementation/:projectId"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <ImprovementImplementation />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />

                              {/* Catch-all route */}
                              <Route
                                path="*"
                                element={
                                  <LayoutWrapper>
                                    <LazyWrapper>
                                      <NotFound />
                                    </LazyWrapper>
                                  </LayoutWrapper>
                                }
                              />
                            </Routes>
                          </div>
                        </Suspense>
                      </div>
                    </ErrorBoundary>
                  </InternationalizationProvider>
                </PomodoroProvider>
              </RealtimeAdaptationProvider>
            </AdaptiveUIProvider>
          </ThemeProvider>
        </TodoProvider>
      </LocaleProvider>
    </AuthProvider>
  );
};

const AppWithProviders: React.FC = () => {
  return (
    <>
      <App />
      <ProcrastinationGuard />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {/* Accessible live region for important status updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
      <SpeedInsights />
    </>
  );
};

export default AppWithProviders;

// Lightweight helper component to detect route changes and fire pageview tracking
const RouteChangeTracker: React.FC<{ path: string; onTrack: (path: string) => void }> = ({
  path,
  onTrack,
}) => {
  useEffect(() => {
    onTrack(path);
  }, [path]);
  return null;
};

// PWA install tracking component
const PwaInstallTracker: React.FC<{ onEvent: (name: string) => void }> = ({ onEvent }) => {
  useEffect(() => {
    const before = (e: any) => {
      onEvent('pwa_beforeinstallprompt');
    };
    const installed = () => {
      onEvent('pwa_appinstalled');
    };
    window.addEventListener('beforeinstallprompt', before as any);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', before as any);
      window.removeEventListener('appinstalled', installed);
    };
  }, [onEvent]);
  return null;
};
