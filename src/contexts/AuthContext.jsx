import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, logout as clearAuth } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthed(false);
  }, []);

  // Periodically check token expiry
  useEffect(() => {
    const interval = setInterval(() => {
      if (authed && !isAuthenticated()) {
        handleLogout();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [authed, handleLogout]);

  return (
    <AuthContext.Provider value={{ authed, setAuthed, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
