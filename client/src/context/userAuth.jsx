import React, { createContext, useContext, useEffect, useState } from "react";
import { http, getErrMsg } from "../lib/api.js";

const Ctx = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null); // { _id, name, email }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refreshMe() {
    setErr("");
    try {
      const res = await http.get("/api/userauth/me");
      const u = res.data?.user || res.data?.item || res.data || null;
      setUser(u && u._id ? u : null);
      return u && u._id ? u : null;
    } catch (e) {
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

      // shumë servera nuk kthejnë user në response, vetëm vendosin cookie
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

      // rifresko user nga /me
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
      // nëse e ke route logout në server
      await http.post("/api/userauth/logout");
    } catch {
      // nëse s’ke logout route, s’ka problem
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    isUser: !!user,
    loading,
    err,
    setErr,
    refreshMe,
    register,
    login,
    logout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUserAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUserAuth must be used inside UserAuthProvider");
  return ctx;
}
