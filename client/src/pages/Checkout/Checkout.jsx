import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext.jsx";
import { api } from "../../services/api.js";
import "./checkout.css";

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const nav = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Fier");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      warehouseId &&
      fullName.trim() &&
      phone.trim() &&
      address.trim()
    );
  }, [items.length, warehouseId, fullName, phone, address]);

  useEffect(() => {
    let alive = true;

    api
      .get("/api/warehouses")
      .then((res) => {
        if (!alive) return;
        const list = res.data || [];
        setWarehouses(list);

        // default: first warehouse
        if (list.length > 0) setWarehouseId(list[0]._id);
      })
      .catch(() => {
        if (!alive) return;
        setWarehouses([]);
        setErr("Nuk u arrit të merret lista e magazinave.");
      });

    return () => {
      alive = false;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (items.length === 0) return setErr("Shporta është bosh.");
    if (!warehouseId) return setErr("Nuk ka magazinë aktive.");
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      return setErr("Plotëso emrin, telefonin dhe adresën.");
    }

    setLoading(true);
    try {
      const payload = {
        warehouseId,
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
          <div>
            Totali: <b>{cartTotal.toFixed(2)}€</b>
          </div>
          <div className="muted">
            Pagesa: <b>Cash on Delivery</b>
          </div>
        </div>

        {warehouses.length === 0 ? (
          <p className="muted">
            Nuk ka magazina. Krijo një magazinë në DB që checkout të funksionojë.
          </p>
        ) : null}

        {warehouses.length > 1 ? (
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
              Magazina
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name || w._id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <form className="form" onSubmit={submit}>
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

          <button className="btn" disabled={loading || !canSubmit}>
            {loading ? "Duke dërguar..." : "Kryeje Porosinë"}
          </button>
        </form>
      </div>
    </div>
  );
}
