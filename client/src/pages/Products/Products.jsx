import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiShoppingBag,
  FiChevronDown,
  FiTag,
} from "react-icons/fi";
import "./products.css";

function money(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function pickImages(p) {
  const imgs = p?.images || p?.imageUrls || p?.photos || [];
  if (Array.isArray(imgs) && imgs.length) return imgs.filter(Boolean);
  if (typeof p?.image === "string" && p.image) return [p.image];
  if (typeof p?.thumbnail === "string" && p.thumbnail) return [p.thumbnail];
  return [];
}

function getTitle(p) {
  return p?.title || p?.name || "Produkt";
}

function getPrice(p) {
  return Number(p?.salePrice ?? p?.price ?? 0);
}

function getCategory(p) {
  return (p?.category || p?.categoryName || "").trim();
}

export default function Products() {
  const nav = useNavigate();
  const cart = useCart();

  const addToCart =
    cart?.addToCart ||
    cart?.add ||
    ((p) => console.warn("Missing addToCart in cartContext", p));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  // filters
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("new"); // new | price_asc | price_desc | name_asc
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/products");
        const list = res.data?.items || res.data?.products || res.data || [];
        if (!alive) return;
        setItems(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u morën produktet.");
        setItems([]);
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
    const set = new Set();
    for (const p of items) {
      const c = getCategory(p);
      if (c) set.add(c);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const priceBounds = useMemo(() => {
    const prices = items.map(getPrice).filter((x) => Number.isFinite(x));
    if (!prices.length) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const min = minP === "" ? null : Number(minP);
    const max = maxP === "" ? null : Number(maxP);

    let list = [...items];

    if (onlyActive) {
      list = list.filter((p) => {
        const s = String(p?.status || p?.state || "").toLowerCase();
        // pranon "active", "aktiv", true, etj.
        if (p?.active === true) return true;
        if (s.includes("active") || s.includes("aktiv")) return true;
        return false;
      });
    }

    if (term) {
      list = list.filter((p) => {
        const blob = `${getTitle(p)} ${getCategory(p)} ${p?.sku || ""} ${
          p?.description || ""
        }`.toLowerCase();
        return blob.includes(term);
      });
    }

    if (category !== "all") {
      list = list.filter((p) => getCategory(p) === category);
    }

    if (Number.isFinite(min)) {
      list = list.filter((p) => getPrice(p) >= min);
    }
    if (Number.isFinite(max)) {
      list = list.filter((p) => getPrice(p) <= max);
    }

    // sort
    if (sort === "price_asc") {
      list.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sort === "price_desc") {
      list.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (sort === "name_asc") {
      list.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    } else {
      // "new": nëse ka createdAt përdore, përndryshe mbaje
      list.sort((a, b) => {
        const da = new Date(a?.createdAt || 0).getTime();
        const db = new Date(b?.createdAt || 0).getTime();
        return db - da;
      });
    }

    return list;
  }, [items, q, category, sort, minP, maxP, onlyActive]);

  function resetFilters() {
    setQ("");
    setCategory("all");
    setSort("new");
    setMinP("");
    setMaxP("");
    setOnlyActive(false);
  }

  function openDetails(p) {
    nav(`/products/${p._id}`);
  }

  function onAdd(p) {
    try {
      addToCart(p, 1);
    } catch {
      addToCart(p);
    }
  }

  return (
    <main className="products-page">
      <section className="p-hero">
        <div className="p-hero-inner">
          <div className="p-hero-left">
            <h1>Produkte</h1>
            <p>Gjej rrobat / produktet dhe shto shpejt në shportë.</p>
          </div>

          <div className="p-hero-right">
            <Link to="/cart" className="p-cart-link">
              <FiShoppingBag />
              Shporta
            </Link>
          </div>
        </div>
      </section>

      <section className="p-tools">
        <div className="p-tools-inner">
          <div className="p-search">
            <FiSearch className="p-search-ico" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko (titull / SKU / kategori)..."
              className="p-search-input"
            />
            {q ? (
              <button
                className="p-clear"
                onClick={() => setQ("")}
                type="button"
                aria-label="Pastro"
              >
                <FiX />
              </button>
            ) : null}
          </div>

          <div className="p-filters">
            <div className="p-select">
              <FiTag className="p-sel-ico" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Të gjitha kategoritë" : c}
                  </option>
                ))}
              </select>
              <FiChevronDown className="p-sel-arrow" />
            </div>

            <div className="p-select">
              <FiFilter className="p-sel-ico" />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="new">Më të rejat</option>
                <option value="price_asc">Çmimi ↑</option>
                <option value="price_desc">Çmimi ↓</option>
                <option value="name_asc">Emri A-Z</option>
              </select>
              <FiChevronDown className="p-sel-arrow" />
            </div>

            <div className="p-price">
              <input
                type="number"
                value={minP}
                onChange={(e) => setMinP(e.target.value)}
                placeholder={`Min (${priceBounds.min || 0})`}
              />
              <span className="p-dash">—</span>
              <input
                type="number"
                value={maxP}
                onChange={(e) => setMaxP(e.target.value)}
                placeholder={`Max (${priceBounds.max || 0})`}
              />
            </div>

            <label className="p-check">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(e) => setOnlyActive(e.target.checked)}
              />
              Vetëm aktivë
            </label>

            <button className="p-reset" onClick={resetFilters} type="button">
              Reset
            </button>
          </div>

          <div className="p-meta">
            {loading ? (
              <span>Duke ngarkuar...</span>
            ) : err ? (
              <span className="p-err">{err}</span>
            ) : (
              <span>
                {filtered.length} / {items.length} produkte
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="p-grid-wrap">
        <div className="p-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div className="p-skel" key={i}>
                <div className="p-skel-img" />
                <div className="p-skel-lines">
                  <div />
                  <div />
                </div>
              </div>
            ))
          ) : err ? (
            <div className="p-empty">
              <div className="p-empty-title">Gabim</div>
              <div className="p-empty-sub">{err}</div>
              <button
                className="p-btn"
                onClick={() => window.location.reload()}
              >
                Rifresko
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-empty">
              <div className="p-empty-title">S’ka rezultate</div>
              <div className="p-empty-sub">
                Provo të ndryshosh filtrat ose kërkimin.
              </div>
              <button className="p-btn" onClick={resetFilters}>
                Pastro filtrat
              </button>
            </div>
          ) : (
            filtered.map((p) => {
              const imgs = pickImages(p);
              const img = imgs[0] || "";
              const title = getTitle(p);
              const price = getPrice(p);
              const sku = p?.sku ? String(p.sku) : "";
              const cat = getCategory(p);

              return (
                <div className="p-card" key={p._id}>
                  <button
                    className="p-img"
                    type="button"
                    onClick={() => openDetails(p)}
                    aria-label="Hap produktin"
                  >
                    {img ? (
                      <img src={img} alt={title} />
                    ) : (
                      <div className="p-noimg">
                        <FiShoppingBag />
                        <span>Pa foto</span>
                      </div>
                    )}
                    {cat ? <span className="p-badge">{cat}</span> : null}
                  </button>

                  <div className="p-body">
                    <div className="p-title" title={title}>
                      {title}
                    </div>

                    <div className="p-row">
                      <div className="p-priceVal">{money(price)}</div>
                      {sku ? <div className="p-sku">SKU: {sku}</div> : null}
                    </div>

                    <div className="p-actions">
                      <button
                        className="p-btn p-btn-dark"
                        onClick={() => onAdd(p)}
                      >
                        <FiShoppingBag /> Shto
                      </button>
                      <button className="p-btn" onClick={() => openDetails(p)}>
                        Detaje
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
