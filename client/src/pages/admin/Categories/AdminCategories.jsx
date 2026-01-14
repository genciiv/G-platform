import React, { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCcw, FiSearch } from "react-icons/fi";
import { http, getErrMsg } from "../../../lib/api.js";
import "./adminCategories.css";

const emptyForm = {
  name: "",
  slug: "",
  showOnHome: false,
  sortOrder: 0,
};

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const res = await http.get("/api/categories");
      const cats = res.data?.items || res.data?.categories || res.data || [];
      setItems(Array.isArray(cats) ? cats : []);
    } catch (e) {
      setErr(getErrMsg(e, "Nuk u morën kategoritë."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return (items || []).filter((c) =>
      `${c?.name || ""} ${c?.slug || ""}`.toLowerCase().includes(s)
    );
  }, [items, q]);

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c?.name || "",
      slug: c?.slug || "",
      showOnHome: !!c?.showOnHome,
      sortOrder: Number.isFinite(Number(c?.sortOrder)) ? Number(c.sortOrder) : 0,
    });
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  async function save() {
    const name = (form.name || "").trim();
    const slug = (form.slug || "").trim();
    const sortOrder = Number(form.sortOrder);

    if (!name) return alert("Shkruaj emrin e kategorisë.");
    if (!slug) return alert("Shkruaj slug (p.sh. teknologji).");
    if (!Number.isFinite(sortOrder)) return alert("Sort order s’është i saktë.");

    const payload = {
      name,
      slug,
      showOnHome: !!form.showOnHome,
      sortOrder,
    };

    setSaving(true);
    try {
      if (editing?._id) {
        await http.put(`/api/categories/${editing._id}`, payload);
      } else {
        await http.post("/api/categories", payload);
      }
      setOpen(false);
      await loadAll();
    } catch (e) {
      alert(getErrMsg(e, "Gabim gjatë ruajtjes së kategorisë."));
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(c) {
    const ok = confirm(`Ta fshij kategorinë "${c?.name}"?`);
    if (!ok) return;
    try {
      await http.delete(`/api/categories/${c._id}`);
      await loadAll();
    } catch (e) {
      alert(getErrMsg(e, "Nuk u fshi kategoria."));
    }
  }

  return (
    <div className="ac">
      <div className="ac-top">
        <div>
          <div className="ac-pill">Paneli i administrimit</div>
          <h1>Kategori</h1>
          <p>Menaxho kategoritë (krijo/ndrysho/fshi). Aktivizo “Show on Home” që të dalë në Home.</p>
        </div>

        <div className="ac-actions">
          <button className="ac-btn" onClick={loadAll} type="button">
            <FiRefreshCcw /> Rifresko
          </button>
          <button className="ac-btn ac-btn-primary" onClick={openCreate} type="button">
            <FiPlus /> Shto kategori
          </button>
        </div>
      </div>

      <div className="ac-toolbar">
        <div className="ac-search">
          <FiSearch />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kërko kategori (emër / slug)..."
          />
        </div>
        <div className="ac-count">
          {filtered.length} kategori{filtered.length === 1 ? "" : "i"}
        </div>
      </div>

      {loading ? (
        <div className="ac-empty">
          <div className="ac-spin" />
          <div className="ac-empty-title">Duke ngarkuar...</div>
        </div>
      ) : err ? (
        <div className="ac-empty">
          <div className="ac-empty-title">{err}</div>
          <button className="ac-btn" onClick={loadAll} type="button">
            <FiRefreshCcw /> Provo prap
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-title">S’ka kategori.</div>
          <div className="ac-empty-sub">Shto kategorinë e parë nga butoni sipër.</div>
        </div>
      ) : (
        <div className="ac-grid">
          {filtered.map((c) => (
            <div className="ac-card" key={c._id}>
              <div className="ac-card-head">
                <div className="ac-name">{c?.name}</div>
                <div className="ac-slug">{c?.slug}</div>
              </div>

              <div className="ac-badges">
                <span className={c?.showOnHome ? "ac-badge ac-on" : "ac-badge ac-off"}>
                  {c?.showOnHome ? "Show on Home" : "Hidden"}
                </span>
                <span className="ac-badge ac-neutral">Sort: {Number(c?.sortOrder || 0)}</span>
              </div>

              <div className="ac-row">
                <button className="ac-btn" onClick={() => openEdit(c)} type="button">
                  <FiEdit2 /> Edit
                </button>
                <button className="ac-btn ac-danger" onClick={() => removeItem(c)} type="button">
                  <FiTrash2 /> Fshi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div className="ac-modal-backdrop" onMouseDown={closeModal} role="presentation">
          <div className="ac-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ac-modal-head">
              <div>
                <div className="ac-modal-title">
                  {editing ? "Ndrysho kategori" : "Shto kategori"}
                </div>
                <div className="ac-modal-sub">
                  Vendos “Show on Home” + “Sort order” për renditje në Home.
                </div>
              </div>

              <button className="ac-icon-btn" onClick={closeModal} type="button">
                <FiX />
              </button>
            </div>

            <div className="ac-form">
              <div className="ac-col">
                <label className="ac-label">Emri</label>
                <input
                  className="ac-input"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="p.sh. Teknologji"
                />
              </div>

              <div className="ac-2col">
                <div className="ac-col">
                  <label className="ac-label">Slug</label>
                  <input
                    className="ac-input"
                    value={form.slug}
                    onChange={(e) => setField("slug", e.target.value)}
                    placeholder="p.sh. teknologji"
                  />
                </div>

                <div className="ac-col">
                  <label className="ac-label">Sort order</label>
                  <input
                    className="ac-input"
                    value={form.sortOrder}
                    onChange={(e) => setField("sortOrder", e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="ac-check">
                <label className="ac-switch">
                  <input
                    type="checkbox"
                    checked={!!form.showOnHome}
                    onChange={(e) => setField("showOnHome", e.target.checked)}
                  />
                  <span />
                  <b>{form.showOnHome ? "Show on Home: Po" : "Show on Home: Jo"}</b>
                </label>
                <div className="ac-hint">
                  Vetëm kategoritë me “Show on Home = Po” dalin në Homepage.
                </div>
              </div>
            </div>

            <div className="ac-modal-foot">
              <button className="ac-btn" onClick={closeModal} type="button" disabled={saving}>
                Anulo
              </button>
              <button className="ac-btn ac-btn-primary" onClick={save} type="button" disabled={saving}>
                {saving ? "Duke ruajtur..." : "Ruaj"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
