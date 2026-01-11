// client/src/pages/Auth/UserLogin.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/userAuth.jsx";
import "./userAuth.css";

export default function UserLogin() {
  const nav = useNavigate();
  const { login } = useUserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login({ email, password });
      nav("/account");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ua-wrap">
      <div className="ua-card">
        <h1>Hyr si klient</h1>
        <p>Hyr për të parë profilin dhe porositë.</p>

        {err ? <div className="ua-error">{err}</div> : null}

        <form className="ua-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Fjalëkalim</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="ua-btn" disabled={busy} type="submit">
            {busy ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>

        <div className="ua-foot">
          S’ke llogari? <Link to="/register">Regjistrohu</Link>
        </div>
      </div>
    </div>
  );
}
