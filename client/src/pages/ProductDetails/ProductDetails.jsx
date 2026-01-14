import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";
import { useFavorites } from "../../context/favoritesContext.jsx";
import {
  FiChevronLeft,
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiTag,
  FiStar,
  FiHeart,
} from "react-icons/fi";
import "./productDetails.css";

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

function getCategoryKey(p) {
  const c = p?.category;
  if (!c) return "";
  if (typeof c === "string") return c;
  if (typeof c === "object") return c._id || c.id || c.slug || "";
  return "";
}

function getCategoryLabel(p) {
  const c = p?.category;
  if (!c) return (p?.categoryName || "").trim();
  if (typeof c === "string") return (p?.categoryName || c).trim();
  if (typeof c === "object") return (c.name || c.slug || "").trim();
  return "";
}

export default function ProductDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const { isFav, toggleFav } = useFavorites();

  const addToCart =
    cart?.addToCart ||
    cart?.add ||
    ((p) => console.warn("Missing addToCart in cartContext", p));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null);
  const [all, setAll] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        let p = null;

        // 1) provo endpoint-in direkt
        try {
          const res1 = await http.get(`/api/products/${id}`);
          p = res1.data?.item || res1.data?.product || res1.data || null;
        } catch {
          p = null;
        }

        // 2) gjithmonë merr listën për related / fallback
        const res2 = await http.get("/api/products");
        const list = res2.data?.items || res2.data?.products || res2.data || [];
        const arr = Array.isArray(list) ? list : [];

        if (!p) {
          p = arr.find((x) => String(x?._id) === String(id)) || null;
        }

        if (!alive) return;
        setAll(arr);
        setProduct(p);
        setActiveImg(0);
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u mor produkti.");
        setProduct(null);
        setAll([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const images = useMemo(() => pickImages(product), [product]);

  const related = useMemo(() => {
    const catKey = getCategoryKey(product);
    const base = all.filter((p) => String(p?._id) !== String(id));
    let rel = catKey ? base.filter((p) => getCategoryKey(p) === catKey) : [];
    if (rel.length < 4) rel = [...rel, ...base].slice(0, 4);
    return rel.slice(0, 4);
  }, [all, product, id]);

  function dec() {
    setQty((x) => Math.max(1, x - 1));
  }
  function inc() {
    setQty((x) => Math.min(99, x + 1));
  }

  function addNow() {
    if (!product) return;
    try {
      addToCart(product, qty);
    } catch {
      for (let i = 0; i < qty; i++) addToCart(product);
    }
  }

  function buyNow() {
    addNow();
    nav("/checkout");
  }

  if (loading) {
    return (
      <main className="pd">
        <div className="pd-inner">
          <div className="pd-skel">
            <div className="pd-skel-left" />
            <div className="pd-skel-right">
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (err || !product) {
    return (
      <main className="pd">
        <div className="pd-inner">
          <div className="pd-empty">
            <div className="pd-empty-title">S’u gjet produkti</div>
            <div className="pd-empty-sub">{err || "Ky produkt nuk ekziston."}</div>
            <Link to="/products" className="pd-btn">
              <FiChevronLeft /> Kthehu te produktet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const title = getTitle(product);
  const price = getPrice(product);
  const catLabel = getCategoryLabel(product);
  const desc = product?.description || product?.desc || "";
  const fav = isFav(product);

  return (
    <main className="pd">
      <div className="pd-inner">
        <div className="pd-top">
          <button className="pd-back" onClick={() => nav(-1)} type="button">
            <FiChevronLeft /> Kthehu
          </button>
          <Link className="pd-toProducts" to="/products">
            Shiko të gjitha
          </Link>
        </div>

        <div className="pd-grid">
          {/* LEFT: gallery */}
          <div className="pd-left">
            <div className="pd-main">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={title} />
              ) : (
                <div className="pd-noimg">
                  <FiShoppingBag />
                  <span>Pa foto</span>
                </div>
              )}

              {catLabel ? (
                <span className="pd-badge">
                  <FiTag /> {catLabel}
                </span>
              ) : null}
            </div>

            {images.length > 1 ? (
              <div className="pd-thumbs">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    className={`pd-thumb ${i === activeImg ? "active" : ""}`}
                    onClick={() => setActiveImg(i)}
                    type="button"
                  >
                    <img src={src} alt={`${title} ${i + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* RIGHT */}
          <div className="pd-right">
            <h1 className="pd-title">{title}</h1>

            <div className="pd-sub" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="pd-price">{money(price)}</div>
              {product?.sku ? <div className="pd-sku">SKU: {product.sku}</div> : null}

              {/* ✅ Favourite */}
              <button
                type="button"
                onClick={() => toggleFav(product)}
                title="Favourite"
                style={{
                  marginLeft: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                <FiHeart style={{ color: fav ? "#e11d48" : "#111827" }} />
                {fav ? "Në favourite" : "Favourite"}
              </button>
            </div>

            <div className="pd-mini">
              <span className="pd-miniItem">
                <FiStar /> Cilësi
              </span>
              <span className="pd-miniItem">
                <FiShoppingBag /> Cash on Delivery
              </span>
            </div>

            {desc ? <p className="pd-desc">{desc}</p> : null}

            <div className="pd-qty">
              <div className="pd-qtyLabel">Sasia</div>
              <div className="pd-qtyCtl">
                <button className="pd-qtyBtn" onClick={dec} type="button">
                  <FiMinus />
                </button>
                <input
                  className="pd-qtyInput"
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Math.min(99, Number(e.target.value || 1) || 1)))
                  }
                />
                <button className="pd-qtyBtn" onClick={inc} type="button">
                  <FiPlus />
                </button>
              </div>
            </div>

            <div className="pd-actions">
              <button className="pd-btn pd-btnDark" onClick={addNow} type="button">
                <FiShoppingBag /> Shto në shportë
              </button>
              <button className="pd-btn" onClick={buyNow} type="button">
                Bli tani
              </button>
            </div>

            <div className="pd-note">
              Pagesa: Cash on Delivery • Dorëzim në adresë • Gjurmo porosinë me kod + telefon.
            </div>
          </div>
        </div>

        {/* RELATED */}
        <section className="pd-rel">
          <div className="pd-relHead">
            <h2>Related products</h2>
            <Link to="/products" className="pd-relLink">
              Shiko të gjitha
            </Link>
          </div>

          <div className="pd-relGrid">
            {related.map((p) => {
              const imgs = pickImages(p);
              const img = imgs[0] || "";
              const t = getTitle(p);
              const pr = getPrice(p);

              return (
                <div className="pd-card" key={p._id}>
                  <Link className="pd-cardImg" to={`/products/${p._id}`}>
                    {img ? (
                      <img src={img} alt={t} />
                    ) : (
                      <div className="pd-cardNo">
                        <FiShoppingBag />
                        <span>Pa foto</span>
                      </div>
                    )}
                  </Link>

                  <div className="pd-cardBody">
                    <div className="pd-cardTitle" title={t}>
                      {t}
                    </div>
                    <div className="pd-cardRow">
                      <span className="pd-cardPrice">{money(pr)}</span>
                      <button
                        className="pd-cardBtn"
                        type="button"
                        onClick={() => {
                          try {
                            addToCart(p, 1);
                          } catch {
                            addToCart(p);
                          }
                        }}
                      >
                        <FiShoppingBag /> Shto
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
