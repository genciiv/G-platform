import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const FavoritesContext = createContext(null);
const LS_KEY = "gapp_favs_v1";

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

export function FavoritesProvider({ children }) {
  const [favs, setFavs] = useState(() => safeParse(localStorage.getItem(LS_KEY), []));

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(favs));
  }, [favs]);

  function isFav(product) {
    const id = getId(product);
    if (!id) return false;
    return favs.some((x) => String(getId(x)) === String(id));
  }

  function toggleFav(product) {
    const id = getId(product);
    if (!id) return;

    const payload = {
      _id: id,
      title: product?.title || product?.name || "Produkt",
      price: Number(product?.salePrice ?? product?.price ?? 0),
      sku: product?.sku || "",
      image: pickImage(product),
      images: Array.isArray(product?.images) ? product.images : [],
    };

    setFavs((prev) => {
      const exists = prev.some((x) => String(getId(x)) === String(id));
      if (exists) return prev.filter((x) => String(getId(x)) !== String(id));
      return [payload, ...prev];
    });
  }

  const value = useMemo(() => ({ favs, isFav, toggleFav }), [favs]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
