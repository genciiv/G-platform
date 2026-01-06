import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "gapp_cart_v1";

function readCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  function addToCart(product, qty = 1) {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p._id === product._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.discountPrice ?? product.price,
          quantity: qty,
        },
      ];
    });
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((p) => p._id !== id));
  }

  function setQty(id, qty) {
    const q = Math.max(1, Number(qty || 1));
    setItems((prev) =>
      prev.map((p) => (p._id === id ? { ...p, quantity: q } : p))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const value = {
    items,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
