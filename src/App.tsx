import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import WorkTimeEntryForm from "./components/forms/WorkTimeEntryForm";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
// import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/work-time" element={<WorkTimeEntryForm />} />
        <Route path="/reports" element={<Reports />} />
        {/* <Route element={<PrivateRoute />}>
          <Route path="/work-time" element={<WorkTimeEntryForm />} />
          <Route path="/reports" element={<Reports />} />
        </Route> */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  );
}
export default App;
