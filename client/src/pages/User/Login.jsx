import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./userAuth.css";
import { useUserAuth } from "../../context/userAuth.jsx";

export default function Login() {
  const nav = useNavigate();
  const { login, err, setErr, isUser } = useUserAuth();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  if (isUser) {
    setTimeout(() => nav("/"), 0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!email.trim()) return setErr("Vendos email.");
    if (!pass.trim()) return setErr("Vendos password.");

    setBusy(true);
    const r = await login({ email: email.trim(), password: pass });
    setBusy(false);

    if (r.ok) nav("/");
  }

  return (
    <div className="ua-wrap">
      <div className="ua-card">
        <h1>Hyr</h1>
        <p className="ua-sub">Hyr si përdorues.</p>

        {err ? <div className="ua-error">{err}</div> : null}

        <form className="ua-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button className="ua-btn ua-btn--primary" disabled={busy} type="submit">
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
