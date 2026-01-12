import React, { createContext, useContext, useEffect, useState } from "react";
import { http, getErrMsg } from "../lib/api.js";

const Ctx = createContext(null);

function normalizeUser(data) {
  const u = data?.user || data?.item || data || null;
  if (!u) return null;

  // serveri yt kthen { user: { id, name, email } }
  const id = u._id || u.id;
  if (!id) return null;

  return {
    _id: id, // e mbajmë si _id që UI të jetë konsistente
    name: u.name || "",
    email: u.email || "",
  };
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null); // { _id, name, email }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refreshMe() {
    setErr("");
    try {
      const res = await http.get("/api/userauth/me");
      const nu = normalizeUser(res.data);
      setUser(nu);
      return nu;
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
      const res = await http.post("/api/userauth/register", {
        name,
        email,
        password,
      });

      // disa servera kthejnë user në response, por prap e sinkronizojmë me /me
      const nu = normalizeUser(res.data);
      if (nu) setUser(nu);
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
      const res = await http.post("/api/userauth/login", { email, password });

      const nu = normalizeUser(res.data);
      if (nu) setUser(nu);
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
      // edhe nese s’punon logout route, e pastrojmë state
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
