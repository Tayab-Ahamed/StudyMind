import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import DashboardPage from "./pages/DashboardPage";
import { Spinner } from "./components/ui";

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center animate-pulse-brand shadow-glow-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <Spinner size="md" className="text-brand-500" />
        </div>
      </div>
    );
  }
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/"       element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="*"       element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
