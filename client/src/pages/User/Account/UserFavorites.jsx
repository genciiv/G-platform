import React from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../../context/favoritesContext.jsx";
import { FiHeart, FiChevronRight, FiShoppingBag } from "react-icons/fi";

function pickImage(p) {
  const imgs = p?.images || [];
  if (Array.isArray(imgs) && imgs.length) return imgs[0];
  if (typeof p?.image === "string" && p.image) return p.image;
  return "";
}

function money(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function UserFavorites() {
  const { favs, toggleFav } = useFavorites();

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Favourite</h1>
      <p style={{ opacity: 0.7, marginBottom: 16 }}>
        Produktet që ke ruajtur me zemër.
      </p>

      {!favs.length ? (
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 14 }}>
          S’ke favourite ende. Shko te <Link to="/products">produktet</Link>.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {favs.map((p) => {
            const img = pickImage(p);
            return (
              <div
                key={p._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 12,
                  background: "white",
                }}
              >
                <Link
                  to={`/products/${p._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      height: 160,
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#f6f6f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={p.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ opacity: 0.6 }}>
                        <FiShoppingBag /> Pa foto
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 10, fontWeight: 800 }}>{p.title}</div>
                  <div style={{ marginTop: 6, opacity: 0.8 }}>{money(p.price)}</div>
                </Link>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => toggleFav(p)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      background: "white",
                      cursor: "pointer",
                      display: "inline-flex",
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiHeart /> Hiq
                  </button>

                  <Link
                    to={`/products/${p._id}`}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      background: "white",
                      textDecoration: "none",
                      color: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Hap <FiChevronRight />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
