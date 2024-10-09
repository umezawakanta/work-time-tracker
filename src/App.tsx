import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Layout from "@/components/layout/Layout";
import Home from "./pages/Home";
import WorkTimeEntryForm from "./components/forms/WorkTimeEntryForm";
import WorkTimeReports from "./pages/WorkTimeReports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { LocaleProvider } from "./context/LocaleContext";
import { AssetCalendarPage } from "./pages/AssetCalendarPage";
import ElectionCandidatesPage from "./pages/ElectionCandidatesPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import DistrictPage from "./pages/DistrictPage";
import SubscriptionManagementPage from "./pages/SubscriptionManagementPage";
import AssetLiabilityReportPage from "./pages/AssetLiabilityReportPage";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "@/hooks/useAuth";

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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LocaleProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/work-time" element={<WorkTimeEntryForm />} />
              <Route path="/work-time-reports" element={<WorkTimeReports />} />
              <Route
                path="/asset-liability-report"
                element={<AssetLiabilityReportPage />}
              />
              <Route
                path="/subscription-management"
                element={<SubscriptionManagementPage />}
              />
              <Route path="/asset-calendar" element={<AssetCalendarPage />} />
            </Route>
            <Route
              path="/election-candidates"
              element={<ElectionCandidatesPage />}
            />
            <Route
              path="/candidate-registration"
              element={<CandidateRegistrationPage />}
            />
            <Route
              path="/district/:prefecture/:district"
              element={<DistrictPage />}
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </LocaleProvider>
  );
}