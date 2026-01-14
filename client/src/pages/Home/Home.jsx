import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiShield,
  FiShoppingBag,
  FiSearch,
  FiMapPin,
  FiCreditCard,
  FiChevronRight,
  FiTag,
  FiPhoneCall,
  FiHeart,
} from "react-icons/fi";
import { http } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";
import { useFavorites } from "../../context/favoritesContext.jsx";
import "./home.css";

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

function normList(res) {
  return (
    res?.data?.items ||
    res?.data?.products ||
    res?.data?.categories ||
    res?.data ||
    []
  );
}

function getCategoryIdFromProduct(p) {
  const c = p?.category;
  if (!c) return "";
  if (typeof c === "string") return c;
  if (typeof c === "object") return c._id || c.id || "";
  return "";
}

export default function Home() {
  const nav = useNavigate();

  // ✅ cart
  const cart = useCart();
  const addToCart =
    cart?.addToCart ||
    cart?.add ||
    ((p) => console.warn("Missing addToCart in cartContext", p));

  // ✅ favorites
  const { isFav, toggleFav } = useFavorites();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function buildFallbackSections() {
      const [catsRes, prodRes] = await Promise.all([
        http.get("/api/categories"),
        http.get("/api/products"),
      ]);

      const cats = normList(catsRes);
      const products = normList(prodRes);

      const catArr = Array.isArray(cats) ? cats : [];
      const prodArr = Array.isArray(products) ? products : [];

      const homeCats = catArr.filter((c) => Boolean(c?.showOnHome));

      const byId = new Map();
      homeCats.forEach((c) => {
        const id = c?._id || c?.id;
        if (id) byId.set(String(id), c);
      });

      const grouped = new Map();
      prodArr.forEach((p) => {
        const cid = getCategoryIdFromProduct(p);
        if (!cid) return;
        if (!byId.has(String(cid))) return;
        if (!grouped.has(String(cid))) grouped.set(String(cid), []);
        grouped.get(String(cid)).push(p);
      });

      return homeCats.map((c) => {
        const id = String(c?._id || c?.id || "");
        return {
          category: { _id: c._id, name: c.name, slug: c.slug },
          items: (grouped.get(id) || []).slice(0, 8),
        };
      });
    }

    async function loadHome() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/home");
        if (!alive) return;
        const secs = res?.data?.sections || [];
        if (Array.isArray(secs) && secs.length) {
          setSections(secs);
          return;
        }
        const fallbackSecs = await buildFallbackSections();
        if (!alive) return;
        setSections(fallbackSecs);
        if (!fallbackSecs.length) {
          setErr("S’ka seksione. Aktivizo “Show on Home” te Admin → Kategori.");
        }
      } catch (e) {
        const status = e?.response?.status;
        try {
          if (status === 404 || status === 500 || status === 502 || status === 503) {
            const fallbackSecs = await buildFallbackSections();
            if (!alive) return;
            setSections(fallbackSecs);
            if (!fallbackSecs.length) {
              setErr("S’ka seksione. Aktivizo “Show on Home” te Admin → Kategori.");
            }
          } else {
            setErr("Nuk u morën seksionet e home.");
            setSections([]);
          }
        } catch {
          if (!alive) return;
          setErr("Nuk u morën seksionet (home/categories/products).");
          setSections([]);
        }
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadHome();
    return () => {
      alive = false;
    };
  }, []);

  function onOpenProduct(p) {
    const id = p?._id || p?.id;
    if (!id) return;
    nav(`/products/${id}`);
  }

  function onAdd(p) {
    try {
      addToCart(p, 1);
    } catch {
      addToCart(p);
    }
  }

  const hasSections = useMemo(
    () => Array.isArray(sections) && sections.length > 0,
    [sections]
  );

  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-pill">
              <FiTag />
              <span>Porosi të shpejta + Cash on Delivery</span>
            </div>

            <h1 className="hero-title">G-App Store</h1>
            <p className="hero-sub">
              Blej shpejt, thjesht, dhe me pagesë në dorëzim. Zgjidh produktin,
              bëj porosinë dhe gjurmo statusin kur të duash.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                <FiShoppingBag /> Shiko produktet <FiChevronRight />
              </Link>

              <Link to="/track" className="btn btn-ghost">
                <FiTruck /> Gjurmim porosie
              </Link>
            </div>

            <div className="hero-badges">
              <div className="badge-item">
                <FiTruck />
                <span>Dorëzim i shpejtë</span>
              </div>
              <div className="badge-item">
                <FiShield />
                <span>Porosi e sigurt</span>
              </div>
              <div className="badge-item">
                <FiCreditCard />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hc-top">
              <div className="hc-title">Si funksionon?</div>
              <div className="hc-muted">3 hapa të thjeshtë</div>
            </div>

            <ol className="hc-steps">
              <li>
                <div className="hc-step-icon">
                  <FiSearch />
                </div>
                <div>
                  <div className="hc-step-title">Gjej produktin</div>
                  <div className="hc-step-text">
                    Kërko ose shiko listën te “Produkte”.
                  </div>
                </div>
              </li>

              <li>
                <div className="hc-step-icon">
                  <FiShoppingBag />
                </div>
                <div>
                  <div className="hc-step-title">Shto në shportë</div>
                  <div className="hc-step-text">
                    Zgjidh sasinë dhe vazhdo te checkout.
                  </div>
                </div>
              </li>

              <li>
                <div className="hc-step-icon">
                  <FiTruck />
                </div>
                <div>
                  <div className="hc-step-title">Dërgo & gjurmo</div>
                  <div className="hc-step-text">
                    Merr kodin e porosisë dhe gjurmo statusin.
                  </div>
                </div>
              </li>
            </ol>

            <div className="hc-actions">
              <Link to="/products" className="btn btn-primary btn-full">
                <FiShoppingBag /> Fillo blerjen
              </Link>
              <Link to="/auth" className="btn btn-ghost btn-full">
                Hyr / Regjistrohu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEKSIONE */}
      <section className="section">
        <div className="section-head">
          <h2>Seksione</h2>
          <p>Këto shfaqen automatikisht nga kategoritë që ke “Show on Home”.</p>
        </div>

        <div className="clothes-wrap">
          {loading ? (
            <div className="empty">
              <div className="spinner" />
              <div className="empty-title">Duke ngarkuar home...</div>
              <div className="empty-sub">Një moment.</div>
            </div>
          ) : err ? (
            <div className="empty">
              <div className="empty-title">{err}</div>
              <div className="empty-sub">
                Provo rifresko faqen ose kontrollo serverin.
              </div>
              <Link to="/products" className="btn btn-ghost">
                Hap Produktet
              </Link>
            </div>
          ) : !hasSections ? (
            <div className="empty">
              <div className="empty-title">S’ka kategori për Home.</div>
              <div className="empty-sub">
                Te Admin → Kategori: aktivizo “Show on Home”.
              </div>
              <Link to="/admin/categories" className="btn btn-ghost">
                Shko te Admin Kategori
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {sections.map((sec) => (
        <section
          className="section"
          key={sec.category?._id || sec.category?.slug}
        >
          <div className="section-head section-head-row">
            <div>
              <h2>{sec.category?.name || "Kategori"}</h2>
              <p>Zgjedhje nga {sec.category?.name || "kategoria"}.</p>
            </div>

            <Link
              to={`/products?category=${encodeURIComponent(
                sec.category?.slug || ""
              )}`}
              className="mini-link"
            >
              Shiko të gjitha <FiChevronRight />
            </Link>
          </div>

          <div className="clothes-wrap">
            {Array.isArray(sec.items) && sec.items.length ? (
              <div className="clothes-grid">
                {sec.items.map((p) => {
                  const img = pickImage(p);
                  const title = p?.title || p?.name || "Produkt";
                  const price = p?.price ?? p?.salePrice ?? 0;
                  const fav = isFav(p);

                  return (
                    <div className="p-card" key={p._id || p.id}>
                      {/* ✅ MEDIA: DIV (jo button) */}
                      <div
                        className="p-media"
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenProduct(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onOpenProduct(p);
                        }}
                        aria-label="Hap produktin"
                        style={{ position: "relative" }}
                      >
                        {img ? (
                          <img src={img} alt={title} />
                        ) : (
                          <div className="p-placeholder">
                            <FiShoppingBag />
                            <span>Pa foto</span>
                          </div>
                        )}

                        {/* ✅ Zemra toggle (tani s’është brenda butoni) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFav(p);
                          }}
                          title="Favourite"
                          aria-label="Favourite"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: "1px solid rgba(0,0,0,0.08)",
                            background: "white",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <FiHeart style={{ color: fav ? "#e11d48" : "#111827" }} />
                        </button>

                        <span className="p-badge">
                          <FiTag /> {sec.category?.name || "Produkt"}
                        </span>
                      </div>

                      <div className="p-body">
                        <div className="p-title" title={title}>
                          {title}
                        </div>

                        <div className="p-meta">
                          <div className="p-price">{money(price)}</div>
                          {p?.sku ? (
                            <div className="p-sku">SKU: {p.sku}</div>
                          ) : null}
                        </div>

                        <div className="p-actions">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onAdd(p)}
                          >
                            <FiShoppingBag /> Shto
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => onOpenProduct(p)}
                          >
                            Detaje <FiChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty">
                <div className="empty-title">S’ka produkte në këtë kategori.</div>
                <div className="empty-sub">
                  Shto produkte në kategorinë “{sec.category?.name}”.
                </div>
                <Link to="/admin/products" className="btn btn-ghost">
                  Shko te Admin Produkte
                </Link>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
