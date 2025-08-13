import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const user = token ? jwtDecode(token) : null;

  const signup = async (email, password, company) => {
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, company }),
      });
      if (!response.ok) {
        throw new Error("Failed to sign up");
      }
      return await response.json();
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to log in");
      }
      const { token } = await response.json();
      localStorage.setItem("token", token);
      setToken(token);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider
      value={{ user, token, signup, login, logout, authHeader }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
