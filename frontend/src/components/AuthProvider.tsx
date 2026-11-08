import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, tokenStore } from "../services/api";
import { AuthContext } from "../hooks/useAuth";
import type { User } from "../types";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenStore.get());
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState<string | null>(null); // token yang sudah selesai diperiksa

  const logout = useCallback(() => { tokenStore.clear(); setToken(null); setUser(null); }, []);

  useEffect(() => {
    if (!token) return;
    api<User>("/api/auth/me").then(setUser).catch(logout).finally(() => setChecked(token));
  }, [token, logout]);

  useEffect(() => {
    window.addEventListener("unauthorized", logout);
    return () => window.removeEventListener("unauthorized", logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>("/api/auth/login", { email, password });
    tokenStore.set(r.token); setUser(r.user); setToken(r.token);
  }, []);

  const ready = !token || checked === token;
  const value = useMemo(() => ({ user, token, ready, login, logout }), [user, token, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}