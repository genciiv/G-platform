import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiCheck,
  FiTruck,
  FiEdit,
  FiShoppingBag,
} from "react-icons/fi";
import { http, getErrMsg } from "../../lib/api.js";
import { useCart } from "../../context/cartContext.jsx";
import "./checkout.css";

function money(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function pickTitle(it) {
  return (
    it?.title ||
    it?.name ||
    it?.product?.title ||
    it?.product?.name ||
    "Produkt"
  );
}

function pickId(it) {
  return it?.productId || it?._id || it?.product?._id || it?.id;
}

function pickPrice(it) {
  const p = it?.price ?? it?.product?.price ?? 0;
  return Number(p || 0);
}

function pickQty(it) {
  return Number(it?.qty || it?.quantity || 1);
}

export default function Checkout() {
  const nav = useNavigate();
  const cart = useCart();

  const cartItems = cart?.items || cart?.cartItems || cart?.cart || [];
  const clearCart = cart?.clearCart || cart?.clear || (() => {});
  const updateQty = cart?.updateQty || cart?.setQty || cart?.changeQty;
  const removeFromCart = cart?.removeFromCart || cart?.removeItem;

  const [step, setStep] = useState(1); // 1 shipping, 2 review, 3 placing
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
  });

  const totals = useMemo(() => {
    const sub = (cartItems || []).reduce(
      (s, it) => s + pickPrice(it) * pickQty(it),
      0
    );
    return { sub, total: sub };
  }, [cartItems]);

  function next() {
    setErr("");
    if (step === 1) {
      if (!form.customerName.trim()) return setErr("Shkruaj emrin.");
      if (!form.phone.trim()) return setErr("Shkruaj telefonin.");
      if (!form.address.trim()) return setErr("Shkruaj adresën.");
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setErr("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function placeOrder() {
    setErr("");
    setBusy(true);
    try {
      const items = (cartItems || [])
        .map((it) => ({
          productId: pickId(it),
          qty: pickQty(it),
        }))
        .filter((x) => x.productId && x.qty > 0);

      const payload = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: (form.note || "").trim(),
        items,
      };

      const res = await http.post("/api/orders", payload);
      const doc = res.data?.item || res.data?.order || res.data;
      const code = doc?.orderCode;

      try {
        clearCart();
      } catch {}

      // shko te sukses (nëse ke faqe OrderSuccess)
      if (code) nav(`/order-success?code=${encodeURIComponent(code)}`);
      else nav(`/order-success`);
    } catch (e) {
      setErr(getErrMsg(e, "Porosia dështoi."));
    } finally {
      setBusy(false);
    }
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="co-page">
        <div className="co-wrap">
          <div className="co-empty">
            <div className="t">Shporta është bosh.</div>
            <div className="s">Shto produkte dhe pastaj bëj checkout.</div>
            <Link className="btn btn-primary" to="/products">
              <FiShoppingBag /> Shko te Produktet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="co-page">
      <div className="co-wrap">
        <div className="co-top">
          <Link className="btn btn-ghost" to="/cart">
            <FiChevronLeft /> Shporta
          </Link>
          <div>
            <h1>Checkout</h1>
            <p>Plotëso të dhënat dhe konfirmo porosinë.</p>
          </div>
        </div>

        <div className="co-stepper">
          <div className={`st ${step >= 1 ? "on" : ""}`}>
            <div className="dot">{step > 1 ? <FiCheck /> : 1}</div>
            <div className="lbl">Të dhënat</div>
          </div>
          <div className="line" />
          <div className={`st ${step >= 2 ? "on" : ""}`}>
            <div className="dot">{step > 2 ? <FiCheck /> : 2}</div>
            <div className="lbl">Review</div>
          </div>
          <div className="line" />
          <div className={`st ${step >= 3 ? "on" : ""}`}>
            <div className="dot">{3}</div>
            <div className="lbl">Konfirmo</div>
          </div>
        </div>

        <div className="co-grid">
          {/* LEFT */}
          <section className="co-left">
            {step === 1 ? (
              <div className="box">
                <div className="box-h">
                  <div className="box-t">Adresa & kontakti</div>
                  <div className="box-s">Këto do përdoren për dorëzim.</div>
                </div>

                <div className="form">
                  <div className="field">
                    <label>Emri</label>
                    <input
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customerName: e.target.value }))
                      }
                      placeholder="p.sh. Genci"
                    />
                  </div>

                  <div className="field">
                    <label>Telefoni</label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="p.sh. 069xxxxxxx"
                      inputMode="tel"
                    />
                  </div>

                  <div className="field">
                    <label>Adresa</label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, address: e.target.value }))
                      }
                      placeholder="Qyteti, rruga, nr…"
                    />
                  </div>

                  <div className="field">
                    <label>Shënim (opsionale)</label>
                    <textarea
                      value={form.note}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, note: e.target.value }))
                      }
                      placeholder="p.sh. ora e dorëzimit…"
                    />
                  </div>

                  {err ? <div className="err">{err}</div> : null}

                  <div className="actions">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={next}
                    >
                      Vazhdo <FiTruck />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="box">
                <div className="box-h row">
                  <div>
                    <div className="box-t">Review</div>
                    <div className="box-s">
                      Kontrollo shportën dhe të dhënat.
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    <FiEdit /> Ndrysho
                  </button>
                </div>

                <div className="review">
                  <div className="rline">
                    <div className="rk">Emri</div>
                    <div className="rv">{form.customerName}</div>
                  </div>
                  <div className="rline">
                    <div className="rk">Telefon</div>
                    <div className="rv">{form.phone}</div>
                  </div>
                  <div className="rline">
                    <div className="rk">Adresë</div>
                    <div className="rv">{form.address}</div>
                  </div>
                  {form.note ? (
                    <div className="rline">
                      <div className="rk">Shënim</div>
                      <div className="rv">{form.note}</div>
                    </div>
                  ) : null}
                </div>

                {err ? <div className="err">{err}</div> : null}

                <div className="actions two">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={back}
                  >
                    <FiChevronLeft /> Kthehu
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={next}
                  >
                    Konfirmo
                  </button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="box">
                <div className="box-h">
                  <div className="box-t">Konfirmo porosinë</div>
                  <div className="box-s">Kliko “Dërgo porosinë”.</div>
                </div>

                {err ? <div className="err">{err}</div> : null}

                <div className="actions two">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={back}
                    disabled={busy}
                  >
                    <FiChevronLeft /> Kthehu
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={placeOrder}
                    disabled={busy}
                  >
                    {busy ? "Duke dërguar…" : "Dërgo porosinë"}
                  </button>
                </div>

                <div className="note">
                  * Pagesa: Cash on Delivery. Do marrësh kodin për gjurmim.
                </div>
              </div>
            ) : null}
          </section>

          {/* RIGHT (SUMMARY) */}
          <aside className="co-right">
            <div className="sum">
              <div className="sum-h">
                <div className="sum-t">Përmbledhje</div>
                <div className="sum-s">{cartItems.length} produkte</div>
              </div>

              <div className="sum-items">
                {cartItems.map((it) => {
                  const id = pickId(it);
                  const title = pickTitle(it);
                  const qty = pickQty(it);
                  const price = pickPrice(it);

                  return (
                    <div className="si" key={String(id)}>
                      <div className="si-l">
                        <div className="si-t" title={title}>
                          {title}
                        </div>
                        <div className="si-sub">Qty: {qty}</div>
                      </div>
                      <div className="si-r">{money(price * qty)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="sum-tot">
                <div className="tl">
                  <div>Subtotal</div>
                  <div className="big">Total</div>
                </div>
                <div className="tr">
                  <div>{money(totals.sub)}</div>
                  <div className="big">{money(totals.total)}</div>
                </div>
              </div>

              <div className="sum-actions">
                <Link className="btn btn-ghost" to="/cart">
                  Ndrysho shportën
                </Link>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Review
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
