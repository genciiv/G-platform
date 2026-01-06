import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext.jsx";
import "./header.css";
import { useState } from "react";

export default function Header() {
  const { cartCount } = useCart();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function onSearch(e) {
    e.preventDefault();
    const query = q.trim();
    navigate(`/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="hdr">
      <div className="container hdr__row">
        <Link to="/" className="hdr__logo">
          G-App
        </Link>

        <form className="hdr__search" onSubmit={onSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kërko produkte..."
          />
          <button type="submit">Kërko</button>
        </form>

        <nav className="hdr__nav">
          <Link to="/products">Produkte</Link>
          <Link to="/track">Gjurmim</Link>
          <Link to="/cart" className="hdr__cart">
            Shporta
            <span className="hdr__badge">{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
