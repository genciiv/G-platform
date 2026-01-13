// client/src/pages/Auth/AuthGateway.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./authGateway.css";

export default function AuthGateway() {
  return (
    <div className="ag-wrap">
      <div className="ag-card">
        <div className="ag-top">
          <div>
            <h1>Zgjidh mënyrën e hyrjes</h1>
            <p>
              Hyr si <b>përdorues</b> për të bërë porosi, ose si <b>admin</b> për
              të menaxhuar dyqanin.
            </p>
          </div>
          <div className="ag-badge">G-platform</div>
        </div>

        <div className="ag-grid">
          <div className="ag-box">
            <div className="ag-icon">👤</div>
            <h2>User</h2>
            <p>Hyr / regjistrohu dhe shiko porositë e tua.</p>

            <div className="ag-actions">
              <Link className="ag-btn ag-btn--primary" to="/user/login">
                Hyr si User
              </Link>
              <Link className="ag-btn" to="/user/register">
                Regjistrohu
              </Link>
            </div>
          </div>

          <div className="ag-box">
            <div className="ag-icon">🛠️</div>
            <h2>Admin</h2>
            <p>Panel administrimi për produkte, magazina, inventar, porosi.</p>

            <div className="ag-actions">
              <Link className="ag-btn ag-btn--dark" to="/admin/login">
                Hyr si Admin
              </Link>
              <div className="ag-hint">Vetëm për administratorë.</div>
            </div>
          </div>
        </div>

        <div className="ag-foot">
          <Link to="/" className="ag-link">
            ← Kthehu te Kryefaqja
          </Link>
          <span className="ag-dot">•</span>
          <Link to="/products" className="ag-link">
            Shiko produktet
          </Link>
        </div>
      </div>
    </div>
  );
}
