// client/src/pages/admin/Login/AdminLogin.jsx
import React, { useState } from "react";
import "./adminLogin.css";
import { useAdminAuth } from "../../../context/adminAuth.jsx";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gapp.local");
  const [password, setPassword] = useState("Admin12345!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ KJO eshte e sakta (objekt)
      await login({ email: email.trim(), password });
      navigate("/admin/products");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Hyr për të menaxhuar dyqanin.</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error ? <div className="admin-login-error">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Duke u futur..." : "Identifikohu"}
          </button>
        </form>

        <div className="admin-login-hint">
          Nëse s’ke admin: hap <b>http://localhost:5000/api/auth/seed-admin</b> (vetëm lokal)
        </div>
      </div>
    </div>
  );
}
