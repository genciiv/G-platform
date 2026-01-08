// client/src/pages/Admin/Layout/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./adminLayout.css";
import { useAdminAuth } from "../../../context/adminAuth.jsx";

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/admin/login");
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <div className="admin-sidebar__title">Admin Panel</div>

          <nav className="admin-nav">
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                "admin-nav__link" + (isActive ? " is-active" : "")
              }
            >
              <span className="admin-nav__icon">🛒</span>
              Produkte
            </NavLink>

            <NavLink
              to="/admin/warehouses"
              className={({ isActive }) =>
                "admin-nav__link" + (isActive ? " is-active" : "")
              }
            >
              <span className="admin-nav__icon">🏬</span>
              Magazina
            </NavLink>

            <NavLink
              to="/admin/inventory"
              className={({ isActive }) =>
                "admin-nav__link" + (isActive ? " is-active" : "")
              }
            >
              <span className="admin-nav__icon">🔁</span>
              Inventar (IN/OUT)
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                "admin-nav__link" + (isActive ? " is-active" : "")
              }
            >
              <span className="admin-nav__icon">📦</span>
              Porosi
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar__bottom">
          <button className="admin-logout" onClick={onLogout}>
            Dil
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
