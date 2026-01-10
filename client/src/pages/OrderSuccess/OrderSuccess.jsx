import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./orderSuccess.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderSuccess() {
  const q = useQuery();
  const code = q.get("code") || "";

  return (
    <div className="os-wrap">
      <div className="os-card">
        <h1>Porosia u krijua ✅</h1>
        <p>Faleminderit! Ruaje kodin për gjurmim.</p>

        <div className="os-codeBox">
          <div className="os-codeLabel">Kodi i porosisë</div>
          <div className="os-code">{code || "-"}</div>
        </div>

        <div className="os-actions">
          <Link
            className="os-btn"
            to={`/track?code=${encodeURIComponent(code)}`}
          >
            Shko te Gjurmimi
          </Link>
          <Link className="os-btn os-btn--ghost" to="/products">
            Vazhdo blerjet
          </Link>
        </div>
      </div>
    </div>
  );
}
