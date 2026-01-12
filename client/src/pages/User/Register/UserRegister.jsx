import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../context/userAuth.jsx";
import "./userRegister.css";

export default function UserRegister() {
  const nav = useNavigate();
  const { register, err, setErr, loading } = useUserAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const n = name.trim();
    const em = email.trim().toLowerCase();
    const pw = password;

    if (!n) return setErr("Shkruaj emrin.");
    if (!em) return setErr("Shkruaj email.");
    if (!pw || pw.length < 6) return setErr("Fjalëkalimi minimum 6 karaktere.");
    if (pw !== password2) return setErr("Fjalëkalimet nuk përputhen.");

    setBusy(true);
    const res = await register({ name: n, email: em, password: pw });
    setBusy(false);

    if (res?.ok) nav("/account");
  }

  return (
    <div className="ua-page">
      <div className="ua-card">
        <div className="ua-head">
          <h1>Regjistrohu</h1>
          <p>Krijo llogarinë tënde.</p>
        </div>

        {err ? <div className="ua-error">{err}</div> : null}

        <form className="ua-form" onSubmit={onSubmit}>
          <label className="ua-label">
            Emri
            <input
              className="ua-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="p.sh. Genci Vaqo"
            />
          </label>

          <label className="ua-label">
            Email
            <input
              className="ua-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="p.sh. genci@email.com"
            />
          </label>

          <label className="ua-label">
            Fjalëkalimi
            <input
              className="ua-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="min 6 karaktere"
            />
          </label>

          <label className="ua-label">
            Përsërite fjalëkalimin
            <input
              className="ua-input"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
              placeholder="përsërite"
            />
          </label>

          <button className="ua-btn ua-btn--primary" disabled={busy || loading} type="submit">
            {busy ? "Duke krijuar..." : "Krijo llogari"}
          </button>
        </form>

        <div className="ua-foot">
          Ke llogari? <Link className="ua-link" to="/login">Hyr</Link>
        </div>
      </div>
    </div>
  );
}
