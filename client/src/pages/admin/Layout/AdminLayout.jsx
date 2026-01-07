import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/adminAuth.jsx";

export default function AdminLayout() {
  const nav = useNavigate();
  const { user, logout } = useAdminAuth();

  const onLogout = async () => {
    await logout();
    nav("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 260, borderRight: "1px solid #eee", padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Admin Panel</h3>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
          {user?.email} ({user?.role})
        </div>

        <nav style={{ display: "grid", gap: 10 }}>
          <Link to="/admin/products">📦 Produkte</Link>
          <Link to="/admin/warehouses">🏬 Magazina</Link>
          <Link to="/admin/inventory">🔄 Inventar (IN/OUT)</Link>
          <Link to="/admin/orders">📑 Porosi</Link>
        </nav>

        <button
          onClick={onLogout}
          style={{
            marginTop: 18,
            width: "100%",
            padding: 10,
            borderRadius: 10,
            border: "1px solid #111",
            background: "#fff",
          }}
        >
          Dil
        </button>
      </aside>

      <main style={{ flex: 1, padding: 18 }}>
        <Outlet />
      </main>
    </div>
  );
}
