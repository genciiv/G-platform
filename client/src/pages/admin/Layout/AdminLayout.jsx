import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBox,
  FiTag,
  FiHome,
  FiLayers,
  FiRefreshCcw,
  FiTruck,
  FiLogOut,
} from "react-icons/fi";
import "./adminLayout.css";

export default function AdminLayout() {
  const nav = useNavigate();

  function onLogout() {
    // nqs ke funksion logout te adminAuth, vendose këtu.
    // për momentin: kthehu te /auth
    nav("/auth", { replace: true });
  }

  return (
    <div className="ad-root">
      {/* SIDEBAR */}
      <aside className="ad-side">
        <div className="ad-brand">
          <div className="ad-logo">G</div>
          <div>
            <div className="ad-brandTitle">G-App</div>
            <div className="ad-brandSub">Admin Panel</div>
          </div>
        </div>

        <nav className="ad-nav">
          <NavLink to="/admin/products" className="ad-link">
            <FiBox /> Produkte
          </NavLink>
          <NavLink to="/admin/categories" className="ad-link">
            <FiTag /> Kategori
          </NavLink>
          <NavLink to="/admin/warehouses" className="ad-link">
            <FiHome /> Magazina
          </NavLink>
          <NavLink to="/admin/inventory" className="ad-link">
            <FiLayers /> Inventar (IN/OUT)
          </NavLink>
          <NavLink to="/admin/orders" className="ad-link">
            <FiTruck /> Porosi
          </NavLink>
        </nav>

        <div className="ad-sideFooter">
          <button className="ad-sideBtn" type="button" onClick={() => window.location.reload()}>
            <FiRefreshCcw /> Rifresko
          </button>
          <button className="ad-sideBtn danger" type="button" onClick={onLogout}>
            <FiLogOut /> Dil
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ad-main">
        <header className="ad-top">
          <div className="ad-topLeft">
            <div className="ad-pill">Panel i administrimit</div>
          </div>

          <div className="ad-topRight">
            <button className="ad-topBtn" type="button" onClick={() => nav("/")}>
              Kthehu te Store
            </button>
          </div>
        </header>

        <main className="ad-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
