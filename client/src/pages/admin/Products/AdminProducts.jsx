// client/src/pages/Admin/Products/AdminProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./adminProducts.css";
import { http, getErrMsg } from "../../../lib/api.js";

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // form
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [active, setActive] = useState(true);
  const [image, setImage] = useState("");
  const [desc, setDesc] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const list = res.data?.items || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren produktet"));
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
    const activeCount = items.filter((x) => (x.active ?? true) === true).length;
    return { total, activeCount };
  }, [items]);

  function resetForm() {
    setTitle("");
    setSku("");
    setPrice("");
    setActive(true);
    setImage("");
    setDesc("");
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setTitle(p.title || p.name || "");
    setSku(p.sku || "");
    setPrice(String(p.price ?? ""));
    setActive(p.active ?? true);

    // prano disa forma images: image, thumbnail, images[0]
    const img =
      p.image ||
      p.thumbnail ||
      (Array.isArray(p.images) ? p.images[0] : "") ||
      "";
    setImage(img || "");
    setDesc(p.description || p.desc || "");
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      title: title.trim(),
      sku: sku.trim(),
      price: Number(price || 0),
      active: !!active,
      description: desc.trim(),
    };

    // nqs serveri yt ruan images si array:
    if (image.trim()) payload.images = [image.trim()];

    try {
      if (editing?._id) {
        await http.put(`/api/products/${editing._id}`, payload);
      } else {
        await http.post("/api/products", payload);
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u ruajt produkti"));
    }
  }

  async function remove(id) {
    if (!confirm("Ta fshij këtë produkt?")) return;
    setErr("");
    try {
      await http.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u fshi produkti"));
    }
  }

  async function doSearch(e) {
    e.preventDefault();
    await load();
  }

  return (
    <div className="ap-wrap">
      <div className="ap-head">
        <div>
          <h2>Produkte</h2>
          <p>Menaxho produktet (shto / edit / fshi).</p>
        </div>

        <div className="ap-headRight">
          <form className="ap-search" onSubmit={doSearch}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko: kod, emër, SKU..."
            />
            <button className="ap-btn" type="submit" disabled={loading}>
              Kërko
            </button>
          </form>

          <div className="ap-actions">
            <button className="ap-btn ap-btn--primary" onClick={openCreate}>
              + Shto produkt
            </button>
            <button className="ap-btn" onClick={load} disabled={loading}>
              Rifresko
            </button>
          </div>
        </div>
      </div>

      <div className="ap-stats">
        <div className="ap-stat">
          <div className="ap-stat__label">Gjithsej</div>
          <div className="ap-stat__value">{stats.total}</div>
        </div>
        <div className="ap-stat">
          <div className="ap-stat__label">Aktive</div>
          <div className="ap-stat__value">{stats.activeCount}</div>
        </div>
      </div>

      {err ? <div className="ap-error">{err}</div> : null}

      <div className="ap-card">
        {loading ? (
          <div className="ap-empty">Duke ngarkuar...</div>
        ) : items.length === 0 ? (
          <div className="ap-empty">S’ka produkte.</div>
        ) : (
          <div className="ap-tableWrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>SKU</th>
                  <th className="ap-right">Çmimi</th>
                  <th>Status</th>
                  <th className="ap-col-actions">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="ap-prod">
                        <div className="ap-thumb">
                          {getImg(p) ? (
                            <img src={getImg(p)} alt="" />
                          ) : (
                            <span>🧥</span>
                          )}
                        </div>
                        <div>
                          <div className="ap-strong">{p.title || p.name || "Produkt"}</div>
                          <div className="ap-sub">
                            {p.description || p.desc || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="ap-sub">{p.sku || "—"}</td>
                    <td className="ap-right ap-strong">
                      {Number(p.price || 0).toFixed(2)} €
                    </td>
                    <td>
                      <span className={"ap-pill " + ((p.active ?? true) ? "is-green" : "is-gray")}>
                        {(p.active ?? true) ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="ap-actionsCell">
                      <button className="ap-btn" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button className="ap-btn ap-btn--danger" onClick={() => remove(p._id)}>
                        Fshi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <div className="ap-modalOverlay" onMouseDown={() => setOpen(false)}>
          <div className="ap-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ap-modalHead">
              <div className="ap-modalTitle">{editing ? "Edit produkt" : "Shto produkt"}</div>
              <button className="ap-x" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="ap-form" onSubmit={save}>
              <div className="ap-row2">
                <label>
                  Emri / Titulli *
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                  SKU
                  <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="p.sh. SKU-001" />
                </label>
              </div>

              <div className="ap-row2">
                <label>
                  Çmimi (€) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </label>
                <label className="ap-check">
                  Aktiv
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                </label>
              </div>

              <label>
                Foto (URL)
                <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
              </label>

              <label>
                Përshkrim
                <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Shkruaj përshkrimin..." />
              </label>

              <div className="ap-formActions">
                <button className="ap-btn ap-btn--primary" type="submit">
                  Ruaj
                </button>
                <button className="ap-btn" type="button" onClick={() => { setOpen(false); resetForm(); }}>
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getImg(p) {
  if (!p) return "";
  if (p.image) return p.image;
  if (p.thumbnail) return p.thumbnail;
  if (Array.isArray(p.images) && p.images[0]) return p.images[0];
  return "";
}
