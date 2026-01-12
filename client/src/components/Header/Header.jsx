// client/src/components/Header/Header.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useCart } from "../../context/cartContext.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";

import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const { items } = useCart();

  const { isAdmin, logout: adminLogout } = useAdminAuth();
  const { isUser, user, logout: userLogout } = useUserAuth();

  const [q, setQ] = useState("");

  const cartCount = useMemo(() => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0);
  }, [items]);

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return navigate("/products");
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }

  async function handleAdminLogout() {
    await adminLogout();
    navigate("/");
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

          {/* USER */}
          {!isUser ? (
            <NavLink to="/login" className="nav-link admin-btn">
              Hyr / Regjistrohu
            </NavLink>
          ) : (
            <>
              <NavLink to="/account" className="nav-link admin-btn">
                {user?.name ? user.name : "Account"}
              </NavLink>
              <button
                className="nav-link logout-btn"
                onClick={handleUserLogout}
                type="button"
              >
                Dil
              </button>
            </>
          )}

          {/* ADMIN (veç kur është admin) */}
          {isAdmin ? (
            <>
              <NavLink to="/admin/products" className="nav-link admin-btn">
                Admin
              </NavLink>
              <button
                className="nav-link logout-btn"
                onClick={handleAdminLogout}
                type="button"
              >
                Dil Admin
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className="nav-link admin-btn">
              Admin Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
