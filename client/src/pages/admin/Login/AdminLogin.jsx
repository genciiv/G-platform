// client/src/pages/Admin/Login/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../../../context/adminAuth.jsx";
import "./adminLogin.css";

export default function AdminLogin() {
  const nav = useNavigate();
  const { isAdmin, login, err, setErr } = useAdminAuth();

  const [email, setEmail] = useState("admin@gapp.local");
  const [password, setPassword] = useState("admin123");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    if (isAdmin) nav("/admin", { replace: true });
  }, [isAdmin, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setLocalErr("");
    setErr("");

    const e1 = email.trim().toLowerCase();
    const p1 = password;

    if (!e1) return setLocalErr("Email është i detyrueshëm.");
    if (!p1) return setLocalErr("Password është i detyrueshëm.");

    setBusy(true);
    const res = await login({ email: e1, password: p1 });
    setBusy(false);

    if (res.ok) nav("/admin", { replace: true });
  }

  return (
    <div className="al-wrap">
      <div className="al-card">
        <h1>Admin Login</h1>
        <p>Hyr për të menaxhuar dyqanin.</p>

        {(localErr || err) ? (
          <div className="al-error">{localErr || err}</div>
        ) : null}

        <form onSubmit={onSubmit} className="al-form">
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button className="al-btn" disabled={busy} type="submit">
            {busy ? "Duke hyrë..." : "Identifikohu"}
          </button>
        </form>

        <div className="al-foot">
          <Link to="/auth" className="al-link">
            ← Kthehu te Hyr / Regjistrohu
          </Link>
        </div>

        <div className="al-hint">
          Nëse s’ke admin: hap <code>/api/auth/seed-admin</code> (vetëm lokal)
        </div>
      </div>
    </div>
  );
}
