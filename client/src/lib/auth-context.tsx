"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api, setAccessToken, tryRefresh } from "./api";
import { AuthUser, Role } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    companyName?: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply each dashboard user's saved appearance preference on every page,
  // not only after visiting the Settings screen.
  useEffect(() => {
    const settingsPath = user?.role === "student" ? "/api/student/settings" : user?.role === "agency" ? "/api/agency/settings" : null;
    if (!settingsPath) return;
    api
      .get<{ displayMode: "light" | "dark"; language: string }>(settingsPath)
      .then(({ displayMode, language }) => {
        document.documentElement.classList.toggle("dark", displayMode === "dark");
        document.documentElement.lang = language.split("-")[0] || "en";
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.get<AuthUser>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await tryRefresh();
      if (ok) {
        await refreshUser();
      }
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string, role: Role) => {
    const res = await api.post<{ accessToken: string; user: AuthUser }>(
      "/api/auth/login",
      { email, password, role },
      { auth: false }
    );
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; fullName: string; role: Role; companyName?: string }) => {
      const res = await api.post<{ accessToken: string; user: AuthUser }>("/api/auth/register", data, {
        auth: false,
      });
      setAccessToken(res.accessToken);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
