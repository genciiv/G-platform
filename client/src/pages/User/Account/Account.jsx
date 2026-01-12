// client/src/pages/User/Account/Account.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./account.css";
import { useUserAuth } from "../../../context/userAuth.jsx";
import { http, getErrMsg } from "../../../lib/api.js";

export default function Account() {
  const nav = useNavigate();
  const { user, isUser, loading: authLoading } = useUserAuth();

  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");

  async function loadMyOrders() {
    setErr("");
    setBusy(true);
    try {
      const res = await http.get("/api/orders/my");
      const list = res.data?.items || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u morën porositë"));
      setOrders([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !isUser) nav("/auth");
  }, [authLoading, isUser, nav]);

  useEffect(() => {
    if (!authLoading && isUser) loadMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isUser]);

  if (authLoading) return <div className="acc-wrap">Loading...</div>;
  if (!isUser) return null;

  return (
    <div className="acc-wrap">
      <div className="acc-head">
        <div>
          <h1>Account</h1>
          <p className="acc-sub">
            Mirësevjen, <b>{user?.name || "User"}</b>
          </p>
        </div>
      </div>

      <div className="acc-card">
        <div className="acc-kv">
          <div>
            <div className="acc-k">Emri</div>
            <div className="acc-v">{user?.name || "-"}</div>
          </div>
          <div>
            <div className="acc-k">Email</div>
            <div className="acc-v">{user?.email || "-"}</div>
          </div>
        </div>
      </div>

      <div className="acc-orders">
        <div className="acc-ordersHead">
          <h2>My Orders</h2>
          <button className="acc-btn" onClick={loadMyOrders} disabled={busy}>
            Rifresko
          </button>
        </div>

        {err ? <div className="acc-error">{err}</div> : null}

        <div className="acc-card">
          {busy ? (
            <div className="acc-empty">Duke ngarkuar...</div>
          ) : orders.length === 0 ? (
            <div className="acc-empty">
              S’ke porosi ende. <Link to="/products">Shko te produktet</Link>
            </div>
          ) : (
            <div className="acc-tableWrap">
              <table className="acc-table">
                <thead>
                  <tr>
                    <th>Kodi</th>
                    <th>Status</th>
                    <th className="acc-right">Total</th>
                    <th>Data</th>
                    <th>Track</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="acc-strong">{o.orderCode}</td>
                      <td>
                        <span className={"acc-pill " + pill(o.status)}>
                          {o.status}
                        </span>
                      </td>
                      <td className="acc-right acc-strong">
                        {Number(o.total || 0).toFixed(2)} €
                      </td>
                      <td className="acc-sub">{fmt(o.createdAt)}</td>
                      <td>
                        <Link
                          className="acc-link"
                          to={`/track?code=${encodeURIComponent(
                            o.orderCode
                          )}&phone=${encodeURIComponent(o.phone || "")}`}
                        >
                          Track
                        </Link>
                      </td>
                      <td>
                        <Link className="acc-link" to={`/account/orders/${o._id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="acc-hint">
                * Track kërkon edhe telefonin (si te porosia).
              </div>
            </div>
          )}
        </div>
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
