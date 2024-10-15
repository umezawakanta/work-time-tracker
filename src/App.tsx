import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from "@/components/layout/Layout";
import Home from "./pages/Home";
import WorkTimeEntryForm from "./components/forms/WorkTimeEntryForm";
import WorkTimeReports from "./pages/WorkTimeReports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { LocaleProvider } from "./context/LocaleContext";
import { AuthProvider } from "./context/AuthContext";
import { AssetCalendarPage } from "./pages/AssetCalendarPage";
import ElectionCandidatesPage from "./pages/ElectionCandidatesPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import DistrictPage from "./pages/DistrictPage";
import SubscriptionManagementPage from "./pages/SubscriptionManagementPage";
import AssetLiabilityReportPage from "./pages/AssetLiabilityReportPage";
import BookShelfPage from "./pages/BookShelfPage";
import SleepTrackerPage from "./pages/SleepTrackerPage";
import BlogPage from "./pages/BlogPage";
import NewBlogPost from "./pages/NewBlogPost";
import BlogPostDetail from "./pages/BlogPostDetail";
import EditBlogPost from "./pages/EditBlogPost";
import UserProfile from "./pages/UserProfile";
import PrivateRoute from "./components/PrivateRoute";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <LocaleProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster position="top-right" />
            <Layout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/election-candidates" element={<ElectionCandidatesPage />} />
                <Route path="/candidate-registration" element={<CandidateRegistrationPage />} />
                <Route path="/district/:prefecture/:district" element={<DistrictPage />} />
                <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/work-time" element={<WorkTimeEntryForm />} />
                  <Route path="/work-time-reports" element={<WorkTimeReports />} />
                  <Route path="/asset-liability-report" element={<AssetLiabilityReportPage />} />
                  <Route path="/subscription-management" element={<SubscriptionManagementPage />} />
                  <Route path="/asset-calendar" element={<AssetCalendarPage />} />
                  <Route path="/bookshelf" element={<BookShelfPage />} />
                  <Route path="/sleep-tracker" element={<SleepTrackerPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/new" element={<NewBlogPost />} />
                  <Route path="/blog/:id" element={<BlogPostDetail />} />
                  <Route path="/blog/edit/:id" element={<EditBlogPost />} />
                  <Route path="/profile" element={<UserProfile />} />
                </Route>
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Layout>
          </ThemeProvider>
        </LocaleProvider>
      </AuthProvider>
    </Provider>
  );
}