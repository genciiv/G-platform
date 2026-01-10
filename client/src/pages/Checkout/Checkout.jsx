// client/src/pages/Checkout/Checkout.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./checkout.css";
import { useCart } from "../../context/cartContext.jsx";
import { http, getErrMsg } from "../../lib/api.js";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const total = useMemo(
    () =>
      (items || []).reduce(
        (sum, it) => sum + Number(it.price || 0) * (Number(it.qty) || 1),
        0
      ),
    [items]
  );

  async function submit(e) {
    e.preventDefault();
    setErr("");

    if (!items || items.length === 0) return setErr("Shporta është bosh.");
    if (!customerName.trim()) return setErr("Emri është i detyrueshëm.");
    if (!phone.trim()) return setErr("Telefoni është i detyrueshëm.");
    if (!address.trim()) return setErr("Adresa është e detyrueshme.");

    setBusy(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        items: items.map((it) => ({
          productId: it.productId || it._id || it.id,
          qty: Number(it.qty || 1),
        })),
      };

      const res = await http.post("/api/orders", payload);

      const code = res.data?.orderCode || "";
      const ph = phone.trim();

      clearCart();

      if (code) {
        navigate(
          `/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(
            ph
          )}`
        );
      } else {
        navigate("/track");
      }
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u krijua porosia"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="co-page">
      <div className="co-head">
        <h1>Checkout</h1>
        <Link to="/cart" className="co-link">
          ← Kthehu te shporta
        </Link>
      </div>

      {err ? <div className="co-error">{err}</div> : null}

      <div className="co-grid">
        <form className="co-card" onSubmit={submit}>
          <h2>Të dhënat</h2>

          <label>Emri dhe Mbiemri</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <label>Telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Adresë</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />

          <label>Shënim (opsionale)</label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            className="co-btn co-btn--primary"
            disabled={busy}
            type="submit"
          >
            {busy ? "Duke krijuar..." : "Krijo Porosinë"}
          </button>
        </form>

        <div className="co-card">
          <h2>Porosia</h2>

          {!items || items.length === 0 ? (
            <div style={{ color: "#6b7280" }}>Shporta është bosh.</div>
          ) : (
            <div className="co-lines">
              {items.map((it, idx) => {
                const id = it.productId || it._id || it.id || idx;
                const title = it.title || it.name || "Produkt";
                const qty = Number(it.qty || 1);
                const price = Number(it.price || 0);
                return (
                  <div className="co-line" key={id}>
                    <div className="co-line__title">{title}</div>
                    <div className="co-line__meta">
                      {qty} × {price.toFixed(2)} €
                    </div>
                    <div className="co-line__sum">
                      {(qty * price).toFixed(2)} €
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="co-total">
            <div>Total</div>
            <div className="co-total__num">{total.toFixed(2)} €</div>
          </div>
        </div>
      </div>
    </div>
  );
}
