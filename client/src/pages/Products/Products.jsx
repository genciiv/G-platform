import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiShoppingBag,
  FiHeart,
  FiSliders,
} from "react-icons/fi";
import { http } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";
import "./products.css";

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

/** Trajton “aktiv”-in në disa variante që të mos mbetesh 0 rezultate pa arsye */
function isActiveProduct(p) {
  // nëse ka boolean:
  if (typeof p?.isActive === "boolean") return p.isActive;
  if (typeof p?.active === "boolean") return p.active;

  // nëse ka status:
  const s = String(p?.status || p?.state || "").toLowerCase();
  if (!s) return true; // nëse s’ka status, supozo “aktiv”
  if (["inactive", "disabled", "draft", "archived"].some((k) => s.includes(k)))
    return false;
  if (["active", "aktiv", "enabled", "published"].some((k) => s.includes(k)))
    return true;

  // fallback
  return true;
}

function getCategoryName(p) {
  // mund të jetë p.category si string, ose {name}, ose categoryId
  if (typeof p?.category === "string") return p.category;
  if (p?.category?.name) return p.category.name;
  if (p?.categoryName) return p.categoryName;
  return "";
}

export default function Products() {
  const nav = useNavigate();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [products, setProducts] = useState([]);

  // UI states
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new"); // new | price_asc | price_desc | title
  const [filtersOpen, setFiltersOpen] = useState(true); // desktop left open

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/products");

        // prano shumë forma
        const data = res?.data;
        const list =
          data?.items ||
          data?.products ||
          data?.data?.items ||
          data?.data?.products ||
          data?.data ||
          data ||
          [];

        if (!alive) return;

        const arr = Array.isArray(list) ? list : [];
        setProducts(arr);
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u morën produktet. Kontrollo serverin /api/products.");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Map();
    for (const p of products) {
      const name = getCategoryName(p);
      if (name) set.set(name, name);
    }
    return ["all", ...Array.from(set.keys())];
  }, [products]);

  const priceRange = useMemo(() => {
    const prices = (products || [])
      .map((p) => Number(p?.price ?? p?.salePrice ?? 0))
      .filter((n) => Number.isFinite(n));
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;
    return { min, max };
  }, [products]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const minN =
      minPrice === "" ? null : Number(String(minPrice).replace(",", "."));
    const maxN =
      maxPrice === "" ? null : Number(String(maxPrice).replace(",", "."));

    let out = (products || []).slice();

    if (onlyActive) out = out.filter(isActiveProduct);

    if (category !== "all") {
      out = out.filter((p) => (getCategoryName(p) || "") === category);
    }

    if (qq) {
      out = out.filter((p) => {
        const title = String(p?.title || p?.name || "").toLowerCase();
        const sku = String(p?.sku || "").toLowerCase();
        const cat = String(getCategoryName(p) || "").toLowerCase();
        return (
          title.includes(qq) ||
          sku.includes(qq) ||
          cat.includes(qq) ||
          String(p?._id || "").toLowerCase().includes(qq)
        );
      });
    }

    if (minN !== null && Number.isFinite(minN)) {
      out = out.filter((p) => {
        const price = Number(p?.price ?? p?.salePrice ?? 0);
        return price >= minN;
      });
    }

    if (maxN !== null && Number.isFinite(maxN)) {
      out = out.filter((p) => {
        const price = Number(p?.price ?? p?.salePrice ?? 0);
        return price <= maxN;
      });
    }

    // sort
    if (sort === "price_asc") {
      out.sort(
        (a, b) =>
          Number(a?.price ?? a?.salePrice ?? 0) -
          Number(b?.price ?? b?.salePrice ?? 0)
      );
    } else if (sort === "price_desc") {
      out.sort(
        (a, b) =>
          Number(b?.price ?? b?.salePrice ?? 0) -
          Number(a?.price ?? a?.salePrice ?? 0)
      );
    } else if (sort === "title") {
      out.sort((a, b) =>
        String(a?.title || a?.name || "").localeCompare(
          String(b?.title || b?.name || "")
        )
      );
    } else {
      // new: nëse ke createdAt, përndryshe lëre siç vjen
      out.sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      });
    }

    return out;
  }, [products, q, onlyActive, category, minPrice, maxPrice, sort]);

  function clearFilters() {
    setQ("");
    setOnlyActive(true);
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("new");
  }

  function onOpen(p) {
    nav(`/products/${p._id}`);
  }

  function onAdd(p) {
    try {
      addToCart(p, 1);
    } catch {
      addToCart(p);
    }
  }

  const totalText = loading ? "—" : `${filtered.length}`;

  return (
    <main className="products-page">
      {/* TOP BAR */}
      <section className="p-top">
        <div className="p-top-inner">
          <div className="p-title">
            <h1>Produkte</h1>
            <p>
              Kërko, filtro dhe shto shpejt në shportë.{" "}
              <b>{totalText}</b> rezultate.
            </p>
          </div>

          <div className="p-actions">
            <button
              className="chip"
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <FiFilter />
              Filtra
              <FiChevronDown
                className={filtersOpen ? "rot" : ""}
                style={{ marginLeft: 2 }}
              />
            </button>

            <label className="select">
              <span>Rendit:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="new">Më të rejat</option>
                <option value="price_asc">Çmimi: më i ulët</option>
                <option value="price_desc">Çmimi: më i lartë</option>
                <option value="title">Titulli (A–Z)</option>
              </select>
            </label>

            <Link to="/cart" className="btn btn-primary">
              <FiShoppingBag /> Shko te shporta
            </Link>
          </div>
        </div>

        {/* SEARCH */}
        <div className="p-search-row">
          <div className="p-search">
            <FiSearch />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko (titull / SKU / kategori)..."
            />
            {q ? (
              <button
                className="icon-btn"
                type="button"
                onClick={() => setQ("")}
                aria-label="Pastro kërkimin"
              >
                <FiX />
              </button>
            ) : null}
          </div>

          <div className="p-right-mini">
            {category !== "all" ? (
              <span className="mini-pill">
                <FiSliders /> {category}
              </span>
            ) : null}
            {(q || category !== "all" || minPrice || maxPrice || !onlyActive) ? (
              <button className="mini-link" type="button" onClick={clearFilters}>
                Pastro filtrat
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="p-body">
        {/* FILTERS SIDEBAR */}
        {filtersOpen ? (
          <aside className="filters">
            <div className="filters-head">
              <div className="filters-title">Filtrat</div>
              <button className="mini-link" type="button" onClick={clearFilters}>
                <FiX /> Pastro
              </button>
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              <span>Vetëm aktiv</span>
            </label>

            <div className="f-block">
              <div className="f-label">Kategori</div>
              <select
                className="f-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">Të gjitha</option>
                {categories
                  .filter((c) => c !== "all")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <div className="f-block">
              <div className="f-label">Çmimi</div>
              <div className="price-row">
                <input
                  className="f-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder={`Min (${priceRange.min || 0})`}
                />
                <span className="dash">—</span>
                <input
                  className="f-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder={`Max (${priceRange.max || 0})`}
                />
              </div>

              <div className="hint">
                Sugjerim: {money(priceRange.min)} — {money(priceRange.max)}
              </div>

              <div className="f-actions">
                <button className="btn btn-ghost" type="button" onClick={clearFilters}>
                  Pastro
                </button>
                <button className="btn btn-primary" type="button">
                  Mbyll
                </button>
              </div>
            </div>
          </aside>
        ) : null}

        {/* LIST */}
        <div className="list">
          <div className="list-head">
            <div className="list-count">
              <b>{loading ? "—" : filtered.length}</b> rezultate
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <div className="spinner" />
              <div className="empty-title">Duke ngarkuar produktet…</div>
              <div className="empty-sub">Një moment.</div>
            </div>
          ) : err ? (
            <div className="empty">
              <div className="empty-title">{err}</div>
              <div className="empty-sub">
                Hap DevTools → Network dhe shiko a kthehet /api/products.
              </div>
              <button className="btn btn-ghost" type="button" onClick={() => window.location.reload()}>
                Rifresko
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-title">S’ka rezultate.</div>
              <div className="empty-sub">Provo ndrysho filtrat ose kërkimin.</div>
              <button className="btn btn-ghost" type="button" onClick={clearFilters}>
                Pastro filtrat
              </button>

              <div className="debug">
                <div className="debug-line">
                  <b>Debug:</b> total products = {products.length}
                </div>
                <div className="debug-line">
                  onlyActive = {String(onlyActive)}, category = {category || "all"}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p) => {
                const img = pickImage(p);
                const title = p?.title || p?.name || "Produkt";
                const price = p?.price ?? p?.salePrice ?? 0;
                const sku = p?.sku;

                return (
                  <div className="card" key={p._id}>
                    <button
                      className="media"
                      type="button"
                      onClick={() => onOpen(p)}
                      aria-label="Hap produktin"
                    >
                      {img ? (
                        <img src={img} alt={title} />
                      ) : (
                        <div className="placeholder">
                          <FiShoppingBag />
                          <span>Pa foto</span>
                        </div>
                      )}
                      <span className="badge">
                        <FiHeart /> Produkt
                      </span>
                    </button>

                    <div className="body">
                      <div className="title" title={title}>
                        {title}
                      </div>

                      <div className="meta">
                        <div className="price">{money(price)}</div>
                        {sku ? <div className="sku">SKU: {sku}</div> : <div className="sku"> </div>}
                      </div>

                      <div className="actions">
                        <button className="btn btn-primary btn-sm" type="button" onClick={() => onAdd(p)}>
                          <FiShoppingBag /> Shto
                        </button>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => onOpen(p)}>
                          Detaje
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
