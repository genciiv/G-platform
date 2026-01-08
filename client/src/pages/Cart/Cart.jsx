import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./cart.css";
import { useCart } from "../../context/cartContext.jsx";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, setItems } = useCart();

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + Number(it.price || 0) * (Number(it.qty) || 1),
        0
      ),
    [items]
  );

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((x) =>
        (x._id || x.id) === id
          ? { ...x, qty: Math.max(1, Number(qty || 1)) }
          : x
      )
    );
  };

  return (
    <div className="cart-page">
      <div className="cart-head">
        <h1>Shporta</h1>
        <Link to="/products" className="cart-link">
          ← Vazhdoni blerjet
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          Shporta është bosh.
          <div style={{ marginTop: 10 }}>
            <Link to="/products" className="cart-btn cart-btn--primary">
              Shko te produktet
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-card">
            {items.map((it) => {
              const id = it._id || it.id;
              const title = it.title || it.name || "Produkt";
              const price = Number(it.price || 0);
              const qty = Number(it.qty || 1);

              return (
                <div className="cart-row" key={id}>
                  <div className="cart-row__left">
                    <div className="cart-title">{title}</div>
                    <div className="cart-sub">{price.toFixed(2)} € / copë</div>
                  </div>

                  <div className="cart-row__right">
                    <input
                      className="cart-qty"
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => updateQty(id, e.target.value)}
                    />
                    <div className="cart-line">
                      {(price * qty).toFixed(2)} €
                    </div>
                    <button
                      className="cart-btn cart-btn--danger"
                      onClick={() => removeFromCart(id)}
                    >
                      Hiq
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer">
            <button className="cart-btn" onClick={clearCart}>
              Pastro shportën
            </button>

            <div className="cart-total">
              <div>Total</div>
              <div className="cart-total__num">{total.toFixed(2)} €</div>
            </div>

            <button
              className="cart-btn cart-btn--primary"
              onClick={() => navigate("/checkout")}
            >
              Vazhdo te pagesa →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
