import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import SubmissionPage from "./pages/SubmissionPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import "./App.css";

function App() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page on logout
  };

  return (
    <>
      <nav className="main-nav">
        <div>
          <Link to="/">Home</Link>
          {token && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <div>
          {!token ? (
            <>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-btn">
              Log Out
            </button>
          )}
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/submit" element={<SubmissionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
