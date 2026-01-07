import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((x) => x.productId === product._id);
      if (found) {
        return prev.map((x) =>
          x.productId === product._id ? { ...x, qty: x.qty + qty } : x
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          title: product.title || product.name,
          price: Number(product.price || 0),
          qty,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const total = useMemo(
    () => items.reduce((a, b) => a + b.qty * b.price, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, clearCart, count, total }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
