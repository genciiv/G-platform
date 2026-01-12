// client/src/pages/Auth/AuthGateway.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./authGateway.css";

export default function AuthGateway() {
  return (
    <div className="ag-wrap">
      <div className="ag-card">
        <h1>Hyr / Regjistrohu</h1>
        <p>Zgjidh si do të hysh:</p>

        <div className="ag-grid">
          <div className="ag-box">
            <h3>User</h3>
            <p>Hyr ose krijo llogari për blerje.</p>
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
            <h3>Admin</h3>
            <p>Hyr te paneli i administrimit.</p>
            <div className="ag-actions">
              <Link className="ag-btn ag-btn--primary" to="/admin/login">
                Hyr si Admin
              </Link>
            </div>
          </div>
        </div>

        <div className="ag-foot">
          <Link to="/" className="ag-link">
            ← Kthehu te Home
          </Link>
        </div>
      </div>
    </div>
  );
}
