import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";

const AdminAuthCtx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email, password) {
    const res = await api.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  const value = { user, loading, login, logout, refresh };
  return (
    <AdminAuthCtx.Provider value={value}>{children}</AdminAuthCtx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthCtx);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
