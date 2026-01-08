import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./products.css";
import { http, getErrMsg } from "../../lib/api.js";

export default function Products() {
  const [searchParams] = useSearchParams();
  const qParam = (searchParams.get("q") || "").trim();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      // server supports ?q
      const res = await http.get(
        `/api/products${qParam ? `?q=${encodeURIComponent(qParam)}` : ""}`
      );
      const list = res.data?.items || res.data?.products || res.data || [];
      const arr = Array.isArray(list) ? list : [];

      // shfaq vetëm aktive
      setItems(arr.filter((p) => (p.active ?? true) === true));
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren produktet"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  const title = useMemo(() => {
    if (!qParam) return "Produktet";
    return `Rezultate për: "${qParam}"`;
  }, [qParam]);

  return (
    <div className="products-page">
      <div className="products-head">
        <div>
          <h1>{title}</h1>
          <p>Shfleto produktet dhe zgjidh atë që të duhet.</p>
        </div>
        <Link className="products-back" to="/">
          ← Kthehu
        </Link>
      </div>

      {err ? <div className="products-error">{err}</div> : null}

      {loading ? (
        <div className="products-empty">Duke ngarkuar...</div>
      ) : items.length === 0 ? (
        <div className="products-empty">S’ka produkte për momentin.</div>
      ) : (
        <div className="products-grid">
          {items.map((p) => (
            <ProductCard key={p._id || p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p }) {
  const id = p._id || p.id;
  const title = p.title || p.name || "Produkt";
  const price = Number(p.price || 0).toFixed(2);
  const sku = p.sku || "";
  const img = p.image || p.imageUrl || "";

  return (
    <Link className="p-card" to={`/products/${id}`}>
      <div className="p-img">
        {img ? (
          <img src={img} alt={title} />
        ) : (
          <div className="p-img__ph">No Image</div>
        )}
      </div>

      <div className="p-body">
        <div className="p-title">{title}</div>
        {sku ? <div className="p-sku">SKU: {sku}</div> : null}
        <div className="p-price">{price} €</div>
        <div className="p-cta">Shiko detaje →</div>
      </div>
    </Link>
  );
}
