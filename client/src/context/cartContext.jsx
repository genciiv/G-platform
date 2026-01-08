import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, qty = 1) => {
    const id = product?._id || product?.id;
    if (!id) return;

    setItems((prev) => {
      const idx = prev.findIndex((x) => (x._id || x.id) === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: (Number(copy[idx].qty) || 1) + qty };
        return copy;
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((x) => (x._id || x.id) !== id));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, setItems, addToCart, removeFromCart, clearCart, count }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
