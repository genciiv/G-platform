// client/src/components/Header/Header.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useCart } from "../../context/cartContext.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";

import "./header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { items } = useCart();
  const { isAdmin } = useAdminAuth();

  const [q, setQ] = useState("");

  const inAdmin = location.pathname.startsWith("/admin");

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

          {!isAdmin ? (
            <NavLink to="/admin/login" className="nav-link admin-btn">
              Identifikohu
            </NavLink>
          ) : (
            // kur je admin: shfaq vetëm "Admin" (pa "Dil" në header)
            <NavLink to="/admin/products" className="nav-link admin-btn">
              Admin
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
