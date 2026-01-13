// client/src/pages/User/Login/UserLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./userLogin.css";
import { useUserAuth } from "../../../context/userAuth.jsx";

export default function UserLogin() {
  const nav = useNavigate();
  const { login, err, setErr } = useUserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await login({ email, password });
      if (r?.ok) nav("/account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ul-wrap">
      <div className="ul-card">
        <div className="ul-head">
          <div className="ul-badge">User</div>
          <Link className="ul-back" to="/auth">
            ← Auth
          </Link>
        </div>

        <h1 className="ul-title">Hyr në llogari</h1>
        <p className="ul-sub">Shkruaj të dhënat për të hyrë si përdorues.</p>

        {err ? <div className="ul-error">{err}</div> : null}

        <form className="ul-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            autoComplete="email"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <button className="ul-btn" type="submit" disabled={busy}>
            {busy ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>

        <div className="ul-foot">
          S’ke llogari?{" "}
          <Link className="ul-link" to="/user/register">
            Regjistrohu
          </Link>
        </div>
      </div>
    </div>
  );
}
