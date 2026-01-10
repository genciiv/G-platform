// client/src/pages/TrackOrder/TrackOrder.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { http, getErrMsg } from "../../lib/api.js";
import "./trackOrder.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TrackOrder() {
  const q = useQuery();
  const [code, setCode] = useState(q.get("code") || "");
  const [phone, setPhone] = useState(q.get("phone") || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  async function search(e) {
    e?.preventDefault?.();
    setErr("");
    setOrder(null);

    const c = code.trim();
    const p = phone.trim();

    if (!c || !p) return setErr("Vendos kodin dhe telefonin.");

    setBusy(true);
    try {
      const res = await http.get(
        `/api/orders/track?code=${encodeURIComponent(
          c
        )}&phone=${encodeURIComponent(p)}`
      );

      // ✅ server kthen direkt order (jo {item})
      setOrder(res.data || null);
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u gjet porosia"));
    } finally {
      setBusy(false);
    }
  }

  // auto-search nese vjen me query params
  useEffect(() => {
    if ((q.get("code") || "") && (q.get("phone") || "")) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="to-wrap">
      <div className="to-card">
        <h2>Gjurmim Porosie</h2>
        <p>Shkruaj kodin dhe telefonin që ke përdorur te porosia.</p>

        <form className="to-form" onSubmit={search}>
          <div className="to-row">
            <label>
              Kodi
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="p.sh. G-20260108-918410"
              />
            </label>

            <label>
              Telefoni
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="p.sh. 069xxxxxxx"
              />
            </label>
          </div>

          <button className="to-btn" type="submit" disabled={busy}>
            {busy ? "Duke kërkuar..." : "Kërko"}
          </button>
        </form>

        {err ? <div className="to-error">{err}</div> : null}

        {order ? (
          <div className="to-result">
            <div className="to-kv">
              <div>
                <div className="to-k">Kodi</div>
                <div className="to-v">{order.orderCode}</div>
              </div>
              <div>
                <div className="to-k">Statusi</div>
                <div className="to-v">
                  <span className={"to-pill " + pillClass(order.status)}>
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
              <div>
                <div className="to-k">Totali</div>
                <div className="to-v">
                  {Number(order.total || 0).toFixed(2)} €
                </div>
              </div>
            </div>

            <div className="to-sub">
              <b>Klienti:</b> {order.customerName} — {order.phone}
              <br />
              <b>Adresa:</b> {order.address}
              {order.note ? (
                <>
                  <br />
                  <b>Shënim:</b> {order.note}
                </>
              ) : null}
            </div>

            <div className="to-items">
              <div className="to-itemsTitle">Artikujt</div>
              <table className="to-table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th className="to-right">Qty</th>
                    <th className="to-right">Çmimi</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.title || it.productId?.title || "-"}</td>
                      <td className="to-right">{Number(it.qty || 0)}</td>
                      <td className="to-right">
                        {Number(it.price || 0).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="to-foot">
              <div className="to-muted">Data: {fmt(order.createdAt)}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function fmt(iso) {
  try {
    return iso ? new Date(iso).toLocaleString() : "-";
  } catch {
    return iso || "-";
  }
}

function pillClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("deliv")) return "is-green";
  if (s.includes("ship")) return "is-green";
  if (s.includes("cancel")) return "is-red";
  return "is-gray";
}
