// client/src/components/Header/Header.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../../context/cartContext.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";

import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { items } = useCart();
  const { isAdmin } = useAdminAuth();
  const { isUser, user, logout: userLogout } = useUserAuth();

  const [q, setQ] = useState("");

  const cartCount = useMemo(() => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0);
  }, [items]);

  const inAdminArea = location.pathname.startsWith("/admin");

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return navigate("/products");
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }

  async function handleUserLogout() {
    await userLogout();
    navigate("/");
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
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Produkte
          </NavLink>

          <NavLink
            to="/track"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Gjurmim
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Shporta <span className="badge">{cartCount}</span>
          </NavLink>

          {/* USER MENU */}
          {!inAdminArea ? (
            !isUser ? (
              <>
                <NavLink to="/login" className="nav-link admin-btn">
                  Identifikohu
                </NavLink>
                <NavLink to="/register" className="nav-link">
                  Regjistrohu
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/account" className="nav-link admin-btn">
                  {user?.name ? `Llogaria` : "Llogaria"}
                </NavLink>
                <button
                  className="nav-link logout-btn"
                  onClick={handleUserLogout}
                  type="button"
                >
                  Dil
                </button>
              </>
            )
          ) : null}

          {/* ADMIN BUTTON (pa logout këtu) */}
          {isAdmin ? (
            <NavLink to="/admin/products" className="nav-link admin-btn">
              Admin
            </NavLink>
          ) : null}import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { useCart } from "../../context/cartContext.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";

export default function Header() {
  const nav = useNavigate();
  const { items } = useCart();
  const { isUser, user, logout } = useUserAuth();

  const cartCount = (items || []).reduce((sum, it) => sum + Number(it?.qty || 1), 0);

  async function onLogout() {
    await logout();
    nav("/", { replace: true });
  }

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link className="hdr__brand" to="/">
          G-App
        </Link>

        <div className="hdr__search">
          <input placeholder="Kërko produkte..." />
          <button>Kërko</button>
        </div>

        <nav className="hdr__nav">
          <NavLink to="/products">Produkte</NavLink>
          <NavLink to="/track">Gjurmim</NavLink>
          <NavLink to="/cart">Shporta {cartCount ? `(${cartCount})` : ""}</NavLink>

          {!isUser ? (
            <>
              <NavLink to="/login">Identifikohu</NavLink>
              <NavLink to="/register">Regjistrohu</NavLink>
            </>
          ) : (
            <>
              <span className="hdr__user">
                {user?.name || user?.email || "User"}
              </span>
              <button className="hdr__btn" onClick={onLogout}>
                Dil
              </button>
            </>
          )}

          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
        </nav>
      </div>
    </header>
  );
}
