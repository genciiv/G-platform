// client/src/pages/admin/Orders/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./adminOrders.css";
import { http, getErrMsg } from "../../../lib/api.js";

const STATUSES = ["Pending", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(""); // search by code/phone/name

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get("/api/orders");
      const list = res.data?.items || res.data?.orders || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren porositë"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;

    return items.filter((o) => {
      const code = (o.orderCode || "").toLowerCase();
      const name = (o.customerName || "").toLowerCase();
      const phone = (o.phone || "").toLowerCase();
      return code.includes(t) || name.includes(t) || phone.includes(t);
    });
  }, [items, q]);

  const totalOrders = filtered.length;

  const sumRevenue = useMemo(() => {
    return filtered.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [filtered]);

  async function changeStatus(orderId, status) {
    setErr("");
    setBusyId(orderId);
    try {
      await http.patch(`/api/orders/${orderId}/status`, { status });
      // refresh list
      await load();
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u ndryshua statusi"));
    } finally {
      setBusyId(null);
    }
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || "-";
    }
  }

  return (
    <div className="ao-wrap">
      <div className="ao-head">
        <div>
          <h2>Porositë</h2>
          <p>Shiko porositë dhe ndrysho statusin.</p>
        </div>

        <div className="ao-actions">
          <input
            className="ao-search"
            placeholder="Kërko (kod / emër / telefon)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="ao-btn" onClick={load} disabled={loading}>
            Rifresko
          </button>
        </div>
      </div>

      <div className="ao-stats">
        <div className="ao-stat">
          <div className="ao-stat__label">Nr. porosish</div>
          <div className="ao-stat__value">{totalOrders}</div>
        </div>
        <div className="ao-stat">
          <div className="ao-stat__label">Totali (€)</div>
          <div className="ao-stat__value">{sumRevenue.toFixed(2)}</div>
        </div>
      </div>

      {err ? <div className="ao-error">{err}</div> : null}

      <div className="ao-card">
        {loading ? (
          <div className="ao-empty">Duke ngarkuar...</div>
        ) : filtered.length === 0 ? (
          <div className="ao-empty">S’ka porosi.</div>
        ) : (
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Kodi</th>
                  <th>Klienti</th>
                  <th>Totali</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th className="ao-col-actions">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const id = o._id || o.id;
                  const code = o.orderCode || "-";
                  const name = o.customerName || "-";
                  const phone = o.phone || "-";
                  const total = Number(o.total || 0).toFixed(2);
                  const status = o.status || "Pending";
                  const when = fmtDate(o.createdAt);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="ao-code">{code}</div>
                        <div className="ao-sub">
                          Items: {o.items?.length || 0}
                        </div>
                      </td>
                      <td>
                        <div className="ao-name">{name}</div>
                        <div className="ao-sub">{phone}</div>
                        {o.address ? (
                          <div className="ao-sub">{o.address}</div>
                        ) : null}
                      </td>
                      <td className="ao-money">{total} €</td>
                      <td>
                        <span className={"ao-pill " + pillClass(status)}>
                          {status}
                        </span>
                      </td>
                      <td className="ao-sub">{when}</td>
                      <td className="ao-actions-cell">
                        <select
                          className="ao-select"
                          value={status}
                          disabled={busyId === id}
                          onChange={(e) => changeStatus(id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <button
                          className="ao-btn ao-btn--ghost"
                          type="button"
                          onClick={() => alert(renderOrderDetails(o))}
                        >
                          Detaje
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function pillClass(status) {
  if (status === "Delivered") return "is-green";
  if (status === "Shipped") return "is-blue";
  if (status === "Cancelled") return "is-red";
  return "is-gray"; // Pending
}

function renderOrderDetails(o) {
  const lines = [];
  lines.push(`Kodi: ${o.orderCode}`);
  lines.push(`Status: ${o.status}`);
  lines.push(`Klienti: ${o.customerName}`);
  lines.push(`Tel: ${o.phone}`);
  lines.push(`Adresa: ${o.address}`);
  if (o.note) lines.push(`Shenim: ${o.note}`);
  lines.push(`--- Artikuj ---`);
  (o.items || []).forEach((it) => {
    lines.push(
      `${it.qty} x ${it.title}  (${Number(it.price || 0).toFixed(2)}€) = ${(
        Number(it.price || 0) * Number(it.qty || 1)
      ).toFixed(2)}€`
    );
  });
  lines.push(`---`);
  lines.push(`Total: ${Number(o.total || 0).toFixed(2)}€`);
  return lines.join("\n");
}
