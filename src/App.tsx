import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { LocaleProvider } from './context/LocaleContext';
import { AuthProvider } from './context/AuthContext';
import { PomodoroProvider } from './context/PomodoroContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/admin/AdminRoute';
import { PomodoroManager } from './components/pomodoro/PomodoroManager';
import { GuitarPracticeErrorBoundary } from './components/ErrorBoundary';
import ErrorDashboardPage from './pages/ErrorDashboardPage';
import { ErrorRecoveryService } from './services/ErrorRecoveryService';

// 🚀 Core pages (immediate load)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// ⚡ Heavy pages - Dynamic Import (lazy load)
const PoliticalTrends = lazy(() => import('./pages/PoliticalTrends'));
const IntegratedDashboard = lazy(() => import('./pages/IntegratedDashboard'));
const TodoManagerPage = lazy(() => import('./pages/TodoManagerPage'));
const TodoAnalyticsPage = lazy(() => import('./pages/TodoAnalyticsPage'));
const AutomationRulesPage = lazy(() => import('./pages/AutomationRulesPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const DiaryPage = lazy(() => import('./pages/DiaryPage'));
const WBSCreatorPage = lazy(() => import('./pages/WBSCreatorPage'));
const WBSGeneratorPage = lazy(() => import('./pages/WBSGeneratorPage'));
const WorkTimeReports = lazy(() => import('./pages/WorkTimeReports'));
const AssetLiabilityReportPage = lazy(() => import('./pages/AssetLiabilityReportPage'));
const DevelopmentBadgeDashboard = lazy(() =>
  import('./components/development/DevelopmentBadgeDashboard').then((module) => ({
    default: module.DevelopmentBadgeDashboard,
  }))
);
const ErrorMonitorDashboard = lazy(() =>
  import('./components/development/ErrorMonitorDashboard').then((module) => ({
    default: module.ErrorMonitorDashboard,
  }))
);

const CrossBrowserTestPage = lazy(() =>
  import('./pages/CrossBrowserTestPage').then((module) => ({
    default: module.CrossBrowserTestPage,
  }))
);

// 🥷 パフォーマンス忍者: パフォーマンス監視ダッシュボード
const PerformanceDashboard = lazy(() =>
  import('./components/development/PerformanceDashboard').then((module) => ({
    default: module.PerformanceDashboard,
  }))
);

// 🧠 ADHD集中サポート
const ADHDSupportPage = lazy(() =>
  import('./pages/ADHDSupportPage').then((module) => ({
    default: module.ADHDSupportPage,
  }))
);

const ADHDFloatingButton = lazy(() =>
  import('./components/adhd/ADHDFloatingButton').then((module) => ({
    default: module.ADHDFloatingButton,
  }))
);
const QualityDashboardPage = lazy(() => import('./pages/QualityDashboardPage'));

// 📊 Chart-heavy pages
const BlogPage = lazy(() => import('./pages/BlogPage'));
const TwitterPage = lazy(() => import('./pages/TwitterPage'));
const BookShelfPage = lazy(() => import('./pages/BookShelfPage'));
const SleepTrackerPage = lazy(() => import('./pages/SleepTrackerPage'));
const GuitarPracticePage = lazy(() => import('./pages/GuitarPracticePage'));
const ImpulseTrackerPage = lazy(() => import('./pages/ImpulseTrackerPage'));

// 🛍️ E-commerce pages
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));

// 📅 Calendar & Asset pages
const AssetCalendarPage = lazy(() =>
  import('./pages/AssetCalendarPage').then((module) => ({ default: module.AssetCalendarPage }))
);
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage'));
const SubscriptionUpgradePage = lazy(() => import('./pages/subscription/SubscriptionUpgradePage'));
const BillingHistoryPage = lazy(() => import('./pages/subscription/BillingHistoryPage'));

// 🗳️ Election pages
const ElectionCandidatesPage = lazy(() => import('./pages/ElectionCandidatesPage'));
const CandidateRegistrationPage = lazy(() => import('./pages/CandidateRegistrationPage'));
const DistrictPage = lazy(() => import('./pages/DistrictPage'));

// 👤 User & Auth pages
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

// 📝 Blog & Content pages
const NewBlogPost = lazy(() => import('./pages/NewBlogPost'));
const BlogPostDetail = lazy(() => import('./pages/BlogPostDetail'));
const EditBlogPost = lazy(() => import('./pages/EditBlogPost'));

// 🏗️ Development & System pages
const SiteDevWBS = lazy(() => import('./components/features/wbs/SiteDevWBS'));
const SiteImprovementPlan = lazy(() => import('./pages/SiteImprovementPlan'));
const ImprovementPlanDetail = lazy(() => import('./pages/ImprovementPlanDetail'));
const SystemDesignDocuments = lazy(() => import('./pages/SystemDesignDocuments'));
const UpdateHistoryPage = lazy(() => import('@/pages/UpdateHistoryPage'));

// 🔧 Form & Utility pages
const WorkTimeEntryForm = lazy(() => import('./components/forms/WorkTimeEntryForm'));
const AbstinenceManager = lazy(() => import('./pages/AbstinenceManager'));

