import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import WorkTimeTracker from "./components/WorkTimeTracker";
import Reports from "./pages/Reports";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work-time" element={<WorkTimeTracker />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Layout>
  );
}

export default App;
