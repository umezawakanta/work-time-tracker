import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import WorkTimeTracker from "./components/WorkTimeTracker";
import "./styles/global.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work-time" element={<WorkTimeTracker />} />
      </Routes>
    </Layout>
  );
}

export default App;
