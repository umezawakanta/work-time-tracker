import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Layout from "@/components/layout/Layout";
import Home from "./pages/Home";
import WorkTimeEntryForm from "./components/forms/WorkTimeEntryForm";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { LocaleProvider } from "./context/LocaleContext";
import { AssetCalendarPage } from "./pages/AssetCalendarPage";
import ElectionCandidatesPage from "./pages/ElectionCandidatesPage";
// import PrivateRoute from "./components/PrivateRoute";

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
    <LocaleProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/work-time" element={<WorkTimeEntryForm />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/asset-calendar" element={<AssetCalendarPage />} />
            <Route
              path="/election-candidates"
              element={<ElectionCandidatesPage />}
            />
            {/* <Route element={<PrivateRoute />}>
              <Route path="/work-time" element={<WorkTimeEntryForm />} />
              <Route path="/reports" element={<Reports />} />
            </Route> */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </LocaleProvider>
  );
}
