// client/src/App.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout/Layout.jsx";

import Home from "./pages/Home/Home.jsx";
import Products from "./pages/Products/Products.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import TrackOrder from "./pages/TrackOrder/TrackOrder.jsx";

// Admin
import AdminLogin from "./pages/Admin/Login/AdminLogin.jsx";
import AdminLayout from "./pages/Admin/Layout/AdminLayout.jsx";
import AdminProducts from "./pages/Admin/Products/AdminProducts.jsx";
import AdminWarehouses from "./pages/Admin/Warehouses/AdminWarehouses.jsx";
import AdminInventory from "./pages/Admin/Inventory/AdminInventory.jsx";
import AdminOrders from "./pages/Admin/Orders/AdminOrders.jsx";

export default function App() {
  return (
    <Routes>
      {/* ADMIN */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* PUBLIC */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<TrackOrder />} />
      </Route>
    </Routes>
  );
}
