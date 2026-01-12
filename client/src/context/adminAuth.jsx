// client/src/context/adminAuth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { http, getErrMsg } from "../lib/api.js";

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); // { id/_id, email, role }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refreshMe() {
    setErr("");
    try {
      const res = await http.get("/api/auth/me");
      const a = res.data?.admin || res.data?.user || res.data?.item || res.data || null;

      const id = a?._id || a?.id;
      if (id) {
        setAdmin({ ...a, _id: a._id || a.id, id: a.id || a._id });
        return a;
      }

      setAdmin(null);
      return null;
    } catch {
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function login({ email, password }) {
    setErr("");
    try {
      await http.post("/api/auth/login", { email, password });
      await refreshMe();
      return { ok: true };
    } catch (e) {
      const msg = getErrMsg(e, "Admin login failed");
      setErr(msg);
      return { ok: false, message: msg };
    }
  }

  async function logout() {
    setErr("");
    try {
      await http.post("/api/auth/logout");
    } catch {
      // edhe nëse s’ka logout route, s’ka problem
    } finally {
      setAdmin(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    admin,
    isAdmin: !!admin,
    loading,
    err,
    setErr,
    refreshMe,
    login,
    logout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
