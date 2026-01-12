// client/src/context/userAuth.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http, getErrMsg } from "../lib/api.js";

const Ctx = createContext(null);

function normalizeUser(u) {
  if (!u) return null;
  const _id = u._id || u.id; // ✅ prano të dyja
  if (!_id) return null;
  return { ...u, _id };
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null); // { _id, name, email }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refreshMe() {
    setErr("");
    try {
      const res = await http.get("/api/userauth/me");
      const raw = res.data?.user || res.data?.item || res.data || null;
      const u = normalizeUser(raw);
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, email, password }) {
    setErr("");
    try {
      await http.post("/api/userauth/register", { name, email, password });
      await refreshMe();
      return { ok: true };
    } catch (e) {
      const msg = getErrMsg(e, "Register failed");
      setErr(msg);
      return { ok: false, message: msg };
    }
  }

  async function login({ email, password }) {
    setErr("");
    try {
      await http.post("/api/userauth/login", { email, password });
      await refreshMe();
      return { ok: true };
    } catch (e) {
      const msg = getErrMsg(e, "Login failed");
      setErr(msg);
      return { ok: false, message: msg };
    }
  }

  async function logout() {
    setErr("");
    try {
      await http.post("/api/userauth/logout");
    } catch {
      // ok
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      isUser: !!user,
      isLoggedIn: !!user,
      loading,
      err,
      setErr,
      refreshMe,
      register,
      login,
      logout,
    }),
    [user, loading, err]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
