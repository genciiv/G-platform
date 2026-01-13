// client/src/pages/Admin/Login/AdminLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./adminLogin.css";
import { useAdminAuth } from "../../../context/adminAuth.jsx";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@gapp.local");
  const [password, setPassword] = useState("Admin12345!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      // kujdes: te adminAuth zakonisht login pret object {email,password}
      await login({ email, password });
      nav("/admin");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="al-head">
          <div className="al-badge">Admin</div>
          <Link className="al-back" to="/auth">
            ← Auth
          </Link>
        </div>

        <h1>Admin Login</h1>
        <p>Hyr për të menaxhuar dyqanin.</p>

        {error ? <div className="admin-login-error">{error}</div> : null}

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={busy}>
            {busy ? "Duke hyrë..." : "Identifikohu"}
          </button>
        </form>

        <div className="admin-login-hint">
          Nëse s’ke admin: hap <b>/api/auth/seed-admin</b> (vetëm lokal)
        </div>
      </div>
    </div>
  );
}
