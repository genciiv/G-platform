import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./productDetails.css";
import { http, getErrMsg } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get(`/api/products/${id}`);
      setItem(res.data?.item || res.data?.product || res.data || null);
    } catch (e) {
      setErr(getErrMsg(e, "S’u gjet produkti"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Duke ngarkuar...</div>;
  if (err) return <div style={{ padding: 24, color: "#991b1b" }}>{err}</div>;
  if (!item) return <div style={{ padding: 24 }}>Produkt i panjohur.</div>;

  const title = item.title || item.name || "Produkt";
  const price = Number(item.price || 0).toFixed(2);
  const img = item.image || item.imageUrl || "";

  return (
    <div className="pd-wrap">
      <div className="pd-top">
        <Link to="/products" className="pd-back">
          ← Produktet
        </Link>
      </div>

      <div className="pd-card">
        <div className="pd-img">
          {img ? (
            <img src={img} alt={title} />
          ) : (
            <div className="pd-ph">No Image</div>
          )}
        </div>

        <div className="pd-body">
          <h1>{title}</h1>
          <div className="pd-price">{price} €</div>
          {item.description ? (
            <p className="pd-desc">{item.description}</p>
          ) : null}

          <div className="pd-actions">
            <label className="pd-qty">
              Sasia
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Number(e.target.value || 1)))
                }
              />
            </label>

            <button
              className="pd-add"
              onClick={() => addToCart(item, qty)}
              type="button"
            >
              Shto në shportë
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
