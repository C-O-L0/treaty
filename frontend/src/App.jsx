import { Routes, Route, Link } from "react-router-dom";
import SubmissionPage from "./pages/SubmissionPage";
import DashboardPage from "./pages/DashboardPage";
import "./App.css";

function App() {
  return (
    <>
      <nav className="main-nav">
        <Link to="/">Submission</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<SubmissionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
