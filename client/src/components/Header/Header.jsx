import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiBox,
  FiTruck,
  FiUser,
  FiLogOut,
  FiShield,
} from "react-icons/fi";
import { useCart } from "../../context/cartContext.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";
import "./header.css";

export default function Header() {
  const nav = useNavigate();
  const loc = useLocation();

  const { cart } = useCart();
  const { isUser, user, logout: userLogout } = useUserAuth();
  const { isAdmin, admin, logout: adminLogout } = useAdminAuth();

  const [q, setQ] = useState("");

  const cartCount = useMemo(() => {
    const items = Array.isArray(cart) ? cart : cart?.items || [];
    return items.reduce((sum, it) => sum + Number(it?.qty || it?.quantity || 1), 0);
  }, [cart]);

  const loggedIn = Boolean(isUser || isAdmin);

  function onSubmitSearch(e) {
    e.preventDefault();
    const query = q.trim();
    // nëse s’ka tekst, thjesht shko te produktet
    if (!query) return nav("/products");

    // këtu po e kalojmë si query param: /products?q=xxx
    nav(`/products?q=${encodeURIComponent(query)}`);
  }

  function onLogout() {
    // dy lloje logout (nëse je admin ose user)
    try {
      if (isAdmin && typeof adminLogout === "function") adminLogout();
      if (isUser && typeof userLogout === "function") userLogout();
    } catch {}
    // fallback: pastro tokenët nëse i ruan në localStorage
    try {
      localStorage.removeItem("user_token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("token");
    } catch {}
    nav("/");
  }

  return (
    <header className="site-header">
      <div className="h-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">G</span>
          <span className="brand-text">G-App</span>
        </Link>

        <form className="search" onSubmit={onSubmitSearch} role="search">
          <FiSearch className="search-ico" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="search-input"
            placeholder="Kërko produkte..."
            aria-label="Kërko produkte"
          />
          <button className="search-btn" type="submit" aria-label="Kërko">
            Kërko
          </button>
        </form>

        <nav className="nav">
          <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/products">
            <FiBox /> <span>Produkte</span>
          </NavLink>

          <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/track">
            <FiTruck /> <span>Gjurmim</span>
          </NavLink>

          <Link className="nav-icon" to="/cart" aria-label="Shporta">
            <FiShoppingCart />
            {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
          </Link>

          {/* ✅ Këtu: nëse je i loguar, mos shfaq “Hyr/Regjistrohu” */}
          {!loggedIn ? (
            <Link className="nav-cta" to="/auth">
              <FiUser /> <span>Hyr / Regjistrohu</span>
            </Link>
          ) : (
            <div className="nav-auth">
              {isAdmin ? (
                <Link className="nav-cta ghost" to="/admin/products" title="Panel Admin">
                  <FiShield /> <span>Admin</span>
                </Link>
              ) : (
                <Link className="nav-cta ghost" to="/account" title="Account">
                  <FiUser /> <span>{user?.name || "Account"}</span>
                </Link>
              )}

              <button className="nav-cta danger" onClick={onLogout} type="button">
                <FiLogOut /> <span>Dil</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
