import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiChevronDown,
  FiShoppingBag,
  FiHeart,
  FiArrowUpRight,
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

function getTitle(p) {
  return p?.title || p?.name || "Produkt";
}

function getPrice(p) {
  const v = p?.salePrice ?? p?.price ?? 0;
  return Number(v || 0);
}

function getSku(p) {
  return p?.sku || p?.SKU || "";
}

function getCategory(p) {
  return (p?.category || p?.type || p?.tag || "").toString().trim();
}

function isActive(p) {
  // prano disa variante: status "Aktiv", active true, isActive true
  if (typeof p?.active === "boolean") return p.active;
  if (typeof p?.isActive === "boolean") return p.isActive;
  const s = (p?.status || "").toString().toLowerCase();
  if (!s) return true; // nëse s’ka status, e konsiderojmë aktiv
  return s.includes("aktiv") || s.includes("active");
}

const SORTS = [
  { key: "newest", label: "Më të rejat" },
  { key: "price_asc", label: "Çmimi: Ulët → Lartë" },
  { key: "price_desc", label: "Çmimi: Lartë → Ulët" },
  { key: "title_asc", label: "Emri: A → Z" },
];

export default function Products() {
  const nav = useNavigate();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [products, setProducts] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [onlyActive, setOnlyActive] = useState(true);
  const [cat, setCat] = useState("all");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/products");
        const list = res.data?.items || res.data?.products || res.data || [];
        if (!alive) return;
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u morën produktet. Provo rifresko.");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => (alive = false);
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => {
      const c = getCategory(p);
      if (c) map.set(c.toLowerCase(), c);
    });
    const list = Array.from(map.values()).sort((a, b) =>
      a.localeCompare(b, "sq-AL")
    );
    return ["all", ...list];
  }, [products]);

  const priceStats = useMemo(() => {
    const nums = (products || []).map(getPrice).filter((n) => Number.isFinite(n));
    if (!nums.length) return { min: 0, max: 0 };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }, [products]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const min = minP === "" ? null : Number(minP);
    const max = maxP === "" ? null : Number(maxP);

    let list = (products || []).slice();

    if (onlyActive) list = list.filter(isActive);

    if (cat !== "all") {
      const c = cat.toLowerCase();
      list = list.filter((p) => getCategory(p).toLowerCase() === c);
    }

    if (qq) {
      list = list.filter((p) => {
        const t = `${getTitle(p)} ${getCategory(p)} ${getSku(p)} ${p?.description || ""}`.toLowerCase();
        return t.includes(qq);
      });
    }

    if (min !== null && Number.isFinite(min)) {
      list = list.filter((p) => getPrice(p) >= min);
    }

    if (max !== null && Number.isFinite(max)) {
      list = list.filter((p) => getPrice(p) <= max);
    }

    // sort
    if (sort === "price_asc") list.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "price_desc") list.sort((a, b) => getPrice(b) - getPrice(a));
    if (sort === "title_asc") list.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    if (sort === "newest") {
      // nëse ka createdAt, përdore; përndryshe ruaj rendin siç vjen
      list.sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      });
    }

    return list;
  }, [products, q, onlyActive, cat, minP, maxP, sort]);

  function clearFilters() {
    setQ("");
    setSort("newest");
    setOnlyActive(true);
    setCat("all");
    setMinP("");
    setMaxP("");
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

  const hasFilters =
    q.trim() ||
    sort !== "newest" ||
    !onlyActive ||
    cat !== "all" ||
    minP !== "" ||
    maxP !== "";

  return (
    <main className="shop">
      <section className="shop-top">
        <div className="shop-head">
          <div>
            <h1>Produkte</h1>
            <p>
              Kërko, filtro dhe shto shpejt në shportë. {products?.length || 0} produkte.
            </p>
          </div>

          <div className="shop-actions">
            <button
              className="btn btn-ghost shop-filter-btn"
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <FiFilter /> Filtra
            </button>

            <div className="sort">
              <div className="sort-label">Rendit:</div>
              <div className="sort-select">
                <FiChevronDown className="sort-ico" />
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="shop-bar">
          <div className="search">
            <FiSearch />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko (titull / SKU / kategori)…"
              aria-label="Kërko produkte"
            />
            {q.trim() ? (
              <button className="icon-btn" type="button" onClick={() => setQ("")} aria-label="Pastro kërkimin">
                <FiX />
              </button>
            ) : null}
          </div>

          {hasFilters ? (
            <button className="btn btn-ghost" type="button" onClick={clearFilters}>
              <FiX /> Pastro filtrat
            </button>
          ) : (
            <Link to="/cart" className="btn btn-primary">
              <FiShoppingBag /> Shko te shporta <FiArrowUpRight />
            </Link>
          )}
        </div>
      </section>

      <section className="shop-body">
        {/* LEFT FILTERS (desktop) */}
        <aside className="filters">
          <div className="filters-card">
            <div className="filters-title">Filtrat</div>

            <label className="f-row">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              <span>Vetëm aktiv</span>
            </label>

            <div className="f-block">
              <div className="f-label">Kategori</div>
              <select value={cat} onChange={(e) => setCat(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Të gjitha" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="f-block">
              <div className="f-label">Çmimi</div>
              <div className="price-row">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={`Min (${priceStats.min || 0})`}
                  value={minP}
                  onChange={(e) => setMinP(e.target.value)}
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={`Max (${priceStats.max || 0})`}
                  value={maxP}
                  onChange={(e) => setMaxP(e.target.value)}
                />
              </div>
              <div className="f-hint">
                Sugjerim: {money(priceStats.min)} — {money(priceStats.max)}
              </div>
            </div>

            <button className="btn btn-ghost" type="button" onClick={clearFilters}>
              <FiX /> Pastro
            </button>
          </div>
        </aside>

        {/* GRID */}
        <div className="grid-wrap">
          <div className="grid-top">
            <div className="grid-count">
              {loading ? "Duke ngarkuar…" : `${filtered.length} rezultate`}
            </div>
          </div>

          {loading ? (
            <div className="pgrid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="skeleton" key={i}>
                  <div className="sk-media" />
                  <div className="sk-body">
                    <div className="sk-line w80" />
                    <div className="sk-line w55" />
                    <div className="sk-row">
                      <div className="sk-pill w35" />
                      <div className="sk-pill w28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : err ? (
            <div className="empty">
              <div className="empty-title">{err}</div>
              <div className="empty-sub">Provo rifresko faqen.</div>
              <button className="btn btn-primary" type="button" onClick={() => window.location.reload()}>
                Rifresko
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-title">Nuk u gjet asnjë produkt.</div>
              <div className="empty-sub">
                Provo ndrysho filtrat ose fjalën e kërkimit.
              </div>
              <button className="btn btn-ghost" type="button" onClick={clearFilters}>
                Pastro filtrat
              </button>
            </div>
          ) : (
            <div className="pgrid">
              {filtered.map((p) => {
                const img = pickImage(p);
                const title = getTitle(p);
                const price = getPrice(p);
                const sku = getSku(p);
                const category = getCategory(p);

                return (
                  <div className="pcard" key={p._id}>
                    <button className="pmedia" type="button" onClick={() => onOpen(p)} aria-label="Hap produktin">
                      {img ? <img src={img} alt={title} loading="lazy" /> : <div className="pnoimg"><FiShoppingBag /> Pa foto</div>}
                      <span className="pbadge"><FiHeart /> {category || "Produkt"}</span>
                      <span className="pshine" aria-hidden="true" />
                    </button>

                    <div className="pbody">
                      <div className="ptitle" title={title}>{title}</div>

                      <div className="pmeta">
                        <div className="pprice">{money(price)}</div>
                        {sku ? <div className="psku">SKU: {sku}</div> : <div className="psku muted">—</div>}
                      </div>

                      <div className="pactions">
                        <button className="btn btn-primary btn-sm" type="button" onClick={() => onAdd(p)}>
                          <FiShoppingBag /> Shto
                        </button>
                        <button className="btn btn-ghost btn-sm" type="button" onClick={() => onOpen(p)}>
                          Detaje <FiArrowUpRight />
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

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen ? (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Filtra">
          <div className="drawer-backdrop" onClick={() => setMobileFiltersOpen(false)} />
          <div className="drawer-panel">
            <div className="drawer-head">
              <div className="drawer-title">Filtra</div>
              <button className="icon-btn" type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Mbyll">
                <FiX />
              </button>
            </div>

            <div className="drawer-body">
              <label className="f-row">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                />
                <span>Vetëm aktiv</span>
              </label>

              <div className="f-block">
                <div className="f-label">Kategori</div>
                <select value={cat} onChange={(e) => setCat(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "Të gjitha" : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="f-block">
                <div className="f-label">Çmimi</div>
                <div className="price-row">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={`Min (${priceStats.min || 0})`}
                    value={minP}
                    onChange={(e) => setMinP(e.target.value)}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={`Max (${priceStats.max || 0})`}
                    value={maxP}
                    onChange={(e) => setMaxP(e.target.value)}
                  />
                </div>
                <div className="f-hint">
                  Sugjerim: {money(priceStats.min)} — {money(priceStats.max)}
                </div>
              </div>
            </div>

            <div className="drawer-foot">
              <button className="btn btn-ghost" type="button" onClick={clearFilters}>
                <FiX /> Pastro
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setMobileFiltersOpen(false)}>
                Apliko
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
