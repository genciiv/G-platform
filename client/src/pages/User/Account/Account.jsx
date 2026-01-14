import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMapPin, FiHeart, FiPackage, FiSave } from "react-icons/fi";
import { http } from "../../../lib/api.js";
import { useFavorites } from "../../../context/favoritesContext.jsx";
import "./account.css";

const emptyAddr = () => ({
  _id: undefined,
  label: "Shtëpi",
  fullName: "",
  phone: "",
  country: "Albania",
  city: "",
  zip: "",
  street: "",
  building: "",
  floor: "",
  notes: "",
  isDefault: false,
});

export default function Account() {
  const { favs, toggleFav } = useFavorites();

  const [tab, setTab] = useState("profile"); // profile | addresses | orders | favs

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthday: "",
    gender: "",
    company: "",
    vatNumber: "",
    avatar: "",
    prefs: { language: "sq", newsletter: false, orderUpdates: true },
  });

  const [addresses, setAddresses] = useState([emptyAddr()]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");
      try {
        const res = await http.get("/api/user/me");
        const u = res.data?.user;
        if (!alive) return;

        setUser(u);
        setForm({
          name: u?.name || "",
          phone: u?.phone || "",
          birthday: u?.birthday || "",
          gender: u?.gender || "",
          company: u?.company || "",
          vatNumber: u?.vatNumber || "",
          avatar: u?.avatar || "",
          prefs: {
            language: u?.prefs?.language || "sq",
            newsletter: !!u?.prefs?.newsletter,
            orderUpdates: u?.prefs?.orderUpdates !== false,
          },
        });

        const addr =
          Array.isArray(u?.addresses) && u.addresses.length
            ? u.addresses
            : [emptyAddr()];
        setAddresses(addr);

        // orders
        try {
          const r2 = await http.get("/api/orders/my"); // nëse e ke
          const list = r2.data?.items || r2.data?.orders || r2.data || [];
          setOrders(Array.isArray(list) ? list : []);
        } catch {
          setOrders([]);
        }
      } catch (e) {
        if (!alive) return;
        setErr("Nuk u mor profili.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => (alive = false);
  }, []);

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function saveProfile() {
    setSaving(true);
    setErr("");
    try {
      const res = await http.put("/api/user/me", form);
      const u = res.data?.user;
      setUser(u);
    } catch (e) {
      setErr(e?.response?.data?.message || "Nuk u ruajt profili.");
    } finally {
      setSaving(false);
    }
  }

  function setAddr(i, key, val) {
    setAddresses((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: val };
      return copy;
    });
  }

  function setDefaultAddr(i) {
    setAddresses((prev) =>
      prev.map((a, idx) => ({ ...a, isDefault: idx === i }))
    );
  }

  function addAddress() {
    setAddresses((p) => [...p, emptyAddr()]);
  }

  function removeAddress(i) {
    setAddresses((prev) => {
      const copy = prev.filter((_, idx) => idx !== i);
      if (!copy.length) return [emptyAddr()];
      // siguro default
      if (!copy.some((x) => x.isDefault)) copy[0].isDefault = true;
      return copy;
    });
  }

  async function saveAddresses() {
    setSaving(true);
    setErr("");
    try {
      const res = await http.put("/api/user/me/addresses", { addresses });
      const u = res.data?.user;
      setUser(u);
      setAddresses(u?.addresses?.length ? u.addresses : [emptyAddr()]);
    } catch (e) {
      setErr(e?.response?.data?.message || "Nuk u ruajtën adresat.");
    } finally {
      setSaving(false);
    }
  }

  const favCount = favs?.length || 0;
  const orderCount = orders?.length || 0;

  if (loading) {
    return (
      <main className="acc">
        <div className="acc-wrap">
          <div className="acc-card">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="acc">
      <div className="acc-wrap">
        <div className="acc-top">
          <div className="acc-title">
            <div className="acc-avatar">
              {form.avatar ? (
                <img src={form.avatar} alt="avatar" />
              ) : (
                <FiUser />
              )}
            </div>
            <div>
              <h1>{user?.name || "Account"}</h1>
              <div className="acc-sub">{user?.email}</div>
            </div>
          </div>

          <div className="acc-metrics">
            <div className="acc-pill">
              <FiPackage /> {orderCount} Porosi
            </div>
            <div className="acc-pill">
              <FiHeart /> {favCount} Favourite
            </div>
          </div>
        </div>

        {err ? <div className="acc-error">{err}</div> : null}

        <div className="acc-grid">
          <aside className="acc-side">
            <button
              className={tab === "profile" ? "acc-tab active" : "acc-tab"}
              onClick={() => setTab("profile")}
            >
              <FiUser /> Profili
            </button>
            <button
              className={tab === "addresses" ? "acc-tab active" : "acc-tab"}
              onClick={() => setTab("addresses")}
            >
              <FiMapPin /> Adresat
            </button>
            <button
              className={tab === "orders" ? "acc-tab active" : "acc-tab"}
              onClick={() => setTab("orders")}
            >
              <FiPackage /> Porositë
            </button>
            <button
              className={tab === "favs" ? "acc-tab active" : "acc-tab"}
              onClick={() => setTab("favs")}
            >
              <FiHeart /> Favourite
            </button>

            <div className="acc-help">
              <Link to="/track">Gjurmim porosie</Link>
              <Link to="/products">Shiko produkte</Link>
            </div>
          </aside>

          <section className="acc-card">
            {tab === "profile" ? (
              <>
                <h2>Profili</h2>

                <div className="acc-form">
                  <div className="acc-row">
                    <label>Emri</label>
                    <input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                  </div>

                  <div className="acc-row">
                    <label>Telefon</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+355..."
                    />
                  </div>

                  <div className="acc-2col">
                    <div className="acc-row">
                      <label>Datëlindja</label>
                      <input
                        type="date"
                        value={form.birthday}
                        onChange={(e) => setField("birthday", e.target.value)}
                      />
                    </div>
                    <div className="acc-row">
                      <label>Gjinia</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setField("gender", e.target.value)}
                      >
                        <option value="">—</option>
                        <option value="m">Mashkull</option>
                        <option value="f">Femër</option>
                        <option value="o">Tjetër</option>
                      </select>
                    </div>
                  </div>

                  <div className="acc-2col">
                    <div className="acc-row">
                      <label>Kompania</label>
                      <input
                        value={form.company}
                        onChange={(e) => setField("company", e.target.value)}
                      />
                    </div>
                    <div className="acc-row">
                      <label>VAT/NIPT</label>
                      <input
                        value={form.vatNumber}
                        onChange={(e) => setField("vatNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="acc-row">
                    <label>Avatar URL</label>
                    <input
                      value={form.avatar}
                      onChange={(e) => setField("avatar", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <h3>Preferenca</h3>
                  <div className="acc-2col">
                    <div className="acc-row">
                      <label>Gjuha</label>
                      <select
                        value={form.prefs.language}
                        onChange={(e) =>
                          setField("prefs", {
                            ...form.prefs,
                            language: e.target.value,
                          })
                        }
                      >
                        <option value="sq">Shqip</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="acc-row acc-checks">
                      <label className="acc-check">
                        <input
                          type="checkbox"
                          checked={form.prefs.newsletter}
                          onChange={(e) =>
                            setField("prefs", {
                              ...form.prefs,
                              newsletter: e.target.checked,
                            })
                          }
                        />
                        Newsletter
                      </label>
                      <label className="acc-check">
                        <input
                          type="checkbox"
                          checked={form.prefs.orderUpdates}
                          onChange={(e) =>
                            setField("prefs", {
                              ...form.prefs,
                              orderUpdates: e.target.checked,
                            })
                          }
                        />
                        Njoftime porosish
                      </label>
                    </div>
                  </div>

                  <button
                    className="acc-save"
                    onClick={saveProfile}
                    disabled={saving}
                  >
                    <FiSave /> {saving ? "Duke ruajtur..." : "Ruaj profilin"}
                  </button>
                </div>
              </>
            ) : null}

            {tab === "addresses" ? (
              <>
                <h2>Adresat</h2>
                <p className="acc-muted">
                  Ruaj disa adresa dhe zgjidh default për checkout.
                </p>

                <div className="acc-addrList">
                  {addresses.map((a, i) => (
                    <div className="acc-addr" key={a._id || i}>
                      <div className="acc-addrTop">
                        <strong>{a.label || "Adresë"}</strong>
                        <div className="acc-addrBtns">
                          <button
                            type="button"
                            className={a.isDefault ? "pill active" : "pill"}
                            onClick={() => setDefaultAddr(i)}
                          >
                            Default
                          </button>
                          <button
                            type="button"
                            className="pill danger"
                            onClick={() => removeAddress(i)}
                          >
                            Fshi
                          </button>
                        </div>
                      </div>

                      <div className="acc-2col">
                        <div className="acc-row">
                          <label>Label</label>
                          <input
                            value={a.label}
                            onChange={(e) =>
                              setAddr(i, "label", e.target.value)
                            }
                          />
                        </div>
                        <div className="acc-row">
                          <label>Emër / Mbiemër</label>
                          <input
                            value={a.fullName}
                            onChange={(e) =>
                              setAddr(i, "fullName", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="acc-2col">
                        <div className="acc-row">
                          <label>Telefon</label>
                          <input
                            value={a.phone}
                            onChange={(e) =>
                              setAddr(i, "phone", e.target.value)
                            }
                          />
                        </div>
                        <div className="acc-row">
                          <label>Qyteti</label>
                          <input
                            value={a.city}
                            onChange={(e) => setAddr(i, "city", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="acc-row">
                        <label>Rruga</label>
                        <input
                          value={a.street}
                          onChange={(e) => setAddr(i, "street", e.target.value)}
                        />
                      </div>

                      <div className="acc-2col">
                        <div className="acc-row">
                          <label>Pallati / Nr.</label>
                          <input
                            value={a.building}
                            onChange={(e) =>
                              setAddr(i, "building", e.target.value)
                            }
                          />
                        </div>
                        <div className="acc-row">
                          <label>Kati</label>
                          <input
                            value={a.floor}
                            onChange={(e) =>
                              setAddr(i, "floor", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="acc-2col">
                        <div className="acc-row">
                          <label>ZIP</label>
                          <input
                            value={a.zip}
                            onChange={(e) => setAddr(i, "zip", e.target.value)}
                          />
                        </div>
                        <div className="acc-row">
                          <label>Shteti</label>
                          <input
                            value={a.country}
                            onChange={(e) =>
                              setAddr(i, "country", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="acc-row">
                        <label>Shënime</label>
                        <input
                          value={a.notes}
                          onChange={(e) => setAddr(i, "notes", e.target.value)}
                          placeholder="p.sh. afër..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="acc-addrActions">
                  <button className="btn" type="button" onClick={addAddress}>
                    + Shto adresë
                  </button>
                  <button
                    className="acc-save"
                    onClick={saveAddresses}
                    disabled={saving}
                  >
                    <FiSave /> {saving ? "Duke ruajtur..." : "Ruaj adresat"}
                  </button>
                </div>
              </>
            ) : null}

            {tab === "orders" ? (
              <>
                <h2>Porositë</h2>
                {!orders.length ? (
                  <div className="acc-empty">Nuk ke porosi ende.</div>
                ) : (
                  <div className="acc-orders">
                    {orders.map((o) => (
                      <Link
                        key={o._id}
                        to={`/account/orders/${o._id}`}
                        className="acc-order"
                      >
                        <div>
                          <div className="acc-orderTop">
                            <strong>
                              #{String(o._id).slice(-6).toUpperCase()}
                            </strong>
                            <span className="st">{o.status || "pending"}</span>
                          </div>
                          <div className="acc-muted">
                            {o.createdAt
                              ? new Date(o.createdAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="acc-orderSum">
                          {Number(o.total || 0).toFixed(2)} €
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : null}

            {tab === "favs" ? (
              <>
                <h2>Favourite</h2>
                {!favs?.length ? (
                  <div className="acc-empty">Nuk ke favourite ende.</div>
                ) : (
                  <div className="acc-favs">
                    {favs.map((p) => (
                      <div className="acc-fav" key={p._id || p.id}>
                        <div className="acc-favImg">
                          {p.image ? (
                            <img src={p.image} alt={p.title} />
                          ) : (
                            <FiHeart />
                          )}
                        </div>
                        <div className="acc-favBody">
                          <div className="acc-favTitle">{p.title}</div>
                          <div className="acc-muted">
                            {Number(p.price || 0).toFixed(2)} €
                          </div>
                        </div>
                        <button
                          className="pill danger"
                          onClick={() => toggleFav(p)}
                          type="button"
                        >
                          Hiq
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
