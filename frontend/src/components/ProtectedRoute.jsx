import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  // If user is not authenticated, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the children components
  return children;
}

export default ProtectedRoute;
