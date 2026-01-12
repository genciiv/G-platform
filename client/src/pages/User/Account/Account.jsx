import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../../../context/userAuth.jsx";
import "./account.css";

export default function Account() {
  const nav = useNavigate();
  const { user, isUser, loading, refreshMe, logout } = useUserAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // sigurohu që /me të provohet kur futesh në account
    refreshMe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
    nav("/");
  }

  if (loading) {
    return (
      <div className="acc-page">
        <div className="acc-card">Loading...</div>
      </div>
    );
  }

  if (!isUser) {
    return (
      <div className="acc-page">
        <div className="acc-card">
          <h1>Llogaria</h1>
          <p>Nuk je i loguar.</p>
          <div className="acc-actions">
            <Link className="acc-btn acc-btn--primary" to="/login">
              Hyr
            </Link>
            <Link className="acc-btn" to="/register">
              Regjistrohu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const name = user?.name || "User";
  const email = user?.email || "-";

  return (
    <div className="acc-page">
      <div className="acc-card">
        <div className="acc-head">
          <h1>Account</h1>
          <p>Mirë se erdhe, <b>{name}</b></p>
        </div>

        <div className="acc-kv">
          <div className="acc-k">Emri</div>
          <div className="acc-v">{name}</div>

          <div className="acc-k">Email</div>
          <div className="acc-v">{email}</div>
        </div>

        <div className="acc-actions">
          <Link className="acc-btn" to="/track">
            Gjurmim porosie
          </Link>

          <button className="acc-btn acc-btn--danger" onClick={onLogout} disabled={busy}>
            {busy ? "Duke dalë..." : "Dil"}
          </button>
        </div>
      </div>
    </div>
  );
}
