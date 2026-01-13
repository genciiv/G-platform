import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from "react-icons/fi";
import { http } from "../../../lib/api.js";
import "./adminCategories.css";

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const [items, setItems] = useState([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await http.get("/api/categories");
      const list = res.data?.items || res.data?.categories || res.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setErr("Nuk u morën kategoritë.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (items || []).filter((c) => {
      if (!s) return true;
      return `${c?.name || ""} ${c?.slug || ""}`.toLowerCase().includes(s);
    });
  }, [items, q]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setName("");
    setSlug("");
    setOpen(true);
  }

  function openEdit(c) {
    setMode("edit");
    setEditingId(c._id);
    setName(c?.name || "");
    setSlug(c?.slug || "");
    setOpen(true);
  }

  function close() {
    if (saving) return;
    setOpen(false);
  }

  async function onSave(e) {
    e.preventDefault();
    setErr("");

    const payload = { name: name.trim(), slug: slug.trim() };
    if (!payload.name) return setErr("Emri është i detyrueshëm.");

    setSaving(true);
    try {
      if (mode === "create") await http.post("/api/categories", payload);
      else await http.put(`/api/categories/${editingId}`, payload);

      setOpen(false);
      await load();
    } catch {
      setErr("Nuk u ruajt kategoria.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c) {
    if (!window.confirm(`Ta fshij kategorinë "${c?.name}"?`)) return;
    setErr("");
    try {
      await http.delete(`/api/categories/${c._id}`);
      await load();
    } catch {
      setErr("Nuk u fshi kategoria.");
    }
  }

  return (
    <div className="ac-wrap">
      <div className="ac-head">
        <div>
          <h1 className="ac-title">Kategori</h1>
          <p className="ac-sub">Menaxho kategoritë (krijo/ndrysho/fshi).</p>
        </div>
        <button className="ac-btn ac-btnPrimary" onClick={openCreate} type="button">
          <FiPlus /> Shto kategori
        </button>
      </div>

      <div className="ac-toolbar">
        <div className="ac-search">
          <FiSearch />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kërko kategori..." />
        </div>
        <div className="ac-count">{filtered.length} kategori</div>
      </div>

      {err ? <div className="ac-alert">{err}</div> : null}

      {loading ? (
        <div className="ac-skel">Duke ngarkuar...</div>
      ) : (
        <div className="ac-grid">
          {filtered.map((c) => (
            <div className="ac-card" key={c._id}>
              <div className="ac-row">
                <div className="ac-name">{c?.name || "Kategori"}</div>
                <div className="ac-slug">{c?.slug || "—"}</div>
              </div>
              <div className="ac-actions">
                <button className="ac-mini" onClick={() => openEdit(c)} type="button">
                  <FiEdit2 /> Edit
                </button>
                <button className="ac-mini danger" onClick={() => onDelete(c)} type="button">
                  <FiTrash2 /> Fshi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="ac-overlay" onMouseDown={close}>
          <div className="ac-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ac-mhead">
              <div>
                <div className="ac-mtitle">{mode === "create" ? "Shto kategori" : "Ndrysho kategori"}</div>
                <div className="ac-msub">Fusha me * është e detyrueshme.</div>
              </div>
              <button className="ac-x" onClick={close} type="button">
                <FiX />
              </button>
            </div>

            <form className="ac-form" onSubmit={onSave}>
              <div className="ac-field">
                <label>Emri *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="p.sh. Rroba" />
              </div>

              <div className="ac-field">
                <label>Slug</label>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="p.sh. rroba" />
              </div>

              <div className="ac-factions">
                <button className="ac-btn" type="button" onClick={close} disabled={saving}>
                  Anulo
                </button>
                <button className="ac-btn ac-btnPrimary" type="submit" disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>

            {err ? <div className="ac-alert" style={{ marginTop: 10 }}>{err}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
