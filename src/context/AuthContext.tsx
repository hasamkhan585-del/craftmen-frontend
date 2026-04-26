"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AuthAddress {
  first_name?: string;
  last_name?:  string;
  company?:    string;
  email?:      string;
  phone?:      string;
  address_1?:  string;
  address_2?:  string;
  city?:       string;
  state?:      string;
  postcode?:   string;
  country?:    string;
}

export interface AuthUser {
  id:          number;
  email:       string;
  username:    string;
  displayName: string;
  firstName:   string;
  lastName:    string;
  avatarUrl:   string;
  role:        string;
  billing?:    AuthAddress;
  shipping?:   AuthAddress;
}

interface AuthContextValue {
  user:         AuthUser | null;
  token:        string;
  loading:      boolean;
  error:        string | null;
  login:        (username: string, password: string) => Promise<boolean>;
  register:     (data: RegisterData) => Promise<boolean>;
  logout:       () => void;
  clearError:   () => void;
  refreshUser:  () => Promise<void>;
}

export interface RegisterData {
  username:   string;
  email:      string;
  password:   string;
  first_name: string;
  last_name:  string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "wp_jwt_token";

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Load token from localStorage on mount, then hydrate user
  const hydrateUser = useCallback(async (jwt: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: "no-store",
      });
      if (!res.ok) { localStorage.removeItem(TOKEN_KEY); setToken(""); setUser(null); return; }
      const u: AuthUser = await res.json();
      setUser(u);
      setToken(jwt);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      hydrateUser(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [hydrateUser]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid credentials."); return false; }

      localStorage.setItem(TOKEN_KEY, data.token);
      await hydrateUser(data.token);
      return true;
    } catch {
      setError("Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [hydrateUser]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) { setError(body.message || "Registration failed."); return false; }

      // Auto-login after registration
      const ok = await login(data.username, data.password);
      return ok;
    } catch {
      setError("Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setError(null);
  }, []);

  /** Re-fetch user profile + WC billing/shipping and update context state. */
  const refreshUser = useCallback(async () => {
    const jwt = token || localStorage.getItem(TOKEN_KEY);
    if (!jwt) return;
    await hydrateUser(jwt);
  }, [token, hydrateUser]);

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout, clearError: () => setError(null),
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
