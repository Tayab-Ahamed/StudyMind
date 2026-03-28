import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("sm_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("sm_token");
    if (!token) { setLoading(false); return; }
    getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.removeItem("sm_token"); localStorage.removeItem("sm_user"); })
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = useCallback((token, userData) => {
    localStorage.setItem("sm_token", token);
    localStorage.setItem("sm_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sm_token");
    localStorage.removeItem("sm_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
