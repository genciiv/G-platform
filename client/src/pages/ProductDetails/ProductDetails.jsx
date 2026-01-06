import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api.js";
import { useCart } from "../../context/cartContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      .get("/api/products")
      .then((res) => {
        if (!alive) return;
        const found = (res.data || []).find((p) => p._id === id);
        if (!found) {
          setErr("Produkti nuk u gjet");
          setProduct(null);
        } else {
          setProduct(found);
        }
      })
      .catch(() => setErr("Gabim gjatë ngarkimit"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <p>Po ngarkohet...</p>;
  if (err) return <p style={{ color: "red" }}>{err}</p>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{product.name}</h2>

      <div style={{ margin: "12px 0", fontSize: 18 }}>
        {product.discountPrice ? (
          <>
            <span style={{ textDecoration: "line-through", color: "#777", marginRight: 10 }}>
              {product.price}€
            </span>
            <b>{product.discountPrice}€</b>
          </>
        ) : (
          <b>{product.price}€</b>
        )}
      </div>

      {product.description ? (
        <p style={{ marginBottom: 14 }}>{product.description}</p>
      ) : null}

      <button
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #111",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => addToCart(product, 1)}
      >
        Shto në shportë
      </button>
    </div>
  );
}
