import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCcw,
  FiSearch,
  FiImage,
} from "react-icons/fi";
import { http } from "../../../lib/api.js";
import "./adminProducts.css";

function money(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function pickImage(p) {
  const imgs = p?.images || p?.imageUrls || p?.photos || [];
  if (Array.isArray(imgs) && imgs.length) return imgs[0];
  if (typeof p?.image === "string" && p.image) return p.image;
  if (typeof p?.thumbnail === "string" && p.thumbnail) return p.thumbnail;
  return "";
}

const emptyForm = {
  title: "",
  sku: "",
  price: "",
  active: true,
  category: "",
  images: [""], // URL list
  specs: [{ key: "", value: "" }], // dynamic
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // product object

  const [form, setForm] = useState(emptyForm);

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const [pr, cr] = await Promise.all([
        http.get("/api/products"),
        http.get("/api/categories"),
      ]);

      const products = pr.data?.items || pr.data?.products || pr.data || [];
      const categories = cr.data?.items || cr.data?.categories || cr.data || [];

      setItems(Array.isArray(products) ? products : []);
      setCats(Array.isArray(categories) ? categories : []);
    } catch (e) {
      setErr("Nuk u morën produktet/kategoritë.");
      setItems([]);
      setCats([]);
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
    return (items || []).filter((p) => {
      const t = `${p?.title || ""} ${p?.name || ""} ${
        p?.sku || ""
      }`.toLowerCase();
      const catName =
        typeof p?.category === "object"
          ? `${p?.category?.name || ""} ${
              p?.category?.slug || ""
            }`.toLowerCase()
          : "";
      return t.includes(s) || catName.includes(s);
    });
  }, [items, q]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p) {
    setEditing(p);

    // normalize category id
    const catId =
      typeof p?.category === "object" ? p?.category?._id : p?.category || "";

    const imgs = Array.isArray(p?.images) && p.images.length ? p.images : [""];
    const specs =
      Array.isArray(p?.specs) && p.specs.length
        ? p.specs
        : [{ key: "", value: "" }];

    setForm({
      title: p?.title || p?.name || "",
      sku: p?.sku || "",
      price: p?.price ?? "",
      active: typeof p?.active === "boolean" ? p.active : true,
      category: catId || "",
      images: imgs,
      specs: specs,
    });

    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  function setField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  // images helpers
  function addImageRow() {
    setForm((p) => ({ ...p, images: [...(p.images || []), ""] }));
  }
  function removeImageRow(i) {
    setForm((p) => {
      const next = (p.images || []).filter((_, idx) => idx !== i);
      return { ...p, images: next.length ? next : [""] };
    });
  }
  function changeImage(i, val) {
    setForm((p) => ({
      ...p,
      images: (p.images || []).map((x, idx) => (idx === i ? val : x)),
    }));
  }

  // specs helpers
  function addSpec() {
    setForm((p) => ({
      ...p,
      specs: [...(p.specs || []), { key: "", value: "" }],
    }));
  }
  function removeSpec(i) {
    setForm((p) => {
      const next = (p.specs || []).filter((_, idx) => idx !== i);
      return { ...p, specs: next.length ? next : [{ key: "", value: "" }] };
    });
  }
  function changeSpec(i, field, val) {
    setForm((p) => ({
      ...p,
      specs: (p.specs || []).map((s, idx) =>
        idx === i ? { ...s, [field]: val } : s
      ),
    }));
  }

  async function save() {
    const title = form.title.trim();
    const price = Number(form.price);

    if (!title) return alert("Shkruaj titullin.");
    if (!Number.isFinite(price) || price < 0)
      return alert("Çmimi nuk është i saktë.");

    // clean images (only non-empty)
    const images = (form.images || []).map((x) => x.trim()).filter(Boolean);

    // clean specs (only complete rows)
    const specs = (form.specs || [])
      .map((s) => ({
        key: (s.key || "").trim(),
        value: (s.value || "").trim(),
      }))
      .filter((s) => s.key && s.value);

    const payload = {
      title,
      sku: (form.sku || "").trim(),
      price,
      active: !!form.active,
      category: form.category || null,
      images,
      specs,
    };

    setSaving(true);
    try {
      if (editing?._id) {
        await http.put(`/api/products/${editing._id}`, payload);
      } else {
        await http.post("/api/products", payload);
      }
      setOpen(false);
      await loadAll();
    } catch (e) {
      alert("Gabim gjatë ruajtjes.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(p) {
    const ok = confirm(`Ta fshij produktin "${p?.title || p?.name}"?`);
    if (!ok) return;

    try {
      await http.delete(`/api/products/${p._id}`);
      await loadAll();
    } catch {
      alert("Nuk u fshi produkti.");
    }
  }

  return (
    <div className="ap">
      <div className="ap-top">
        <div>
          <div className="ap-pill">Paneli i administrimit</div>
          <h1>Produkte</h1>
          <p>Krijo / ndrysho / fshi produkte. Kategori lidhet me dropdown.</p>
        </div>

        <div className="ap-actions">
          <button className="ap-btn" onClick={loadAll} type="button">
            <FiRefreshCcw /> Rifresko
          </button>

          <button
            className="ap-btn ap-btn-primary"
            onClick={openCreate}
            type="button"
          >
            <FiPlus /> Shto produkt
          </button>
        </div>
      </div>

      <div className="ap-toolbar">
        <div className="ap-search">
          <FiSearch />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Kërko (titull / SKU / kategori)..."
          />
        </div>

        <div className="ap-count">
          {filtered.length} rezultat{filtered.length === 1 ? "" : "e"}
        </div>
      </div>

      {loading ? (
        <div className="ap-empty">
          <div className="ap-spin" />
          <div className="ap-empty-title">Duke ngarkuar...</div>
        </div>
      ) : err ? (
        <div className="ap-empty">
          <div className="ap-empty-title">{err}</div>
          <button className="ap-btn" onClick={loadAll} type="button">
            <FiRefreshCcw /> Provo prap
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-empty-title">S’ka produkte.</div>
          <div className="ap-empty-sub">
            Shto produktin e parë nga butoni sipër.
          </div>
        </div>
      ) : (
        <div className="ap-grid">
          {filtered.map((p) => {
            const img = pickImage(p);
            const title = p?.title || p?.name || "Produkt";

            return (
              <div className="ap-card" key={p._id}>
                <div className="ap-media">
                  {img ? (
                    <img src={img} alt={title} />
                  ) : (
                    <div className="ap-noimg">
                      <FiImage />
                      <span>Pa foto</span>
                    </div>
                  )}
                  <div className="ap-badges">
                    <span
                      className={p?.active ? "ap-tag ap-on" : "ap-tag ap-off"}
                    >
                      {p?.active ? "Aktiv" : "Jo aktiv"}
                    </span>
                  </div>
                </div>

                <div className="ap-body">
                  <div className="ap-title" title={title}>
                    {title}
                  </div>

                  <div className="ap-meta">
                    <div className="ap-price">{money(p?.price)}</div>
                    {p?.sku ? <div className="ap-sku">SKU: {p.sku}</div> : null}
                  </div>

                  <div className="ap-cat">
                    Kategori:{" "}
                    <b>
                      {typeof p?.category === "object"
                        ? p?.category?.name || "—"
                        : "—"}
                    </b>
                  </div>

                  <div className="ap-row">
                    <button
                      className="ap-btn"
                      onClick={() => openEdit(p)}
                      type="button"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="ap-btn ap-danger"
                      onClick={() => removeItem(p)}
                      type="button"
                    >
                      <FiTrash2 /> Fshi
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {open ? (
        <div
          className="ap-modal-backdrop"
          onMouseDown={closeModal}
          role="presentation"
        >
          <div className="ap-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ap-modal-head">
              <div>
                <div className="ap-modal-title">
                  {editing ? "Ndrysho produkt" : "Shto produkt"}
                </div>
                <div className="ap-modal-sub">
                  Fotot me URL + opsione dinamike (specs).
                </div>
              </div>

              <button
                className="ap-icon-btn"
                onClick={closeModal}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className="ap-form">
              <div className="ap-col">
                <label className="ap-label">Titulli</label>
                <input
                  className="ap-input"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="p.sh. Laptop Dell"
                />
              </div>

              <div className="ap-2col">
                <div className="ap-col">
                  <label className="ap-label">SKU</label>
                  <input
                    className="ap-input"
                    value={form.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                    placeholder="p.sh. DL-123"
                  />
                </div>

                <div className="ap-col">
                  <label className="ap-label">Çmimi (€)</label>
                  <input
                    className="ap-input"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    placeholder="p.sh. 199"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="ap-2col">
                <div className="ap-col">
                  <label className="ap-label">Kategori</label>
                  <select
                    className="ap-input"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">— Pa kategori —</option>
                    {cats.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ap-col ap-check">
                  <label className="ap-label">Aktiv</label>
                  <label className="ap-switch">
                    <input
                      type="checkbox"
                      checked={!!form.active}
                      onChange={(e) => setField("active", e.target.checked)}
                    />
                    <span />
                    <b>{form.active ? "Po" : "Jo"}</b>
                  </label>
                </div>
              </div>

              {/* IMAGES */}
              <div className="ap-block">
                <div className="ap-block-head">
                  <div>
                    <div className="ap-block-title">Fotot (URL)</div>
                    <div className="ap-block-sub">
                      Mund të shtosh sa të duash (URL).
                    </div>
                  </div>
                  <button
                    className="ap-btn"
                    onClick={addImageRow}
                    type="button"
                  >
                    <FiPlus /> Shto foto
                  </button>
                </div>

                <div className="ap-list">
                  {(form.images || []).map((url, i) => (
                    <div className="ap-line" key={i}>
                      <input
                        className="ap-input"
                        value={url}
                        onChange={(e) => changeImage(i, e.target.value)}
                        placeholder="https://..."
                      />
                      <button
                        className="ap-icon-btn ap-icon-danger"
                        onClick={() => removeImageRow(i)}
                        type="button"
                        title="Fshi"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECS */}
              <div className="ap-block">
                <div className="ap-block-head">
                  <div>
                    <div className="ap-block-title">
                      Opsione / të dhëna (Specs)
                    </div>
                    <div className="ap-block-sub">
                      p.sh. RAM=16GB, Ngjyra=E zezë, Material=Pambuk
                    </div>
                  </div>
                  <button className="ap-btn" onClick={addSpec} type="button">
                    <FiPlus /> Shto fushë
                  </button>
                </div>

                <div className="ap-spec-grid">
                  {(form.specs || []).map((s, i) => (
                    <div className="ap-spec" key={i}>
                      <input
                        className="ap-input"
                        value={s.key}
                        onChange={(e) => changeSpec(i, "key", e.target.value)}
                        placeholder="Emri (p.sh. RAM)"
                      />
                      <input
                        className="ap-input"
                        value={s.value}
                        onChange={(e) => changeSpec(i, "value", e.target.value)}
                        placeholder="Vlera (p.sh. 16GB)"
                      />
                      <button
                        className="ap-icon-btn ap-icon-danger"
                        onClick={() => removeSpec(i)}
                        type="button"
                        title="Fshi"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="ap-hint">
                  Shënim: rreshtat bosh nuk ruhen (ruhen vetëm ata që kanë key +
                  value).
                </div>
              </div>
            </div>

            <div className="ap-modal-foot">
              <button
                className="ap-btn"
                onClick={closeModal}
                type="button"
                disabled={saving}
              >
                Anulo
              </button>

              <button
                className="ap-btn ap-btn-primary"
                onClick={save}
                type="button"
                disabled={saving}
              >
                {saving ? "Duke ruajtur..." : "Ruaj"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
