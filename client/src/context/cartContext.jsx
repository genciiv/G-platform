import { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // [{ product, qty }]

  const addToCart = (product, qty = 1) => {
    const q = Number(qty) || 1;
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.product?._id === product?._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + q };
        return copy;
      }
      return [...prev, { product, qty: q }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((x) => x.product?._id !== productId));
  };

  const clearCart = () => setItems([]);

  const count = useMemo(
    () => items.reduce((sum, x) => sum + (Number(x.qty) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, addToCart, removeFromCart, clearCart }),
    [items, count]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
