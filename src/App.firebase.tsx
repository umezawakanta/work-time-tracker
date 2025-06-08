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
import TaskManagementPage from './pages/TaskManagementPage';

// Material-UI テーマの設定
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
                    <Route path="profile" element={<UserProfile />} />

                    {/* ダッシュボード */}
                    <Route path="dashboard" element={<IntegratedDashboard />} />
                    {/* <Route path="improvement" element={<ImprovementImplementation />} /> */}

                    {/* 資産管理 */}
                    <Route path="asset-calendar" element={<AssetCalendarPage />} />
                    <Route path="asset-liability-report" element={<AssetLiabilityReportPage />} />

                    {/* 選挙・政治 */}
                    <Route path="election/candidates" element={<ElectionCandidatesPage />} />
                    <Route path="election/register" element={<CandidateRegistrationPage />} />
                    <Route path="election/district/:districtId" element={<DistrictPage />} />
                    <Route path="political-trends" element={<PoliticalTrends />} />

                    {/* サブスクリプション */}
                    <Route path="subscription" element={<SubscriptionManagementPage />} />
                    <Route path="subscription/upgrade" element={<SubscriptionUpgradePage />} />
                    <Route path="subscription/billing" element={<BillingHistoryPage />} />

                    {/* エンターテイメント */}
                    <Route path="bookshelf" element={<BookShelfPage />} />
                    <Route path="sleep-tracker" element={<SleepTrackerPage />} />
                    <Route path="impulse-tracker" element={<ImpulseTrackerPage />} />
                    <Route path="guitar-practice" element={<GuitarPracticePage />} />

                    {/* ブログ */}
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/new" element={<NewBlogPost />} />
                    <Route path="blog/:id" element={<BlogPostDetail />} />
                    <Route path="blog/edit/:id" element={<EditBlogPost />} />

                    {/* プロジェクト管理 */}
                    <Route path="wbs" element={<WBSCreatorPage />} />

                    {/* SNS */}
                    <Route path="twitter" element={<TwitterPage />} />

                    {/* カレンダー */}
                    <Route path="calendar" element={<CalendarPage />} />

                    {/* 日記 */}
                    <Route path="diary" element={<DiaryPage />} />

                    {/* 新しいタスク管理ページ */}
                    <Route path="tasks" element={<TaskManagementPage />} />
                  </Route>
                </Route>

                {/* 古いログインルートのリダイレクト */}
                <Route path="/login" element={<Navigate to="/firebase-login" replace />} />

                {/* 404ページ */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Toast通知 */}
              <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
            </div>
          </FirebaseAuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
