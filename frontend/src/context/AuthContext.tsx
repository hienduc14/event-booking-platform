import { createContext, useContext, useMemo, useState } from "react";
import { loginAdmin } from "../api/admin";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "event_booking_admin_token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  async function login(username: string, password: string) {
    const result = await loginAdmin(username, password);
    localStorage.setItem(STORAGE_KEY, result.access_token);
    setToken(result.access_token);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

