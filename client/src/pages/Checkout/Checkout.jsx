import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext.jsx";
import { api } from "../../services/api.js";
import "./checkout.css";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const nav = useNavigate();

  const [warehouseId, setWarehouseId] = useState(""); // PASTE nga DB
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Fier");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!warehouseId.trim()) return setErr("Vendos warehouseId (magazina).");
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      return setErr("Plotëso emrin, telefonin dhe adresën.");
    }
    if (items.length === 0) return setErr("Shporta është bosh.");

    setLoading(true);
    try {
      const payload = {
        warehouseId: warehouseId.trim(),
        customer: { fullName, phone, address, city },
        items: items.map((it) => ({ productId: it._id, quantity: it.quantity })),
      };

      const res = await api.post("/api/orders", payload);

      clearCart();
      nav(`/track?code=${encodeURIComponent(res.data.orderCode)}`);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Gabim gjatë porosisë");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Checkout</h2>

      <div className="box">
        <div className="sum">
          <div>Totali: <b>{cartTotal.toFixed(2)}€</b></div>
          <div className="muted">Pagesa: <b>Cash on Delivery</b></div>
        </div>

        <form className="form" onSubmit={submit}>
          <label>
            Warehouse ID (Magazina)
            <input value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} placeholder="p.sh. 659..." />
          </label>

          <label>
            Emri & Mbiemri
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>

          <label>
            Telefon
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <label>
            Adresa
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>

          <label>
            Qyteti
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>

          {err ? <p className="err">{err}</p> : null}

          <button className="btn" disabled={loading}>
            {loading ? "Duke dërguar..." : "Kryeje Porosinë"}
          </button>
        </form>
      </div>
    </div>
  );
}
