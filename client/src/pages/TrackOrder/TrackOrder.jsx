import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./trackOrder.css";
import { http, getErrMsg } from "../../lib/api.js";

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = (searchParams.get("code") || "").trim();

  const [code, setCode] = useState(codeFromUrl);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (codeFromUrl) {
      // auto search
      doTrack(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doTrack(c) {
    const val = (c || "").trim();
    if (!val) return;

    setBusy(true);
    setErr("");
    setOrder(null);

    try {
      const res = await http.get(
        `/api/orders/track/${encodeURIComponent(val)}`
      );
      setOrder(res.data?.order || null);
    } catch (e) {
      setErr(getErrMsg(e, "Porosia nuk u gjet"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="to-page">
      <div className="to-head">
        <h1>Gjurmim Porosie</h1>
        <Link to="/" className="to-link">
          ← Kryefaqja
        </Link>
      </div>

      <div className="to-card">
        <form
          className="to-form"
          onSubmit={(e) => {
            e.preventDefault();
            doTrack(code);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Shkruaj kodin e porosisë (p.sh. G-2026...)"
          />
          <button type="submit" disabled={busy}>
            {busy ? "..." : "Kërko"}
          </button>
        </form>

        {err ? <div className="to-error">{err}</div> : null}

        {order ? (
          <div className="to-order">
            <div className="to-row">
              <b>Kodi:</b> {order.orderCode}
            </div>
            <div className="to-row">
              <b>Statusi:</b> {order.status}
            </div>
            <div className="to-row">
              <b>Total:</b> {Number(order.total || 0).toFixed(2)} €
            </div>
            <div className="to-row">
              <b>Emri:</b> {order.customerName}
            </div>
            <div className="to-row">
              <b>Telefon:</b> {order.phone}
            </div>
            <div className="to-row">
              <b>Adresë:</b> {order.address}
            </div>

            <div className="to-items">
              <div className="to-items__title">Artikujt</div>
              {order.items?.map((it, idx) => (
                <div className="to-item" key={idx}>
                  <div className="to-item__name">{it.title}</div>
                  <div className="to-item__meta">
                    {it.qty} × {Number(it.price || 0).toFixed(2)} €
                  </div>
                  <div className="to-item__sum">
                    {(Number(it.price || 0) * Number(it.qty || 1)).toFixed(2)} €
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
