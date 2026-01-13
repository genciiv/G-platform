import React, { useEffect, useMemo, useRef, useState } from "react";
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

function isClothing(p) {
  const t = `${p?.title || ""} ${p?.name || ""} ${p?.category || ""} ${p?.description || ""}`.toLowerCase();
  const keys = [
    "rrobe","rroba","bluze","t-shirt","tshirt","hoodie","xhup","xhakete","xhaketa",
    "pantallona","triko","pulover","kapele","këmish","kemish","fustan","jeans",
    "xhinse","sneakers","atlete","veshje","veshja","jack","jacket",
  ];
  return keys.some((k) => t.includes(k));
}

/** Scroll reveal pa libra */
function useRevealOnScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const els = Array.from(root.querySelectorAll("[data-reveal]"));
    if (!els.length) return;

    if (prefersReduced) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return ref;
}

export default function Home() {
  const nav = useNavigate();
  const { addToCart } = useCart();
  const wrapRef = useRevealOnScroll();

  const [loadingP, setLoadingP] = useState(true);
  const [products, setProducts] = useState([]);
  const [pErr, setPErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingP(true);
      setPErr("");
      try {
        const res = await http.get("/api/products");
        const list = res.data?.items || res.data?.products || res.data || [];
        if (!alive) return;
        setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!alive) return;
        setPErr("Nuk u morën produktet.");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoadingP(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const clothing = useMemo(() => {
    const only = (products || []).filter(isClothing);
    if (only.length >= 4) return only.slice(0, 8);
    return (products || []).slice(0, 8);
  }, [products]);

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

  return (
    <main className="home" ref={wrapRef}>
      {/* HERO */}
      <section className="hero" data-reveal>
        <div className="hero-inner">
          <div className="hero-left" data-reveal>
            <div className="hero-pill">
              <FiTag />
              <span>Porosi të shpejta · Cash on Delivery</span>
            </div>

            <h1 className="hero-title">
              G-App Store <span className="caret" aria-hidden="true" />
            </h1>

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

            <div className="hero-badges" data-reveal>
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
          <div className="hero-card" data-reveal>
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

      {/* ✅ RROBA SECTION */}
      <section className="section" data-reveal>
        <div className="section-head section-head-row">
          <div>
            <h2>Rroba</h2>
            <p>
              Zgjedhjet tona për veshje – shto shpejt në shportë ose shiko
              detajet.
            </p>
          </div>

          <Link to="/products" className="mini-link">
            Shiko të gjitha <FiChevronRight />
          </Link>
        </div>

        <div className="clothes-wrap">
          {loadingP ? (
            <div className="empty">
              <div className="spinner" />
              <div className="empty-title">Duke ngarkuar produktet...</div>
              <div className="empty-sub">Një moment.</div>
            </div>
          ) : pErr ? (
            <div className="empty">
              <div className="empty-title">{pErr}</div>
              <div className="empty-sub">
                Provo rifresko faqen ose shko te “Produkte”.
              </div>
              <Link to="/products" className="btn btn-ghost">
                Hap Produktet
              </Link>
            </div>
          ) : clothing.length === 0 ? (
            <div className="empty">
              <div className="empty-title">S’ka produkte për momentin.</div>
              <div className="empty-sub">
                Shto produkte nga Admin dhe do shfaqen këtu.
              </div>
              <Link to="/products" className="btn btn-ghost">
                Shiko Produktet
              </Link>
            </div>
          ) : (
            <div className="clothes-grid">
              {clothing.map((p) => {
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
                        <img src={img} alt={title} loading="lazy" />
                      ) : (
                        <div className="p-placeholder">
                          <FiShoppingBag />
                          <span>Pa foto</span>
                        </div>
                      )}
                      <span className="p-badge">
                        <FiHeart /> Rroba
                      </span>
                      <span className="p-shine" aria-hidden="true" />
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
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" data-reveal>
        <div className="section-head">
          <h2>Pse G-App?</h2>
          <p>
            Dizajn i pastër, porosi të menaxhuara, dhe gjurmim i thjeshtë për
            klientin.
          </p>
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
            <p>
              Produktet, shporta, porositë dhe statuset rifreskohen lehtë pa
              stres.
            </p>
          </div>

          <div className="card">
            <div className="card-ico">
              <FiTruck />
            </div>
            <h3>Gjurmim porosie</h3>
            <p>
              Klienti gjurmon me kod + telefon. Admini menaxhon statuset në
              panel.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="section alt" data-reveal>
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
      <section className="trust" data-reveal>
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
      <footer className="footer" data-reveal>
        <div className="footer-inner">
          <div className="f-left">
            <div className="f-brand">G-App</div>
            <div className="f-sub">Dyqan modern me porosi dhe gjurmim të thjeshtë.</div>
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
