import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./userAuth.css";
import { useUserAuth } from "../../context/userAuth.jsx";

export default function Register() {
  const nav = useNavigate();
  const { register, err, setErr, isUser } = useUserAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);

  if (isUser) {
    // nëse është logged, ktheje te home
    // (mos përdor Navigate këtu, s'do të futemi në loop)
    setTimeout(() => nav("/"), 0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Vendos emrin.");
    if (!email.trim()) return setErr("Vendos email.");
    if (!pass.trim() || pass.length < 6) return setErr("Password min 6 karaktere.");
    if (pass !== pass2) return setErr("Password-et nuk përputhen.");

    setBusy(true);
    const r = await register({
      name: name.trim(),
      email: email.trim(),
      password: pass,
    });
    setBusy(false);

    if (r.ok) nav("/");
  }

  return (
    <div className="ua-wrap">
      <div className="ua-card">
        <h1>Regjistrohu</h1>
        <p className="ua-sub">Krijo llogari si përdorues.</p>

        {err ? <div className="ua-error">{err}</div> : null}

        <form className="ua-form" onSubmit={onSubmit}>
          <label>Emri</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Password</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <label>Rikthe Password</label>
          <input
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
          />

          <button className="ua-btn ua-btn--primary" disabled={busy} type="submit">
            {busy ? "Duke u regjistruar..." : "Regjistrohu"}
          </button>
        </form>

        <div className="ua-foot">
          Ke llogari? <Link to="/login">Hyr</Link>
        </div>
      </div>
    </div>
  );
}
