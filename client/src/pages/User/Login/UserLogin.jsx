import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../context/userAuth.jsx";
import "./userLogin.css";

export default function UserLogin() {
  const nav = useNavigate();
  const { login, err, setErr, loading } = useUserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const em = email.trim().toLowerCase();
    if (!em) return setErr("Shkruaj email.");
    if (!password) return setErr("Shkruaj fjalëkalimin.");

    setBusy(true);
    const res = await login({ email: em, password });
    setBusy(false);

    if (res?.ok) nav("/account");
  }

  return (
    <div className="ul-page">
      <div className="ul-card">
        <div className="ul-head">
          <h1>Identifikohu</h1>
          <p>Hyr në llogarinë tënde.</p>
        </div>

        {err ? <div className="ul-error">{err}</div> : null}

        <form className="ul-form" onSubmit={onSubmit}>
          <label className="ul-label">
            Email
            <input
              className="ul-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="p.sh. genci@email.com"
            />
          </label>

          <label className="ul-label">
            Fjalëkalimi
            <input
              className="ul-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          <button className="ul-btn ul-btn--primary" disabled={busy || loading} type="submit">
            {busy ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>

        <div className="ul-foot">
          S’ke llogari? <Link className="ul-link" to="/register">Regjistrohu</Link>
        </div>
      </div>
    </div>
  );
}
