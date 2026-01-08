// client/src/pages/admin/Products/AdminProducts.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./adminProducts.css";
import { http, getErrMsg } from "../../../lib/api.js";

const emptyForm = {
  title: "",
  price: "",
  sku: "",
  description: "",
  image: "",
  active: true,
};

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((p) => {
      const a = (p.title || p.name || "").toLowerCase();
      const b = (p.sku || "").toLowerCase();
      return a.includes(t) || b.includes(t);
    });
  }, [rows, q]);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await http.get("/api/products");
      const list = res.data?.items || res.data?.products || res.data || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren produktet"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setMode("create");
    setCurrentId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p) {
    setMode("edit");
    setCurrentId(p._id || p.id);
    setForm({
      title: p.title || p.name || "",
      price: p.price ?? "",
      sku: p.sku || "",
      description: p.description || "",
      image: p.image || p.imageUrl || "",
      active: p.active ?? true,
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setErr("");
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    const payload = {
      title: form.title.trim(),
      // serverët shpesh duan number
      price: form.price === "" ? 0 : Number(form.price),
      sku: form.sku.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      active: !!form.active,
    };

    if (!payload.title) return setErr("Titulli është i detyrueshëm");

    setBusy(true);
    try {
      if (mode === "create") {
        await http.post("/api/products", payload);
      } else {
        await http.put(`/api/products/${currentId}`, payload);
      }
      await load();
      setOpen(false);
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u ruajt produkti"));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(p) {
    const id = p._id || p.id;
    const name = p.title || p.name || "produkt";
    if (!confirm(`Ta fshij “${name}”?`)) return;

    setBusy(true);
    setErr("");
    try {
      await http.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u fshi produkti"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ap-wrap">
      <div className="ap-head">
        <div>
          <h2>Produkte</h2>
          <p>Këtu bëjmë CRUD të produkteve (add/edit/delete).</p>
        </div>

        <div className="ap-actions">
          <input
            className="ap-search"
            placeholder="Kërko (titull / SKU)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="ap-btn ap-btn--primary" onClick={openCreate}>
            + Shto produkt
          </button>
        </div>
      </div>

      {err ? <div className="ap-error">{err}</div> : null}

      <div className="ap-card">
        {loading ? (
          <div className="ap-empty">Duke ngarkuar...</div>
        ) : filtered.length === 0 ? (
          <div className="ap-empty">S’ka produkte.</div>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th>SKU</th>
                <th>Çmimi</th>
                <th>Status</th>
                <th className="ap-col-actions">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const id = p._id || p.id;
                const title = p.title || p.name || "(pa emër)";
                const price = Number(p.price || 0).toFixed(2);
                const sku = p.sku || "-";
                const active = p.active ?? true;

                return (
                  <tr key={id}>
                    <td className="ap-prod">
                      <div className="ap-prod__title">{title}</div>
                      {p.description ? (
                        <div className="ap-prod__desc">{p.description}</div>
                      ) : null}
                    </td>
                    <td>{sku}</td>
                    <td>{price} €</td>
                    <td>
                      <span
                        className={"ap-pill " + (active ? "is-on" : "is-off")}
                      >
                        {active ? "Aktiv" : "Jo aktiv"}
                      </span>
                    </td>
                    <td className="ap-actions-cell">
                      <button
                        className="ap-btn ap-btn--ghost"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="ap-btn ap-btn--danger"
                        onClick={() => onDelete(p)}
                        disabled={busy}
                      >
                        Fshi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {open ? (
        <div className="ap-modal-backdrop" onClick={closeModal}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal__head">
              <h3>{mode === "create" ? "Shto produkt" : "Edit produkt"}</h3>
              <button className="ap-x" onClick={closeModal} type="button">
                ✕
              </button>
            </div>

            <form className="ap-form" onSubmit={submit}>
              <div className="ap-grid">
                <div className="ap-field">
                  <label>Titulli *</label>
                  <input name="title" value={form.title} onChange={onChange} />
                </div>

                <div className="ap-field">
                  <label>Çmimi (€)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={onChange}
                  />
                </div>

                <div className="ap-field">
                  <label>SKU</label>
                  <input name="sku" value={form.sku} onChange={onChange} />
                </div>

                <div className="ap-field">
                  <label>Image URL</label>
                  <input name="image" value={form.image} onChange={onChange} />
                </div>

                <div className="ap-field ap-field--full">
                  <label>Përshkrimi</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={form.description}
                    onChange={onChange}
                  />
                </div>

                <div className="ap-field ap-check">
                  <label className="ap-check__row">
                    <input
                      name="active"
                      type="checkbox"
                      checked={!!form.active}
                      onChange={onChange}
                    />
                    Aktiv
                  </label>
                </div>
              </div>

              {err ? <div className="ap-error">{err}</div> : null}

              <div className="ap-modal__foot">
                <button className="ap-btn" type="button" onClick={closeModal}>
                  Anulo
                </button>
                <button
                  className="ap-btn ap-btn--primary"
                  disabled={busy}
                  type="submit"
                >
                  {busy ? "Duke ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
