// client/src/pages/Auth/UserRegister.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/userAuth.jsx";
import "./userAuth.css";

export default function UserRegister() {
  const nav = useNavigate();
  const { register } = useUserAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await register({ name, email, password });
      nav("/account");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ua-wrap">
      <div className="ua-card">
        <h1>Regjistrohu</h1>
        <p>Krijo llogari për të bërë porosi më shpejt.</p>

        {err ? <div className="ua-error">{err}</div> : null}

        <form className="ua-form" onSubmit={onSubmit}>
          <label>Emri</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <label>Fjalëkalim (min 6)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="ua-btn" disabled={busy} type="submit">
            {busy ? "Duke krijuar..." : "Krijo llogarinë"}
          </button>
        </form>

        <div className="ua-foot">
          Ke llogari? <Link to="/login">Hyr</Link>
        </div>
      </div>
    </div>
  );
}
