import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from '@/components/layout/Layout';
import Home from './pages/Home';
import WorkTimeEntryForm from './components/forms/WorkTimeEntryForm';
import WorkTimeReports from './pages/WorkTimeReports';
import NotFound from './pages/NotFound';
import FirebaseLogin from './pages/FirebaseLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { LocaleProvider } from './context/LocaleContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
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
import FirebasePrivateRoute from './components/FirebasePrivateRoute';
import WBSCreatorPage from './pages/WBSCreatorPage';
import TwitterPage from './pages/TwitterPage';
import PoliticalTrends from './pages/PoliticalTrends';
import CalendarPage from './pages/CalendarPage';
import DiaryPage from './pages/DiaryPage';
import ImpulseTrackerPage from './pages/ImpulseTrackerPage';
import GuitarPracticePage from './pages/GuitarPracticePage';
import IntegratedDashboard from './pages/IntegratedDashboard';
// import ImprovementImplementation from './pages/ImprovementImplementation';
import WorkTimeEntry from './pages/WorkTimeEntry';
import SubscriptionUpgradePage from './pages/subscription/SubscriptionUpgradePage';
import BillingHistoryPage from './pages/subscription/BillingHistoryPage';
// TaskManagementPage is not present; route disabled for now
// import TaskManagementPage from './pages/TaskManagementPage';
import QuadrantDashboard from './pages/QuadrantDashboard';
import SitemapPage from './pages/SitemapPage';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <LocaleProvider>
          <FirebaseAuthProvider>
            <div className="App">
              <Routes>
                {/* 公開ルート */}
                <Route path="/firebase-login" element={<FirebaseLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* 保護されたルート */}
                <Route element={<FirebasePrivateRoute />}>
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <div />
                      </Layout>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="worktime-entry" element={<WorkTimeEntry />} />
                    <Route path="worktime-form" element={<WorkTimeEntryForm />} />
                    <Route path="reports" element={<WorkTimeReports />} />
                    {/* <Route path="task-management" element={<TaskManagementPage />} /> */}
                    <Route path="quadrant-dashboard" element={<QuadrantDashboard />} />
                    <Route path="sitemap" element={<SitemapPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="diary" element={<DiaryPage />} />
                    <Route path="impulse-tracker" element={<ImpulseTrackerPage />} />
                    <Route path="guitar-practice" element={<GuitarPracticePage />} />
                    <Route path="integrated-dashboard" element={<IntegratedDashboard />} />
                    {/* <Route
                      path="improvement-implementation"
                      element={<ImprovementImplementation />}
                    /> */}
                    <Route path="asset-calendar" element={<AssetCalendarPage />} />
                    <Route path="election-candidates" element={<ElectionCandidatesPage />} />
                    <Route path="candidate-registration" element={<CandidateRegistrationPage />} />
                    <Route path="district/:id" element={<DistrictPage />} />
                    <Route path="subscription" element={<SubscriptionManagementPage />} />
                    <Route path="subscription-upgrade" element={<SubscriptionUpgradePage />} />
                    <Route path="billing-history" element={<BillingHistoryPage />} />
                    <Route path="asset-liability-report" element={<AssetLiabilityReportPage />} />
                    <Route path="bookshelf" element={<BookShelfPage />} />
                    <Route path="sleep-tracker" element={<SleepTrackerPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/new" element={<NewBlogPost />} />
                    <Route path="blog/:id" element={<BlogPostDetail />} />
                    <Route path="blog/edit/:id" element={<EditBlogPost />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="wbs-creator" element={<WBSCreatorPage />} />
                    <Route path="twitter" element={<TwitterPage />} />
                    <Route path="political-trends" element={<PoliticalTrends />} />
                  </Route>
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '14px',
                },
                success: {
                  style: {
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                  },
                },
                error: {
                  style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  },
                },
              }}
            />
          </FirebaseAuthProvider>
        </LocaleProvider>
      </div>
    </Provider>
  );
}

export default App;
