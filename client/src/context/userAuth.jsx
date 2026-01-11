// client/src/context/userAuth.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const UserAuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const httpUser = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const refreshMe = async () => {
    try {
      const res = await httpUser.get("/api/userauth/me");
      setUser(res.data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async ({ name, email, password }) => {
    const res = await httpUser.post("/api/userauth/register", {
      name,
      email,
      password,
    });
    setUser(res.data?.user || null);
    await refreshMe();
    return res.data;
  };

  const login = async ({ email, password }) => {
    const res = await httpUser.post("/api/userauth/login", { email, password });
    setUser(res.data?.user || null);
    await refreshMe();
    return res.data;
  };

  const logout = async () => {
    try {
      await httpUser.post("/api/userauth/logout");
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isUser: !!user,
      loadingUser,
      register,
      login,
      logout,
      refreshMe,
    }),
    [user, loadingUser]
  );

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
