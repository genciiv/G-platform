import React, { useEffect, useMemo, useState } from "react";
import "./adminWarehouses.css";
import { http, getErrMsg } from "../../../lib/api.js";

export default function AdminWarehouses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get("/api/warehouses");

      // ✅ suporton te dy formatet:
      // 1) res.json(itemsArray)
      // 2) res.json({ items: itemsArray })
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.items || [];

      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren magazinat"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setCode("");
    setLocation("");
    setActive(true);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setName(w.name || "");
    setCode(w.code || "");
    setLocation(w.location || "");
    setActive(w.active ?? true);
    setOpen(true);
  };

  async function save(e) {
    e.preventDefault();
    setErr("");
    try {
      const payload = { name, code, location, active };

      if (editing?._id) {
        await http.put(`/api/warehouses/${editing._id}`, payload);
      } else {
        await http.post("/api/warehouses", payload);
      }

      setOpen(false);
      resetForm();
      await load();
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u ruajt magazina"));
    }
  }

  async function remove(id) {
    if (!window.confirm("Ta fshij këtë magazinë?")) return;
    setErr("");
    try {
      await http.delete(`/api/warehouses/${id}`);
      await load();
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u fshi magazina"));
    }
  }

  const countActive = useMemo(
    () => items.filter((x) => (x.active ?? true) === true).length,
    [items]
  );

  return (
    <div className="aw-wrap">
      <div className="aw-head">
        <div>
          <h2>Magazina</h2>
          <p>Shto / edit / fshi magazina.</p>
        </div>

        <div className="aw-actions">
          <button className="aw-btn aw-btn--primary" onClick={openCreate}>
            + Shto magazinë
          </button>
          <button className="aw-btn" onClick={load} disabled={loading}>
            Rifresko
          </button>
        </div>
      </div>

      <div className="aw-stats">
        <div className="aw-stat">
          <div className="aw-stat__label">Gjithsej</div>
          <div className="aw-stat__value">{items.length}</div>
        </div>
        <div className="aw-stat">
          <div className="aw-stat__label">Aktive</div>
          <div className="aw-stat__value">{countActive}</div>
        </div>
      </div>

      {err ? <div className="aw-error">{err}</div> : null}

      <div className="aw-card">
        {loading ? (
          <div className="aw-empty">Duke ngarkuar...</div>
        ) : items.length === 0 ? (
          <div className="aw-empty">S’ka magazina.</div>
        ) : (
          <table className="aw-table">
            <thead>
              <tr>
                <th>Emri</th>
                <th>Kodi</th>
                <th>Lokacion</th>
                <th>Status</th>
                <th className="aw-col-actions">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w._id}>
                  <td className="aw-strong">{w.name}</td>
                  <td>{w.code || "-"}</td>
                  <td>{w.location || "-"}</td>
                  <td>
                    <span
                      className={
                        "aw-pill " + ((w.active ?? true) ? "is-green" : "is-gray")
                      }
                    >
                      {(w.active ?? true) ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="aw-actions-cell">
                    <button className="aw-btn" onClick={() => openEdit(w)}>
                      Edit
                    </button>
                    <button
                      className="aw-btn aw-btn--danger"
                      onClick={() => remove(w._id)}
                    >
                      Fshi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open ? (
        <div className="aw-modalOverlay" onMouseDown={() => setOpen(false)}>
          <div className="aw-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="aw-modalHead">
              <div className="aw-modalTitle">
                {editing ? "Edit magazinë" : "Shto magazinë"}
              </div>
              <button className="aw-x" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <form className="aw-form" onSubmit={save}>
              <label>Emri *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Kodi</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="p.sh. WH-01"
              />

              <label>Lokacion</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="p.sh. Fier"
              />

              <label className="aw-check">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active
              </label>

              <button className="aw-btn aw-btn--primary" type="submit">
                Ruaj
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
