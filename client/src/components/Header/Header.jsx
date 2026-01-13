import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiBox,
  FiTruck,
  FiMenu,
  FiX,
} from "react-icons/fi";
import "./header.css";
import { useCart } from "../../context/cartContext.jsx";
import { useUserAuth } from "../../context/userAuth.jsx";
import { useAdminAuth } from "../../context/adminAuth.jsx";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const { user, isUser, logout: userLogout } = useUserAuth();
  const { isAdmin, logout: adminLogout } = useAdminAuth();

  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = useMemo(
    () => (items || []).reduce((s, it) => s + Number(it.qty || 1), 0),
    [items]
  );

  // Mbyll menunë mobile kur ndryshon route
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Blloko scroll kur menu mobile është hapur
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function doSearch() {
    const query = q.trim();
    if (!query) return;
    navigate(`/products?q=${encodeURIComponent(query)}`);
    setQ("");
    setMobileOpen(false);
  }

  async function onLogout() {
    if (isAdmin) await adminLogout();
    else await userLogout();
    setMobileOpen(false);
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* LEFT: logo + burger */}
        <div className="left">
          <button
            className="burger"
            aria-label={mobileOpen ? "Mbyll menunë" : "Hap menunë"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>

          <Link to="/" className="brand">
            G-App
          </Link>
        </div>

        {/* SEARCH (desktop) */}
        <div className="search desktop-only">
          <input
            className="search-input"
            placeholder="Kërko produkte..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
          />
          <button className="search-icon-btn" onClick={doSearch} type="button">
            <FiSearch />
          </button>
        </div>

        {/* NAV (desktop) */}
        <nav className="nav desktop-only">
          <NavLink to="/products" className="nav-link">
            <FiBox /> Produkte
          </NavLink>

          <NavLink to="/track" className="nav-link">
            <FiTruck /> Gjurmim
          </NavLink>

          <NavLink to="/cart" className="nav-link">
            <FiShoppingCart />
            
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </NavLink>

          {isUser && user ? (
            <>
              <NavLink to="/account" className="nav-link">
                <FiUser /> {user.name}
              </NavLink>
              <button onClick={onLogout} className="nav-link logout-btn" type="button">
                <FiLogOut /> Dil
              </button>
            </>
          ) : isAdmin ? (
            <>
              <NavLink to="/admin" className="nav-link admin-btn">
                <FiUser /> Admin
              </NavLink>
              <button onClick={onLogout} className="nav-link logout-btn" type="button">
                <FiLogOut /> Dil
              </button>
            </>
          ) : (
            <NavLink to="/auth" className="nav-link auth-btn">
              <FiUser /> Hyr / Regjistrohu
            </NavLink>
          )}
        </nav>

        {/* RIGHT (mobile quick actions) */}
        <div className="mobile-actions mobile-only">
          <button
            className="icon-btn"
            onClick={() => setMobileOpen(true)}
            type="button"
            aria-label="Kërko"
            title="Kërko"
          >
            <FiSearch />
          </button>

          <Link className="icon-btn" to="/cart" aria-label="Shporta" title="Shporta">
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge badge-dot">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />

        <aside className="mobile-panel" role="dialog" aria-label="Menu">
          {/* Search mobile */}
          <div className="mobile-search">
            <input
              className="search-input"
              placeholder="Kërko produkte..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
            />
            <button className="search-icon-btn" onClick={doSearch} type="button">
              <FiSearch />
            </button>
          </div>

          <div className="mobile-links">
            <NavLink to="/products" className="m-link">
              <FiBox /> Produkte
            </NavLink>

            <NavLink to="/track" className="m-link">
              <FiTruck /> Gjurmim
            </NavLink>

            <NavLink to="/cart" className="m-link">
              <FiShoppingCart /> Shporta
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </NavLink>

            <div className="m-sep" />

            {isUser && user ? (
              <>
                <NavLink to="/account" className="m-link">
                  <FiUser /> Profili
                </NavLink>
                <button className="m-link m-btn" onClick={onLogout} type="button">
                  <FiLogOut /> Dil
                </button>
              </>
            ) : isAdmin ? (
              <>
                <NavLink to="/admin" className="m-link">
                  <FiUser /> Admin Panel
                </NavLink>
                <button className="m-link m-btn" onClick={onLogout} type="button">
                  <FiLogOut /> Dil
                </button>
              </>
            ) : (
              <NavLink to="/auth" className="m-link m-primary">
                <FiUser /> Hyr / Regjistrohu
              </NavLink>
            )}
          </div>

          <button className="mobile-close" onClick={() => setMobileOpen(false)} type="button">
            <FiX /> Mbyll
          </button>
        </aside>
      </div>
    </header>
  );
}
