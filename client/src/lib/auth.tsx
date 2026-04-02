import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { SafeUser, Subscription } from "@shared/schema";
import { apiRequest } from "./queryClient";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

function getTokenFromHash(): string | null {
  const hash = window.location.hash.slice(1) || "/";
  const qIndex = hash.indexOf("?");
  if (qIndex >= 0) {
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    return params.get("token");
  }
  return null;
}

interface AuthState {
  token: string | null;
  user: SafeUser | null;
  subscription: Subscription | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    subscription: null,
    loading: true,
  });

  // Extract token from URL hash on mount and on hash changes
  useEffect(() => {
    function checkToken() {
      const token = getTokenFromHash();
      if (token && token !== state.token) {
        setState((s) => ({ ...s, token }));
      } else if (!token && !state.token) {
        setState((s) => ({ ...s, loading: false }));
      }
    }
    checkToken();
    window.addEventListener("hashchange", checkToken);
    return () => window.removeEventListener("hashchange", checkToken);
  }, []);

  // When token changes, fetch user
  useEffect(() => {
    if (!state.token) return;
    fetchMe(state.token);
  }, [state.token]);

  async function fetchMe(token: string) {
    try {
      const res = await apiRequest("GET", `/api/auth/me?token=${token}`);
      const data = await res.json();
      setState({
        token,
        user: data.user,
        subscription: data.subscription,
        loading: false,
      });
    } catch {
      setState({ token: null, user: null, subscription: null, loading: false });
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Erreur de connexion");
    }
    window.location.hash = `#/dashboard?token=${data.token}`;
    setState({
      token: data.token,
      user: data.user,
      subscription: null,
      loading: false,
    });
    await fetchMe(data.token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }
    window.location.hash = `#/dashboard?token=${data.token}`;
    setState({
      token: data.token,
      user: data.user,
      subscription: null,
      loading: false,
    });
    await fetchMe(data.token);
  }, []);

  const logout = useCallback(async () => {
    if (state.token) {
      try {
        await apiRequest("POST", `/api/auth/logout?token=${state.token}`);
      } catch {
        // ignore
      }
    }
    setState({ token: null, user: null, subscription: null, loading: false });
    window.location.hash = "#/";
  }, [state.token]);

  const refreshUser = useCallback(async () => {
    if (state.token) {
      await fetchMe(state.token);
    }
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
