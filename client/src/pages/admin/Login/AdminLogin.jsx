// client/src/pages/admin/Login/AdminLogin.jsx
import React, { useState } from "react";
import "./adminLogin.css";
import { useAdminAuth } from "../../../context/adminAuth.jsx";
import { useNavigate } from "react-router-dom";
import { getErrMsg } from "../../../lib/api.js";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gapp.local");
  const [password, setPassword] = useState("Admin12345!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/admin/products");
    } catch (err) {
      setError(getErrMsg(err, "Invalid credentials"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Hyr për të menaxhuar dyqanin.</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <div className="admin-login-error">{error}</div> : null}

          <button type="submit" disabled={submitting}>
            {submitting ? "Duke hyrë..." : "Identifikohu"}
          </button>
        </form>

        <div className="admin-login-hint">
          Nëse s’ke admin: hap <b>/api/auth/seed-admin</b> (vetëm lokal)
        </div>
      </div>
    </div>
  );
}
