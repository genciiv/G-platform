import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../services/api.js";
import { useCart } from "../../context/cartContext.jsx";
import "./products.css";

export default function Products() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const { addToCart } = useCart();

  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      .get("/api/products")
      .then((res) => {
        if (!alive) return;
        setRows(res.data || []);
      })
      .catch(() => setRows([]))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((p) => (p.name || "").toLowerCase().includes(query));
  }, [rows, q]);

  return (
    <div>
      <h2>Produkte</h2>
      {q ? <p className="muted">Rezultate për: <b>{q}</b></p> : null}

      {loading ? (
        <p>Po ngarkohen...</p>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <div className="card" key={p._id}>
              <Link className="card__title" to={`/products/${p._id}`}>
                {p.name}
              </Link>

              <div className="card__price">
                {p.discountPrice ? (
                  <>
                    <span className="old">{p.price}€</span>
                    <span className="new">{p.discountPrice}€</span>
                  </>
                ) : (
                  <span className="new">{p.price}€</span>
                )}
              </div>

              <button
                className="btn"
                onClick={() => addToCart(p, 1)}
              >
                Shto në shportë
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
