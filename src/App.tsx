import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';

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
  <div className="min-h-screen bg-gray-50">
    <Layout>{children}</Layout>
  </div>
);

import { AuthProvider } from './context/AuthContext';
import { LocaleProvider } from './context/LocaleContext';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdaptiveUIProvider } from './context/AdaptiveUIContext';
import { RealtimeAdaptationProvider } from './components/realtime/RealtimeAdaptationProvider';
import { PomodoroProvider } from './context/PomodoroContext';
import { InternationalizationProvider } from './hooks/useInternationalization';

// Core pages - Always loaded
// import HomePage from './pages/HomePage';
// import DashboardPage from './pages/DashboardPage';
import IntegratedDashboard from './pages/IntegratedDashboard';
// import CognitiveDashboard from './pages/CognitiveDashboard';
import { ADHDTaskManager } from './components/ADHDTaskManager';
import { ADHDIntegratedLifeSystem } from './components/ADHDIntegratedLifeSystem';
// import CognitiveIntegratedDashboard from './components/cognitive/CognitiveIntegratedDashboard';

// 🚀 Time Tracking & Work Management - High Priority
const RealtimeClockPage = lazy(() => import('./pages/RealtimeClockPage'));
const DailyWorkVisualizationPage = lazy(() => import('./pages/DailyWorkVisualizationPage'));
const MonthlyTimesheetPage = lazy(() => import('./pages/MonthlyTimesheetPage'));
const WorkPatternSettingsPage = lazy(() => import('./pages/WorkPatternSettingsPage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const ApprovalWorkflowPage = lazy(() => import('./pages/ApprovalWorkflowPage'));

// 📊 Chart-heavy pages
// const TimeTrackingPage = lazy(() => import('./pages/TimeTrackingPage'));
// const HabitsTrackerPage = lazy(() => import('./pages/HabitsTrackerPage'));
// const TodoAnalysisPage = lazy(() => import('./pages/TodoAnalysisPage'));

// 🧠 ADHD/ASD specialized pages
// const PomodoroPage = lazy(() => import('./pages/PomodoroPage'));
const ADHDCognitiveAssessmentPage = lazy(() => import('./pages/ADHDCognitiveAssessmentPage'));
const ADHDIntegratedLifePage = lazy(() => import('./pages/ADHDIntegratedLifePage'));
const CognitiveFinancePage = lazy(() => import('./pages/CognitiveFinancePage'));
const CognitiveAICoachingPage = lazy(() => import('./pages/CognitiveAICoachingPage'));
const SocialSupportNetworkPage = lazy(() => import('./pages/SocialSupportNetworkPage'));
const RealtimeAdaptationPage = lazy(() => import('./pages/RealtimeAdaptationPage'));

// 💰 Finance & Goal Management
// const AssetQuestManagerPage = lazy(() => import('./pages/AssetQuestManagerPage'));
// const FinanceDashboardPage = lazy(() => import('./pages/FinanceDashboardPage'));
// const GoalManagementPage = lazy(() => import('./pages/GoalManagementPage'));

// 📝 Content & Communication
const BlogPage = lazy(() => import('./pages/BlogPage'));
const NewBlogPost = lazy(() => import('./pages/NewBlogPost'));
const EditBlogPost = lazy(() => import('./pages/EditBlogPost'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
// const EnhancedNewsPage = lazy(() => import('./pages/EnhancedNewsPage'));

// 🔧 System & Analysis
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const QualityDashboardPage = lazy(() => import('./pages/QualityDashboardPage'));
const SiteImprovementPlan = lazy(() => import('./pages/SiteImprovementPlan'));
const CoverageReportPage = lazy(() => import('./pages/CoverageReportPage'));
const ErrorDashboardPage = lazy(() => import('./pages/ErrorDashboardPage'));

// 🎯 Personal Development & Life Management
const AbstinenceManager = lazy(() => import('./pages/AbstinenceManager'));
const SleepTrackerPage = lazy(() => import('./pages/SleepTrackerPage'));
const ImpulseTrackerPage = lazy(() => import('./pages/ImpulseTrackerPage'));
// const LifeEventTimelinePage = lazy(() => import('./pages/LifeEventTimelinePage'));
// const PersonalAnalyticsPage = lazy(() => import('./pages/PersonalAnalyticsPage'));

// 🎸 Hobbies & Learning
const GuitarPracticePage = lazy(() => import('./pages/GuitarPracticePage'));
const DiaryPage = lazy(() => import('./pages/DiaryPage'));

// ⚙️ System Management
// const AdminPage = lazy(() => import('./pages/AdminPage'));
// const SubscriptionPage = lazy(() => import('./pages/subscription/SubscriptionPage'));
// const PremiumPage = lazy(() => import('./pages/subscription/PremiumPage'));

// 🗳️ Social & External Systems
// const ElectionPage = lazy(() => import('./pages/ElectionPage'));
// const TwitterIntegrationPage = lazy(() => import('./pages/TwitterIntegrationPage'));

// 📋 Project & Task Management
// const WBSPage = lazy(() => import('./pages/WBSPage'));
const ImprovementPlanDetail = lazy(() => import('./pages/ImprovementPlanDetail'));
const ImprovementImplementation = lazy(() => import('./pages/ImprovementImplementation'));

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

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
                    <div className="App">
                      <Suspense fallback={<LoadingSpinner />}>
                        <div className="min-h-screen bg-gray-50">
                          <Routes>
                            {/*<Route
                              path="/"
                              element={
                                <LayoutWrapper>
                                  <HomePage />
                                </LayoutWrapper>
                              }
                            />*/}
                            {/*<Route
                              path="/home"
                              element={
                                <LayoutWrapper>
                                  <HomePage />
                                </LayoutWrapper>
                              }
                            />*/}
                            {/*<Route
                              path="/dashboard"
                              element={
                                <LayoutWrapper>
                                  <DashboardPage />
                                </LayoutWrapper>
                              }
                            />*/}
                            <Route
                              path="/integrated-dashboard"
                              element={
                                <LayoutWrapper>
                                  <IntegratedDashboard />
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
                              element={
                                <LayoutWrapper>
                                  <ADHDTaskManager />
                                </LayoutWrapper>
                              }
                            />
                            <Route
                              path="/adhd-integrated-life"
                              element={
                                <LayoutWrapper>
                                  <ADHDIntegratedLifeSystem />
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
                                    <EditBlogPost />
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
                              path="/quality-dashboard"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <QualityDashboardPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />
                            <Route path="/error-dashboard" element={<ErrorDashboardPage />} />
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
                            {/*<Route
                              path="/admin"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <AdminPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />*/}
                            {/*<Route
                              path="/subscription"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <SubscriptionPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />*/}
                            {/*<Route
                              path="/premium"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <PremiumPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />*/}

                            {/* 🗳️ Social & External Systems */}
                            {/*<Route
                              path="/election"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <ElectionPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />*/}
                            {/*<Route
                              path="/twitter"
                              element={
                                <LayoutWrapper>
                                  <LazyWrapper>
                                    <TwitterIntegrationPage />
                                  </LazyWrapper>
                                </LayoutWrapper>
                              }
                            />*/}

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
                              path="/*"
                              element={<Navigate to="/integrated-dashboard" replace />}
                            />
                          </Routes>
                        </div>
                      </Suspense>
                    </div>
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

export default App;
