// client/src/context/adminAuth.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { http } from "../lib/api.js";

const AdminAuthContext = createContext(null);

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
  }, []);

  // pranon: login({email,password}) OSE login(email,password)
  const login = async (a, b) => {
    const email = typeof a === "object" ? a.email : a;
    const password = typeof a === "object" ? a.password : b;

    const res = await http.post("/api/auth/login", { email, password });
    const user = res.data?.user || res.data?.admin || null;
    setAdmin(user);

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
    }),
    [admin, loading]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
