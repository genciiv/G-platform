import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCcw,
  FiSearch,
  FiImage,
  FiTag,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { http } from "../../../lib/api.js"; // ✅ FIX: nga pages/Admin/Products -> pages/Admin -> pages -> src (3 nivele)
import "./adminProducts.css";

function money(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function getFirstImage(p) {
  const imgs = p?.images || p?.imageUrls || p?.photos || [];
  if (Array.isArray(imgs) && imgs.length) return imgs[0];
  if (typeof p?.image === "string" && p.image) return p.image;
  if (typeof p?.thumbnail === "string" && p.thumbnail) return p.thumbnail;
  return "";
}

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    sku: "",
    price: "",
    active: true,
    categoryId: "",
    imagesText: "", // URL list (1 per line or comma)
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const [pRes, cRes] = await Promise.all([
        http.get("/api/products"),
        http.get("/api/categories"),
      ]);

      const plist = pRes.data?.items || pRes.data?.products || pRes.data || [];
      const clist =
        cRes.data?.items || cRes.data?.categories || cRes.data || [];

      setProducts(Array.isArray(plist) ? plist : []);
      setCategories(Array.isArray(clist) ? clist : []);
    } catch (e) {
      setErr("S’u morën të dhënat. Kontrollo serverin / endpoint-et.");
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    return (products || [])
      .filter((p) => (onlyActive ? !!p?.active : true))
      .filter((p) => {
        if (!s) return true;
        const t = `${p?.title || ""} ${p?.name || ""} ${p?.sku || ""} ${
          p?.categoryName || ""
        }`.toLowerCase();
        return t.includes(s);
      });
  }, [products, q, onlyActive]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p) {
    setMode("edit");
    setEditingId(p?._id);
    const imgs = p?.images || p?.imageUrls || p?.photos || [];
    setForm({
      title: p?.title || p?.name || "",
      sku: p?.sku || "",
      price: p?.price ?? "",
      active: !!p?.active,
      categoryId: p?.categoryId || p?.category?._id || "",
      imagesText: Array.isArray(imgs) ? imgs.join("\n") : "",
      description: p?.description || "",
    });
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  function parseImages(text) {
    const raw = (text || "")
      .split(/\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean);
    // uniq
    return [...new Set(raw)];
  }

  async function onSave(e) {
    e.preventDefault();
    setErr("");

    const title = form.title.trim();
    const sku = form.sku.trim();
    const price = Number(form.price);

    if (!title) return setErr("Titulli është i detyrueshëm.");
    if (!sku) return setErr("SKU është i detyrueshëm.");
    if (!Number.isFinite(price) || price < 0)
      return setErr("Çmimi nuk është valid.");

    const payload = {
      title,
      sku,
      price,
      active: !!form.active,
      categoryId: form.categoryId || null,
      images: parseImages(form.imagesText),
      description: form.description || "",
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await http.post("/api/products", payload);
      } else {
        await http.put(`/api/products/${editingId}`, payload);
      }
      setOpen(false);
      await loadAll();
    } catch (e2) {
      setErr("Nuk u ruajt produkti. Kontrollo backend-in.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(p) {
    const ok = window.confirm(`Ta fshij produktin "${p?.title || p?.name}"?`);
    if (!ok) return;

    setErr("");
    try {
      await http.delete(`/api/products/${p._id}`);
      await loadAll();
    } catch {
      setErr("S’u fshi produkti. Kontrollo backend-in.");
    }
  }

  return (
    <div className="ap-wrap">
      <div className="ap-head">
        <div>
          <h1 className="ap-title">Produkte</h1>
          <p className="ap-sub">
            Krijo / ndrysho / fshi produkte. Kategoritë lidhen me dropdown.
          </p>
        </div>

        <div className="ap-actions">
          <button className="ap-btn ap-btnGhost" onClick={loadAll} type="button">
            <FiRefreshCcw /> Rifresko
          </button>
          <button className="ap-btn ap-btnPrimary" onClick={openCreate} type="button">
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

        <label className="ap-check">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          Vetëm aktiv
        </label>

        <div className="ap-count">
          {filtered.length} rezultat{filtered.length === 1 ? "" : "e"}
        </div>
      </div>

      {err ? (
        <div className="ap-alert ap-alertWarn">
          <FiAlertTriangle />
          <span>{err}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="ap-skeletonGrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="ap-skelCard" key={i}>
              <div className="ap-skelMedia" />
              <div className="ap-skelLine" />
              <div className="ap-skelLine short" />
              <div className="ap-skelRow">
                <div className="ap-skelPill" />
                <div className="ap-skelPill" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-emptyTitle">S’ka produkte për këto filtra.</div>
          <div className="ap-emptySub">
            Pastro kërkimin ose çaktivizo “Vetëm aktiv”.
          </div>
          <button className="ap-btn ap-btnGhost" onClick={() => setQ("")} type="button">
            Pastro kërkimin
          </button>
        </div>
      ) : (
        <div className="ap-grid">
          {filtered.map((p) => {
            const img = getFirstImage(p);
            const title = p?.title || p?.name || "Produkt";
            const price = p?.price ?? 0;

            const catName =
              p?.categoryName ||
              categories.find((c) => c._id === (p?.categoryId || p?.category?._id))
                ?.name ||
              "Pa kategori";

            return (
              <div className="ap-card" key={p._id}>
                <div className="ap-media">
                  {img ? (
                    <img src={img} alt={title} />
                  ) : (
                    <div className="ap-noImg">
                      <FiImage />
                      <span>Pa foto</span>
                    </div>
                  )}

                  <div className={`ap-status ${p?.active ? "ok" : "off"}`}>
                    {p?.active ? (
                      <>
                        <FiCheckCircle /> Aktiv
                      </>
                    ) : (
                      "Jo aktiv"
                    )}
                  </div>
                </div>

                <div className="ap-body">
                  <div className="ap-rowTop">
                    <div className="ap-name" title={title}>
                      {title}
                    </div>
                    <div className="ap-price">{money(price)}</div>
                  </div>

                  <div className="ap-meta">
                    <span className="ap-chip">
                      <FiTag />
                      {catName}
                    </span>
                    <span className="ap-sku">SKU: {p?.sku || "-"}</span>
                  </div>

                  <div className="ap-cta">
                    <button
                      className="ap-mini ap-miniEdit"
                      type="button"
                      onClick={() => openEdit(p)}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="ap-mini ap-miniDanger"
                      type="button"
                      onClick={() => onDelete(p)}
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
        <div className="ap-modalOverlay" onMouseDown={closeModal}>
          <div className="ap-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="ap-modalHead">
              <div>
                <div className="ap-modalTitle">
                  {mode === "create" ? "Shto produkt" : "Ndrysho produkt"}
                </div>
                <div className="ap-modalSub">Fusha me * janë të detyrueshme.</div>
              </div>

              <button className="ap-x" type="button" onClick={closeModal} aria-label="Mbyll">
                <FiX />
              </button>
            </div>

            <form className="ap-form" onSubmit={onSave}>
              <div className="ap-formGrid">
                <div className="ap-field">
                  <label>Titulli *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    placeholder="p.sh. Xhup dimri"
                  />
                </div>

                <div className="ap-field">
                  <label>SKU *</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                    placeholder="p.sh. WH-3"
                  />
                </div>

                <div className="ap-field">
                  <label>Çmimi (€) *</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    placeholder="p.sh. 20"
                    inputMode="decimal"
                  />
                </div>

                <div className="ap-field">
                  <label>Kategoria</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, categoryId: e.target.value }))
                    }
                  >
                    <option value="">Pa kategori</option>
                    {(categories || []).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ap-field ap-fieldWide">
                  <label>Foto (URL) – 1 për rresht ose me presje</label>
                  <textarea
                    value={form.imagesText}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, imagesText: e.target.value }))
                    }
                    placeholder={"https://...\nhttps://..."}
                    rows={4}
                  />
                </div>

                <div className="ap-field ap-fieldWide">
                  <label>Përshkrimi</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, description: e.target.value }))
                    }
                    placeholder="Përshkrim i shkurtër..."
                    rows={3}
                  />
                </div>

                <label className="ap-toggle">
                  <input
                    type="checkbox"
                    checked={!!form.active}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, active: e.target.checked }))
                    }
                  />
                  Aktiv
                </label>
              </div>

              <div className="ap-formActions">
                <button
                  type="button"
                  className="ap-btn ap-btnGhost"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Anulo
                </button>
                <button className="ap-btn ap-btnPrimary" type="submit" disabled={saving}>
                  {saving ? "Duke ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>

            {err ? (
              <div className="ap-alert ap-alertWarn" style={{ marginTop: 10 }}>
                <FiAlertTriangle />
                <span>{err}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
