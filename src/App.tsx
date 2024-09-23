import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import WorkTimeTracker from "./components/WorkTimeTracker";
import "./App.css";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <WorkTimeTracker />
    </Layout>
  );
}

export default App;