// 👑 Admin pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApiTest = lazy(() => import('./pages/ApiTest'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// ⚡ Performance-optimized Loading Component
const PageLoading: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="400px"
    flexDirection="column"
    gap={2}
  >
    <CircularProgress size={32} thickness={4} />
    <Box color="text.secondary" fontSize="14px">
      ページを読み込み中...
    </Box>
  </Box>
);

// Suspense wrapper for lazy components
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

// 最新のToaster設定でより洗練された通知
const toasterConfig = {
  position: 'top-right' as const,
  toastOptions: {
    duration: 4000,
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '12px',
      color: '#334155',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    },
  },
};

// Layoutでラップするコンポーネント
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Layout>{children}</Layout>
);

export default function App() {
  // 🐛 エラーエリミネーター: エラー回復サービス初期化
  useEffect(() => {
    const errorRecoveryService = ErrorRecoveryService.getInstance();
    console.log('🐛 エラー回復システム初期化完了');

    return () => {
      console.log('🐛 エラー回復システム終了');
    };
  }, []);

  return (
    <AuthProvider>
      <LocaleProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <Toaster {...toasterConfig} />

            {/* ポモドーロタイマー - 全ページで利用可能 */}
            <PomodoroProvider>
              <PomodoroManager />
            </PomodoroProvider>

            {/* ADHD緊急サポートボタン - 全ページで利用可能 */}
            <LazyWrapper>
              <ADHDFloatingButton />
            </LazyWrapper>

            <Routes>
              {/* 認証不要なルート */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
                path="/verify-email"
                element={
                  <LazyWrapper>
                    <EmailVerification />
                  </LazyWrapper>
                }
              />
              <Route
                path="/election-candidates"
                element={
                  <LazyWrapper>
                    <ElectionCandidatesPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/candidate-registration"
                element={
                  <LazyWrapper>
                    <CandidateRegistrationPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/district/:prefecture/:district"
                element={
                  <LazyWrapper>
                    <DistrictPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/political-trends"
                element={
                  <LazyWrapper>
                    <PoliticalTrends />
                  </LazyWrapper>
                }
              />
              <Route
                path="/calendar"
                element={
                  <LazyWrapper>
                    <CalendarPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/shop"
                element={
                  <LazyWrapper>
                    <ShopPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/products"
                element={
                  <LazyWrapper>
                    <ProductsPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <LazyWrapper>
                    <ProductDetailPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/checkout"
                element={
                  <LazyWrapper>
                    <CheckoutPage />
                  </LazyWrapper>
                }
              />
              <Route
                path="/site-dev"
                element={
                  <LazyWrapper>
                    <SiteDevWBS />
                  </LazyWrapper>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route
                path="/update-history"
                element={
                  <LazyWrapper>
                    <UpdateHistoryPage />
                  </LazyWrapper>
                }
              />

              {/* 認証が必要なルート */}
              <Route element={<PrivateRoute />}>
                <Route
                  path="/"
                  element={
                    <LayoutWrapper>
                      <Home />
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/integrated-dashboard"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <IntegratedDashboard />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/todos"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <TodoManagerPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/todos-analytics"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <TodoAnalyticsPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/automation-rules"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <AutomationRulesPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/work-time"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <WorkTimeEntryForm />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/work-time-reports"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <WorkTimeReports />
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
                  path="/asset-calendar"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <AssetCalendarPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
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
                  path="/guitar-practice"
                  element={
                    <LayoutWrapper>
                      <GuitarPracticeErrorBoundary>
                        <LazyWrapper>
                          <GuitarPracticePage />
                        </LazyWrapper>
                      </GuitarPracticeErrorBoundary>
                    </LayoutWrapper>
                  }
                />
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
                <Route
                  path="/profile"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <UserProfile />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
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
                <Route
                  path="/wbs"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <WBSCreatorPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/wbs-generator"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <WBSGeneratorPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
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
                  path="/improvement-plan/detail"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <ImprovementPlanDetail />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/system-design"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <SystemDesignDocuments />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <LayoutWrapper>
                        <LazyWrapper>
                          <AdminDashboard />
                        </LazyWrapper>
                      </LayoutWrapper>
                    </AdminRoute>
                  }
                />
                <Route
                  path="/api-test"
                  element={
                    <AdminRoute>
                      <LayoutWrapper>
                        <LazyWrapper>
                          <ApiTest />
                        </LazyWrapper>
                      </LayoutWrapper>
                    </AdminRoute>
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
                  path="/abstinence"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <AbstinenceManager />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/development-badges"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <DevelopmentBadgeDashboard />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/error-monitor"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <ErrorMonitorDashboard />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/performance-monitor"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <PerformanceDashboard />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
                <Route
                  path="/adhd-support"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <ADHDSupportPage />
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
                  path="/cross-browser-test"
                  element={
                    <LayoutWrapper>
                      <LazyWrapper>
                        <CrossBrowserTestPage />
                      </LazyWrapper>
                    </LayoutWrapper>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
        </ThemeProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}
