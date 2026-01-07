import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setAdmin(data?.admin || data?.user || null);
    } catch (err) {
      // ✅ 401 = jo i loguar -> s’është problem
      if (err?.response?.status === 401) {
        setAdmin(null);
      } else {
        console.error("auth/me error:", err?.message);
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async ({ email, password }) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setAdmin(data?.admin || data?.user || null);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setAdmin(null);
    }
  };

  const value = useMemo(
    () => ({ admin, loading, login, logout, refresh: fetchMe }),
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
