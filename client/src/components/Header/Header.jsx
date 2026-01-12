// client/src/components/Header/Header.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./header.css";

import { useCart } from "../../context/cartContext.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";

export default function Header() {
  const nav = useNavigate();
  const { items } = useCart();

  const { isAdmin, logout: adminLogout } = useAdminAuth();
  const { user, isUser, logout: userLogout } = useUserAuth();

  const [q, setQ] = useState("");

  const cartCount = useMemo(
    () => (items || []).reduce((s, it) => s + Number(it?.qty || 0), 0),
    [items]
  );

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return nav("/products");
    nav(`/products?q=${encodeURIComponent(term)}`);
  }

  async function onLogout() {
    // nëse ke të dyja aktive, i fshin të dyja (s’ka dëm)
    try {
      if (isAdmin) await adminLogout();
    } catch {}
    try {
      if (isUser) await userLogout();
    } catch {}
    nav("/");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand">
          G-App
        </Link>

        <form className="search" onSubmit={onSearch}>
          <input
            className="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kërko produkte..."
          />
          <button className="search-btn" type="submit">
            Kërko
          </button>
        </form>

        <nav className="nav">
          <NavLink className="nav-link" to="/products">
            Produkte
          </NavLink>

          <NavLink className="nav-link" to="/track">
            Gjurmim
          </NavLink>

          <NavLink className="nav-link" to="/cart">
            Shporta
            <span className="badge">{cartCount}</span>
          </NavLink>

          {/* AUTH AREA */}
          {isAdmin ? (
            <>
              <NavLink className="nav-link admin-btn" to="/admin">
                Admin
              </NavLink>

              <button className="nav-link logout-btn" onClick={onLogout}>
                Dil
              </button>
            </>
          ) : isUser ? (
            <>
              <NavLink className="nav-link" to="/account">
                {user?.name || "Account"}
              </NavLink>

              <button className="nav-link logout-btn" onClick={onLogout}>
                Dil
              </button>
            </>
          ) : (
            <NavLink className="nav-link" to="/auth">
              Hyr / Regjistrohu
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
