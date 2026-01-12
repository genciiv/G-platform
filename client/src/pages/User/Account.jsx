import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../context/userAuth.jsx";
import "./account.css";

export default function Account() {
  const { user, logout, loading } = useUserAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  async function onLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="account-page">
      <h1>Profili im</h1>

      <div className="account-card">
        <div className="account-row">
          <strong>Emri:</strong> {user.name}
        </div>
        <div className="account-row">
          <strong>Email:</strong> {user.email}
        </div>
      </div>

      <button className="account-logout" onClick={onLogout}>
        Dil nga llogaria
      </button>
    </div>
  );
}
