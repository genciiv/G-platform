import React, { createContext, useContext, useEffect, useState } from "react";
import { http } from "../lib/api.js";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshMe() {
    try {
      await http.get("/api/auth/me");
      setIsAdmin(true);
    } catch (e) {
      // 401 = thjesht jo admin, mos e trajto si error
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{ isAdmin, loading, refreshMe }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
