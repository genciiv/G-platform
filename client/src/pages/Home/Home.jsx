import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiShield,
  FiRefreshCcw,
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

export default function Home() {
  const nav = useNavigate();
  const { addToCart } = useCart();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadHome() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/home");
        if (!alive) return;
        setSections(res.data?.sections || []);
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u morën seksionet e home.");
        setSections([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadHome();
    return () => (alive = false);
  }, []);

  function onOpenProduct(p) {
    nav(`/products/${p._id}`);
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

          {/* HERO CARD */}
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

      {/* ✅ HOME SECTIONS (kategoritë) */}
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
              <div className="empty-title">
                S’ka kategori të vendosura për Home.
              </div>
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

                  return (
                    <div className="p-card" key={p._id}>
                      <button
                        className="p-media"
                        onClick={() => onOpenProduct(p)}
                        type="button"
                        aria-label="Hap produktin"
                      >
                        {img ? (
                          <img src={img} alt={title} />
                        ) : (
                          <div className="p-placeholder">
                            <FiShoppingBag />
                            <span>Pa foto</span>
                          </div>
                        )}

                        <span className="p-badge">
                          <FiHeart /> {sec.category?.name || "Produkt"}
                        </span>
                      </button>

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
                <div className="empty-title">
                  S’ka produkte në këtë kategori.
                </div>
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

      {/* FEATURES */}
      <section className="section">
        <div className="section-head">
          <h2>Pse G-App?</h2>
          <p>Dizajn i pastër, porosi të menaxhuara, dhe gjurmim i thjeshtë.</p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="card-ico">
              <FiShield />
            </div>
            <h3>Siguri</h3>
            <p>
              Sesion i sigurt, kontroll i aksesit për user dhe admin, dhe pagesë
              në dorëzim.
            </p>
          </div>

          <div className="card">
            <div className="card-ico">
              <FiRefreshCcw />
            </div>
            <h3>Rifreskim i shpejtë</h3>
            <p>Produktet, shporta, porositë dhe statuset rifreskohen lehtë.</p>
          </div>

          <div className="card">
            <div className="card-ico">
              <FiTruck />
            </div>
            <h3>Gjurmim porosie</h3>
            <p>Klienti gjurmon me kod + telefon. Admini menaxhon statuset.</p>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="section alt">
        <div className="section-head">
          <h2>Shkurt & saktë</h2>
          <p>Zgjidh ku do të shkosh tani.</p>
        </div>

        <div className="grid-4">
          <Link to="/products" className="qcard">
            <div className="qicon">
              <FiShoppingBag />
            </div>
            <div className="qtext">
              <div className="qtitle">Produkte</div>
              <div className="qdesc">Shiko listën & detajet.</div>
            </div>
            <FiChevronRight className="qchev" />
          </Link>

          <Link to="/cart" className="qcard">
            <div className="qicon">
              <FiShoppingBag />
            </div>
            <div className="qtext">
              <div className="qtitle">Shporta</div>
              <div className="qdesc">Kontrollo produktet.</div>
            </div>
            <FiChevronRight className="qchev" />
          </Link>

          <Link to="/track" className="qcard">
            <div className="qicon">
              <FiTruck />
            </div>
            <div className="qtext">
              <div className="qtitle">Gjurmim</div>
              <div className="qdesc">Kodi + telefoni.</div>
            </div>
            <FiChevronRight className="qchev" />
          </Link>

          <Link to="/auth" className="qcard">
            <div className="qicon">
              <FiPhoneCall />
            </div>
            <div className="qtext">
              <div className="qtitle">Hyr / Regjistrohu</div>
              <div className="qdesc">User ose Admin.</div>
            </div>
            <FiChevronRight className="qchev" />
          </Link>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust">
        <div className="trust-inner">
          <div className="trust-item">
            <FiMapPin />
            <div>
              <div className="trust-title">Dorëzim në adresë</div>
              <div className="trust-sub">Shkruaj adresën te checkout.</div>
            </div>
          </div>

          <div className="trust-item">
            <FiCreditCard />
            <div>
              <div className="trust-title">Cash on Delivery</div>
              <div className="trust-sub">Paguaj kur të vijë porosia.</div>
            </div>
          </div>

          <div className="trust-item">
            <FiShield />
            <div>
              <div className="trust-title">Status i qartë</div>
              <div className="trust-sub">Pending / Shipped / Delivered.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="f-left">
            <div className="f-brand">G-App</div>
            <div className="f-sub">
              Dyqan modern me porosi dhe gjurmim të thjeshtë.
            </div>
          </div>

          <div className="f-links">
            <Link to="/products">Produkte</Link>
            <Link to="/track">Gjurmim</Link>
            <Link to="/cart">Shporta</Link>
            <Link to="/auth">Hyr / Regjistrohu</Link>
          </div>
        </div>

        <div className="f-bottom">
          © {new Date().getFullYear()} G-App • All rights reserved
        </div>
      </footer>
    </main>
  );
}
