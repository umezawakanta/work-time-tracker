import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from '@/components/layout/Layout';
import Home from './pages/Home';
import WorkTimeEntryForm from './components/forms/WorkTimeEntryForm';
import WorkTimeReports from './pages/WorkTimeReports';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import { LocaleProvider } from './context/LocaleContext';
import { AuthProvider } from './context/AuthContext';
import { AssetCalendarPage } from './pages/AssetCalendarPage';
import ElectionCandidatesPage from './pages/ElectionCandidatesPage';
import CandidateRegistrationPage from './pages/CandidateRegistrationPage';
import DistrictPage from './pages/DistrictPage';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';
import AssetLiabilityReportPage from './pages/AssetLiabilityReportPage';
import BookShelfPage from './pages/BookShelfPage';
import SleepTrackerPage from './pages/SleepTrackerPage';
import BlogPage from './pages/BlogPage';
import NewBlogPost from './pages/NewBlogPost';
import BlogPostDetail from './pages/BlogPostDetail';
import EditBlogPost from './pages/EditBlogPost';
import UserProfile from './pages/UserProfile';
import PrivateRoute from './components/PrivateRoute';
import WBSCreatorPage from './pages/WBSCreatorPage';
import TwitterPage from './pages/TwitterPage';
import PoliticalTrends from './pages/PoliticalTrends';
import CalendarPage from './pages/CalendarPage';
import DiaryPage from './pages/DiaryPage';
import ImpulseTrackerPage from './pages/ImpulseTrackerPage';
import GuitarPracticePage from './pages/GuitarPracticePage';
import SiteDevWBS from './components/features/wbs/SiteDevWBS';
import SiteImprovementPlan from './pages/SiteImprovementPlan';
import ImprovementPlanDetail from './pages/ImprovementPlanDetail';
import ImprovementImplementation from './pages/ImprovementImplementation';
import IntegratedDashboard from './pages/IntegratedDashboard';
import SystemDesignDocuments from './pages/SystemDesignDocuments';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/admin/AdminRoute';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import UpdateHistoryPage from '@/pages/UpdateHistoryPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AbstinenceManager from './pages/AbstinenceManager';
import ShopPage from './pages/ShopPage';

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

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LocaleProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
              <Toaster {...toasterConfig} />
              <Layout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/election-candidates" element={<ElectionCandidatesPage />} />
                  <Route path="/candidate-registration" element={<CandidateRegistrationPage />} />
                  <Route path="/district/:prefecture/:district" element={<DistrictPage />} />
                  <Route path="/political-trends" element={<PoliticalTrends />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/integrated-dashboard" element={<IntegratedDashboard />} />
                    <Route path="/work-time" element={<WorkTimeEntryForm />} />
                    <Route path="/work-time-reports" element={<WorkTimeReports />} />
                    <Route path="/asset-liability-report" element={<AssetLiabilityReportPage />} />
                    <Route
                      path="/subscription-management"
                      element={<SubscriptionManagementPage />}
                    />
                    <Route path="/asset-calendar" element={<AssetCalendarPage />} />
                    <Route path="/bookshelf" element={<BookShelfPage />} />
                    <Route path="/guitar-practice" element={<GuitarPracticePage />} />
                    <Route path="/sleep-tracker" element={<SleepTrackerPage />} />
                    <Route path="/twitter" element={<TwitterPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/new" element={<NewBlogPost />} />
                    <Route path="/blog/:id" element={<BlogPostDetail />} />
                    <Route path="/blog/edit/:id" element={<EditBlogPost />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/wbs-creator" element={<WBSCreatorPage />} />
                    <Route path="/diary" element={<DiaryPage />} />
                    <Route path="/impulse-tracker" element={<ImpulseTrackerPage />} />
                    <Route path="/improvement-plan" element={<SiteImprovementPlan />} />
                    <Route path="/improvement-plan/detail" element={<ImprovementPlanDetail />} />
                    <Route path="/system-design" element={<SystemDesignDocuments />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/improvement-implementation/:projectId"
                      element={<ImprovementImplementation />}
                    />
                  </Route>
                  <Route path="/site-dev" element={<SiteDevWBS />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="/update-history" element={<UpdateHistoryPage />} />
                  <Route path="/abstinence" element={<AbstinenceManager />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Layout>
            </div>
          </ThemeProvider>
        </LocaleProvider>
      </AuthProvider>
    </Provider>
  );
}
