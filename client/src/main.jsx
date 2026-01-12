import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import { CartProvider } from "./context/cartContext.jsx";
import { AdminAuthProvider } from "./context/adminAuth.jsx";
import { UserAuthProvider } from "./context/userAuth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
