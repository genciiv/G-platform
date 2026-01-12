import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http, getErrMsg } from "../../../lib/api.js";
import { useUserAuth } from "../../../context/userAuth.jsx";
import "./account.css";

export default function Account() {
  const nav = useNavigate();
  const { user, logout } = useUserAuth();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [orders, setOrders] = useState([]);

  async function loadMyOrders() {
    setErr("");
    setBusy(true);
    try {
      const res = await http.get("/api/orders/my");
      setOrders(res.data?.items || []);
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u ngarkuan porositë."));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogout() {
    await logout();
    nav("/");
  }

  return (
    <div className="acc-wrap">
      <div className="acc-card">
        <div className="acc-head">
          <div>
            <h1>Account</h1>
            <p className="acc-sub">
              I loguar si: <b>{user?.name || "-"}</b> — {user?.email || "-"}
            </p>
          </div>

          <div className="acc-actions">
            <button className="acc-btn acc-btn--ghost" onClick={loadMyOrders} disabled={busy}>
              {busy ? "Duke rifreskuar..." : "Rifresko"}
            </button>
            <button className="acc-btn" onClick={onLogout}>Dil</button>
          </div>
        </div>

        {err ? <div className="acc-error">{err}</div> : null}

        <div className="acc-section">
          <h2>My Orders</h2>

          {busy ? (
            <div className="acc-muted">Duke ngarkuar...</div>
          ) : orders.length === 0 ? (
            <div className="acc-muted">
              S’ke porosi ende. <Link to="/products">Shko te produktet</Link>
            </div>
          ) : (
            <div className="acc-orders">
              {orders.map((o) => (
                <div className="acc-order" key={o._id}>
                  <div className="acc-orderTop">
                    <div className="acc-code">{o.orderCode}</div>
                    <span className={"acc-pill " + pillClass(o.status)}>
                      {o.status}
                    </span>
                  </div>

                  <div className="acc-row">
                    <div>
                      <div className="acc-k">Total</div>
                      <div className="acc-v">{Number(o.total || 0).toFixed(2)} €</div>
                    </div>
                    <div>
                      <div className="acc-k">Data</div>
                      <div className="acc-v">{fmt(o.createdAt)}</div>
                    </div>
                    <div>
                      <div className="acc-k">Artikuj</div>
                      <div className="acc-v">{(o.items || []).length}</div>
                    </div>
                  </div>

                  <div className="acc-items">
                    {(o.items || []).slice(0, 4).map((it, idx) => (
                      <div className="acc-item" key={idx}>
                        <div className="acc-itemTitle">{it.title}</div>
                        <div className="acc-itemMeta">
                          {Number(it.qty || 0)} × {Number(it.price || 0).toFixed(2)} €
                        </div>
                      </div>
                    ))}

                    {(o.items || []).length > 4 ? (
                      <div className="acc-muted">+ {(o.items || []).length - 4} artikuj të tjerë</div>
                    ) : null}
                  </div>

                  <div className="acc-foot">
                    <Link
                      className="acc-link"
                      to={`/track?code=${encodeURIComponent(o.orderCode)}&phone=${encodeURIComponent(o.phone || "")}`}
                    >
                      Hap te Gjurmimi →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="acc-note">
          <b>Shënim:</b> Porositë lidhen me userin vetëm nëse porosia krijohet ndërsa je i loguar.
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

function pillClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("ship")) return "is-blue";
  if (s.includes("deliv")) return "is-green";
  if (s.includes("cancel")) return "is-red";
  return "is-gray"; // Pending
}
