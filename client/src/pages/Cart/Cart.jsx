import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext.jsx";
import "./cart.css";

export default function Cart() {
  const { items, cartTotal, removeFromCart, setQty } = useCart();
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div>
        <h2>Shporta</h2>
        <p>Shporta është bosh.</p>
        <Link to="/products">Shko te produktet</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Shporta</h2>

      <div className="cart">
        <div className="cart__list">
          {items.map((it) => (
            <div className="row" key={it._id}>
              <div className="row__left">
                <div className="name">{it.name}</div>
                <div className="price">{it.price}€</div>
              </div>

              <div className="row__right">
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => setQty(it._id, e.target.value)}
                />
                <button className="link" onClick={() => removeFromCart(it._id)}>
                  Hiq
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart__sum">
          <div className="sumrow">
            <span>Totali</span>
            <b>{cartTotal.toFixed(2)}€</b>
          </div>

          <button className="btn" onClick={() => nav("/checkout")}>
            Vazhdo te Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
