// client/src/pages/Admin/Orders/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./adminOrders.css";
import { http, getErrMsg } from "../../../lib/api.js";

const STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get(`/api/orders${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren porositë"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((x) => String(x.status || "").toLowerCase() === "pending").length;
    return { total, pending };
  }, [items]);

  async function setStatus(orderId, status) {
    setErr("");
    try {
      await http.patch(`/api/orders/${orderId}/status`, { status });
      await load();
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u përditësua statusi"));
    }
  }

  async function doSearch(e) {
    e.preventDefault();
    await load();
  }

  return (
    <div className="ao-wrap">
      <div className="ao-head">
        <div>
          <h2>Porosi</h2>
          <p>Shiko dhe përditëso statusin e porosive.</p>
        </div>

        <div className="ao-headRight">
          <form className="ao-search" onSubmit={doSearch}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko: kod, emër, telefon..."
            />
            <button className="ao-btn" type="submit" disabled={loading}>
              Kërko
            </button>
          </form>

          <div className="ao-actions">
            <button className="ao-btn" onClick={load} disabled={loading}>
              Rifresko
            </button>
          </div>
        </div>
      </div>

      <div className="ao-stats">
        <div className="ao-stat">
          <div className="ao-stat__label">Gjithsej</div>
          <div className="ao-stat__value">{stats.total}</div>
        </div>
        <div className="ao-stat">
          <div className="ao-stat__label">Pending</div>
          <div className="ao-stat__value">{stats.pending}</div>
        </div>
      </div>

      {err ? <div className="ao-error">{err}</div> : null}

      <div className="ao-card">
        {loading ? (
          <div className="ao-empty">Duke ngarkuar...</div>
        ) : items.length === 0 ? (
          <div className="ao-empty">S’ka porosi.</div>
        ) : (
          <div className="ao-tableWrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Kodi</th>
                  <th>Klienti</th>
                  <th className="ao-right">Total</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th className="ao-col-actions">Ndrysho</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o._id}>
                    <td className="ao-strong">{o.orderCode || o.code || "-"}</td>
                    <td>
                      <div className="ao-strong">{o.customerName || "-"}</div>
                      <div className="ao-sub">
                        {o.phone || "-"} • {o.address || "-"}
                      </div>
                    </td>
                    <td className="ao-right ao-strong">
                      {Number(o.total || 0).toFixed(2)} €
                    </td>
                    <td>
                      <span className={"ao-pill " + pillClass(o.status)}>
                        {o.status || "Pending"}
                      </span>
                    </td>
                    <td className="ao-sub">{fmt(o.createdAt)}</td>
                    <td className="ao-actionsCell">
                      <select
                        className="ao-select"
                        value={o.status || "Pending"}
                        onChange={(e) => setStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function pillClass(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("deliver")) return "is-green";
  if (s.includes("ship")) return "is-blue";
  if (s.includes("cancel")) return "is-red";
  return "is-gray";
}
