import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/cart.jsx";
import "./Header.css";

export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <header className="header">
      <div className="header__inner">
        <Link className="logo" to="/">
          G-App
        </Link>

        <form className="search" onSubmit={onSearch}>
          <input name="q" placeholder="Kërko produkte..." />
          <button type="submit">Kërko</button>
        </form>

        <nav className="nav">
          <NavLink to="/products">Produkte</NavLink>
          <NavLink to="/track">Gjurmim</NavLink>
          <NavLink to="/cart">
            Shporta <span className="badge">{count}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
