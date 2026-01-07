import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, borderRight: "1px solid #ddd", padding: 16 }}>
        <h3>Admin</h3>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/warehouses">Warehouses</Link>
          <Link to="/admin/inventory">Inventory</Link>
          <Link to="/admin/orders">Orders</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
