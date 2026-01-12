import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header/Header.jsx";
import "./styles/App.css";

import Home from "./pages/Home/Home.jsx";
import Products from "./pages/Products/Products.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import TrackOrder from "./pages/TrackOrder/TrackOrder.jsx";

import AdminLogin from "./pages/Admin/Login/AdminLogin.jsx";
import AdminLayout from "./pages/Admin/Layout/AdminLayout.jsx";
import AdminProducts from "./pages/Admin/Products/AdminProducts.jsx";
import AdminWarehouses from "./pages/Admin/Warehouses/AdminWarehouses.jsx";
import AdminInventory from "./pages/Admin/Inventory/AdminInventory.jsx";
import AdminOrders from "./pages/Admin/Orders/AdminOrders.jsx";

import UserLogin from "./pages/User/Login/UserLogin.jsx";
import UserRegister from "./pages/User/Register/UserRegister.jsx";
import Account from "./pages/User/Account/Account.jsx";

import { useAdminAuth } from "./context/adminAuth.jsx";
import { useUserAuth } from "./context/userAuth.jsx";

function AdminGuard({ children }) {
  const { isAdmin, loading } = useAdminAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

function UserGuard({ children }) {
  const { isUser, loading } = useUserAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!isUser) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<TrackOrder />} />

        {/* USER AUTH */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route
          path="/account"
          element={
            <UserGuard>
              <Account />
            </UserGuard>
          }
        />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="warehouses" element={<AdminWarehouses />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
