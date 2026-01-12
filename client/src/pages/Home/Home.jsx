import React from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fi";
import "./home.css";

export default function Home() {
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

      {/* FEATURES */}
      <section className="section">
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
              Sesion i sigurt, kontroll i aksesit për user dhe admin, dhe
              pagesë në dorëzim.
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
