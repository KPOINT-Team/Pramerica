import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getToken, logout as clearAuth } from '../services/authService.js';

const TOKEN_SERVICE_URL =
  import.meta.env.VITE_TOKEN_SERVICE_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

// null = checking, true = valid, false = not authenticated
// statusMsg = what's shown on the splash screen

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Initializing...');

  useEffect(() => {
    async function verify() {
      // Step 1: Check local token
      setStatusMsg('Checking session...');
      if (!isAuthenticated()) {
        setAuthed(false);
        return;
      }

      // Step 2: Verify with server
      setStatusMsg('Validating token...');
      try {
        const res = await fetch(`${TOKEN_SERVICE_URL}/api/health`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          setStatusMsg('Session verified');
          // Small delay so user sees "Session verified"
          await new Promise((r) => setTimeout(r, 400));
          setAuthed(true);
        } else {
          clearAuth();
          setAuthed(false);
        }
      } catch {
        // Server unreachable — trust local token expiry
        setStatusMsg('Offline mode');
        await new Promise((r) => setTimeout(r, 300));
        setAuthed(true);
      }
    }
    verify();
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    setAuthed(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => {
      if (!isAuthenticated()) {
        handleLogout();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [authed, handleLogout]);

  return (
    <AuthContext.Provider value={{ authed, setAuthed, statusMsg, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
