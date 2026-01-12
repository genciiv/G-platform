// client/src/context/adminAuth.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../lib/api.js";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      await http.get("/api/auth/me");
      setIsAdmin(true);
      return true;
    } catch (e) {
      // ✅ 401/403 = thjesht nuk je admin (MOS e trajto si error)
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      isAdmin,
      loading,
      refreshMe,
    }),
    [isAdmin, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
