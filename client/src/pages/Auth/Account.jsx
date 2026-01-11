// client/src/pages/Auth/Account.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUserAuth } from "../../context/userAuth.jsx";
import "./account.css";

export default function Account() {
  const { user, isUser, loadingUser, logout } = useUserAuth();

  if (loadingUser) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!isUser) return <Navigate to="/login" replace />;

  return (
    <div className="acc-wrap">
      <div className="acc-card">
        <h1>Llogaria ime</h1>

        <div className="acc-row">
          <div className="acc-k">Emri</div>
          <div className="acc-v">{user?.name}</div>
        </div>

        <div className="acc-row">
          <div className="acc-k">Email</div>
          <div className="acc-v">{user?.email}</div>
        </div>

        <button className="acc-btn" onClick={logout}>
          Dil
        </button>

        <div className="acc-note">
          (Hapi tjetër) Këtu do shtojmë: “Porositë e mia”.
        </div>
      </div>
    </div>
  );
}
