// client/src/context/adminAuth.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const http = axios.create({
  baseURL: API,
  withCredentials: true, // nese serveri perdor cookie
});

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const res = await http.get("/api/auth/me");
      const user = res.data?.user || res.data?.admin || res.data || null;
      setAdmin(user);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ email, password }) => {
    const res = await http.post("/api/auth/login", { email, password });
    const user = res.data?.user || res.data?.admin || res.data || null;
    setAdmin(user);

    // sinkronizo statusin (sidomos nese auth eshte me cookie)
    await refreshMe();
    return res.data;
  };

  const logout = async () => {
    try {
      await http.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      setAdmin(null);
    }
  };

  const value = useMemo(
    () => ({
      admin,
      isAdmin: !!admin,
      loading,
      login,
      logout,
      refreshMe,
      apiBase: API,
    }),
    [admin, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
