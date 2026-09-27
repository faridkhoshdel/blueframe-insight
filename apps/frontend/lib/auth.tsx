"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from '@/lib/api';
import { getHomePath, Role } from "./authRedirect";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; homePath?: string }>;
  register: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string; homePath?: string }>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (accessToken: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const profile = await res.json();
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as Role,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.message || "ورود ناموفق بود" };
      }

      const data = await res.json();
      const accessToken = data.accessToken;

      const profile = await fetchProfile(accessToken);
      if (!profile) {
        return { success: false, error: "خطا در دریافت پروفایل" };
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(profile));
      setToken(accessToken);
      setUser(profile);

      return { success: true, homePath: getHomePath(profile.role) };
    } catch (e) {
      return { success: false, error: "خطا در ارتباط با سرور" };
    }
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    const finalRole = role || "SALES";
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role: finalRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        return { success: false, error: error.message || "ثبت‌نام ناموفق بود" };
      }

      const data = await res.json();
      const accessToken = data.accessToken;

      const profile = await fetchProfile(accessToken);
      if (!profile) {
        return { success: false, error: "خطا در دریافت پروفایل" };
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(profile));
      setToken(accessToken);
      setUser(profile);

      return { success: true, homePath: getHomePath(profile.role) };
    } catch (e) {
      return { success: false, error: "خطا در ارتباط با سرور" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        hasRole,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
