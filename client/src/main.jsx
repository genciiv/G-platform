import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import { CartProvider } from "./context/cartContext.jsx";
import { FavoritesProvider } from "./context/favoritesContext.jsx";

// ✅ SHTO KETO 2
import { UserAuthProvider } from "./context/userAuth.jsx";
import { AdminAuthProvider } from "./context/adminAuth.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserAuthProvider>
        <AdminAuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </FavoritesProvider>
        </AdminAuthProvider>
      </UserAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
