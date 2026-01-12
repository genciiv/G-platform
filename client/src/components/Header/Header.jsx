import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./header.css";

import { useCart } from "../../context/cartContext.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";

export default function Header() {
  const nav = useNavigate();

  const { items } = useCart();
  const { isAdmin } = useAdminAuth();
  const { user, isUser, logout: userLogout } = useUserAuth();

  const [q, setQ] = useState("");

  const cartCount = useMemo(() => {
    return (items || []).reduce((s, it) => s + Number(it.qty || 1), 0);
  }, [items]);

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    nav(`/products?q=${encodeURIComponent(term)}`);
  }

  async function onLogout() {
    await userLogout();
    nav("/", { replace: true });
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">
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

          {/* USER */}
          {isUser ? (
            <>
              <NavLink className="nav-link" to="/account">
                {user?.name || "Account"}
              </NavLink>

              <button
                type="button"
                className="nav-link logout-btn"
                onClick={onLogout}
              >
                Dil
              </button>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/login">
                Identifikohu
              </NavLink>
              <NavLink className="nav-link" to="/register">
                Regjistrohu
              </NavLink>
            </>
          )}

          {/* ADMIN shortcut */}
          <NavLink className="nav-link admin-btn" to="/admin">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
