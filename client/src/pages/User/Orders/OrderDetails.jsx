// client/src/pages/User/Orders/OrderDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./orderDetails.css";
import { http, getErrMsg } from "../../../lib/api.js";
import { useUserAuth } from "../../../context/userAuth.jsx";

export default function OrderDetails() {
  const nav = useNavigate();
  const { id } = useParams();
  const { isUser, loading: authLoading } = useUserAuth();

  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const res = await http.get(`/api/orders/my/${encodeURIComponent(id)}`);
      setOrder(res.data?.item || null);
    } catch (e) {
      setErr(getErrMsg(e, "S’u mor porosia"));
      setOrder(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !isUser) nav("/user/login");
  }, [authLoading, isUser, nav]);

  useEffect(() => {
    if (!authLoading && isUser) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isUser, id]);

  const total = useMemo(() => Number(order?.total || 0), [order]);

  if (authLoading) return <div className="od-wrap">Loading...</div>;
  if (!isUser) return null;

  return (
    <div className="od-wrap">
      <div className="od-head">
        <div>
          <h1>Order Details</h1>
          <p className="od-sub">Detajet e porosisë tënde.</p>
        </div>

        <div className="od-actions">
          <Link className="od-btn od-btn--ghost" to="/account">
            ← Kthehu te Account
          </Link>
          <button className="od-btn" onClick={load} disabled={busy}>
            Rifresko
          </button>
        </div>
      </div>

      {err ? <div className="od-error">{err}</div> : null}

      <div className="od-card">
        {busy ? (
          <div className="od-empty">Duke ngarkuar...</div>
        ) : !order ? (
          <div className="od-empty">Porosia nuk u gjet.</div>
        ) : (
          <>
            <div className="od-top">
              <div className="od-kv">
                <div className="od-k">Kodi</div>
                <div className="od-v od-strong">{order.orderCode}</div>
              </div>

              <div className="od-kv">
                <div className="od-k">Status</div>
                <div className="od-v">
                  <span className={"od-pill " + pill(order.status)}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="od-kv od-right">
                <div className="od-k">Total</div>
                <div className="od-v od-strong">{total.toFixed(2)} €</div>
              </div>
            </div>

            <div className="od-split">
              <div className="od-box">
                <div className="od-boxTitle">Klienti</div>
                <div className="od-line">
                  <span>Emri:</span> <b>{order.customerName}</b>
                </div>
                <div className="od-line">
                  <span>Telefon:</span> <b>{order.phone}</b>
                </div>
                <div className="od-line">
                  <span>Adresë:</span> <b>{order.address}</b>
                </div>
                {order.note ? (
                  <div className="od-line">
                    <span>Shënim:</span> <b>{order.note}</b>
                  </div>
                ) : null}
                <div className="od-line od-muted">
                  Data: {fmt(order.createdAt)}
                </div>
              </div>

              <div className="od-box">
                <div className="od-boxTitle">Gjurmim</div>
                <div className="od-muted">
                  Nëse do ta shohësh edhe si “Track”:
                </div>
                <Link
                  className="od-link"
                  to={`/track?code=${encodeURIComponent(
                    order.orderCode
                  )}&phone=${encodeURIComponent(order.phone)}`}
                >
                  Shko te Track
                </Link>
              </div>
            </div>

            <div className="od-items">
              <div className="od-boxTitle">Artikujt</div>

              <div className="od-tableWrap">
                <table className="od-table">
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th>SKU</th>
                      <th className="od-right">Qty</th>
                      <th className="od-right">Çmimi</th>
                      <th className="od-right">Shuma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((it, idx) => {
                      const qty = Number(it.qty || 0);
                      const price = Number(it.price || 0);
                      return (
                        <tr key={idx}>
                          <td className="od-strong">{it.title || "-"}</td>
                          <td className="od-muted">
                            {it.productId?.sku || "-"}
                          </td>
                          <td className="od-right">{qty}</td>
                          <td className="od-right">{price.toFixed(2)} €</td>
                          <td className="od-right od-strong">
                            {(qty * price).toFixed(2)} €
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="od-totalRow">
                <div className="od-muted">Total</div>
                <div className="od-strong">{total.toFixed(2)} €</div>
              </div>
            </div>
          </>
        )}
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

function pill(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("deliver")) return "is-green";
  if (s.includes("ship")) return "is-blue";
  if (s.includes("cancel")) return "is-red";
  return "is-gray";
}
