import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const LS_KEY = "gapp_cart_v1";

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function getId(p) {
  return p?._id || p?.id || p?.productId || "";
}

function pickImage(p) {
  const imgs = p?.images || p?.imageUrls || p?.photos || [];
  if (Array.isArray(imgs) && imgs.length) return imgs[0];
  if (typeof p?.image === "string" && p.image) return p.image;
  if (typeof p?.thumbnail === "string" && p.thumbnail) return p.thumbnail;
  return "";
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => safeParse(localStorage.getItem(LS_KEY), []));

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    const id = getId(product);
    if (!id) return;

    const q = Math.max(1, Number(qty || 1));

    const payload = {
      _id: id,
      title: product?.title || product?.name || "Produkt",
      sku: product?.sku || "",
      price: Number(product?.salePrice ?? product?.price ?? 0),
      image: pickImage(product),
      images: Array.isArray(product?.images) ? product.images : [],
      stockQty: Number(product?.stockQty ?? 0),
      category: product?.category || null,
    };

    setItems((prev) => {
      const idx = prev.findIndex((x) => String(getId(x)) === String(id));
      if (idx >= 0) {
        const copy = [...prev];
        const cur = copy[idx];
        const nextQty = (Number(cur.qty) || 1) + q;

        const maxStock = Number(payload.stockQty);
        copy[idx] = {
          ...cur,
          ...payload,
          qty: maxStock > 0 ? Math.min(nextQty, maxStock) : nextQty,
        };
        return copy;
      }

      const maxStock = Number(payload.stockQty);
      const finalQty = maxStock > 0 ? Math.min(q, maxStock) : q;

      return [...prev, { ...payload, qty: finalQty }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((x) => String(getId(x)) !== String(id)));
  };

  const clearCart = () => setItems([]);

  const setQty = (id, qty) => {
    const q = Math.max(1, Number(qty || 1));
    setItems((prev) =>
      prev.map((x) => {
        if (String(getId(x)) !== String(id)) return x;
        const maxStock = Number(x?.stockQty ?? 0);
        return { ...x, qty: maxStock > 0 ? Math.min(q, maxStock) : q };
      })
    );
  };

  const count = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 1), 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 1) * Number(it.price || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, setItems, addToCart, removeFromCart, clearCart, setQty, count, total }),
    [items, count, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
