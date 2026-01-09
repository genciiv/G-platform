// client/src/pages/admin/Inventory/AdminInventory.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./adminInventory.css";
import { http, getErrMsg } from "../../../lib/api.js";

export default function AdminInventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [warehouseId, setWarehouseId] = useState("");
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // move form
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function bootstrap() {
    setErr("");
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([
        http.get("/api/warehouses"),
        http.get("/api/products"),
      ]);

      const wItems = wRes.data?.items || [];
      const pItems = pRes.data?.items || [];

      setWarehouses(Array.isArray(wItems) ? wItems : []);
      setProducts(
        Array.isArray(pItems)
          ? pItems.filter((x) => (x.active ?? true) === true)
          : []
      );

      const first = wItems?.[0]?._id || "";
      setWarehouseId(first);
    } catch (e) {
      setErr(getErrMsg(e, "Bootstrap failed"));
    } finally {
      setLoading(false);
    }
  }

  async function loadStockAndMoves(whId) {
    if (!whId) {
      setStock([]);
      setMovements([]);
      return;
    }
    setErr("");
    try {
      const [sRes, mRes] = await Promise.all([
        http.get(`/api/inventory/stock?warehouseId=${encodeURIComponent(whId)}`),
        http.get(
          `/api/inventory/movements?warehouseId=${encodeURIComponent(whId)}`
        ),
      ]);

      setStock(Array.isArray(sRes.data?.items) ? sRes.data.items : []);
      setMovements(Array.isArray(mRes.data?.items) ? mRes.data.items : []);
    } catch (e) {
      setErr(getErrMsg(e, "S’u arrit të merren të dhënat e inventarit"));
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    loadStockAndMoves(warehouseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  const whLabel = useMemo(() => {
    const w = warehouses.find((x) => x._id === warehouseId);
    return w ? `${w.name}${w.code ? ` (${w.code})` : ""}` : "-";
  }, [warehouses, warehouseId]);

  const stockTotalQty = useMemo(() => {
    return stock.reduce((s, x) => s + Number(x.qty ?? x.quantity ?? 0), 0);
  }, [stock]);

  async function submitMove(e) {
    e.preventDefault();
    setErr("");

    if (!warehouseId) return setErr("Zgjidh magazinën.");
    if (!productId) return setErr("Zgjidh produktin.");
    if (!qty || Number(qty) <= 0) return setErr("Sasia duhet > 0.");

    setBusy(true);
    try {
      // ✅ KRYESORE: serveri pret "quantity"
      await http.post("/api/inventory/move", {
        warehouseId,
        productId,
        type,
        quantity: Number(qty),
        reason,
        note,
      });

      setQty(1);
      setReason("");
      setNote("");

      await loadStockAndMoves(warehouseId);
    } catch (e2) {
      setErr(getErrMsg(e2, "Nuk u bë lëvizja e stokut"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ai-wrap">
      <div className="ai-head">
        <div>
          <h2>Inventar (IN / OUT)</h2>
          <p>Menaxho stokun për çdo magazinë.</p>
        </div>

        <div className="ai-topControls">
          <label className="ai-label">
            Magazina
            <select
              className="ai-select"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- zgjidh --</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                  {w.code ? ` (${w.code})` : ""}
                </option>
              ))}
            </select>
          </label>

          <button
            className="ai-btn"
            onClick={() => loadStockAndMoves(warehouseId)}
            disabled={!warehouseId || loading}
          >
            Rifresko
          </button>
        </div>
      </div>

      {err ? <div className="ai-error">{err}</div> : null}

      <div className="ai-stats">
        <div className="ai-stat">
          <div className="ai-stat__label">Magazina</div>
          <div className="ai-stat__value">{whLabel}</div>
        </div>
        <div className="ai-stat">
          <div className="ai-stat__label">Total sasi (copë)</div>
          <div className="ai-stat__value">{stockTotalQty}</div>
        </div>
      </div>

      <div className="ai-grid">
        {/* MOVE FORM */}
        <div className="ai-card">
          <h3>Lëvizje stoku</h3>

          <form className="ai-form" onSubmit={submitMove}>
            <label>Produkt *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">-- zgjidh produkt --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                  {p.sku ? ` (SKU: ${p.sku})` : ""}
                </option>
              ))}
            </select>

            <div className="ai-row">
              <label>
                Tipi
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="IN">IN (Hyrje)</option>
                  <option value="OUT">OUT (Dalje)</option>
                </select>
              </label>

              <label>
                Sasia
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </label>
            </div>

            <label>Arsye</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='p.sh. "Blerje", "Shitje", "Kthim"'
            />

            <label>Shënim</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="opsionale"
            />

            <button
              className="ai-btn ai-btn--primary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Duke ruajtur..." : "Ruaj lëvizjen"}
            </button>
          </form>

          <div className="ai-hint">
            ⚠️ Nëse bën OUT dhe nuk ka stok mjaftueshëm, serveri kthen:{" "}
            <b>Not enough stock</b>.
          </div>
        </div>

        {/* STOCK TABLE */}
        <div className="ai-card">
          <h3>Gjendja e stokut</h3>

          {loading ? (
            <div className="ai-empty">Duke ngarkuar...</div>
          ) : !warehouseId ? (
            <div className="ai-empty">Zgjidh magazinën.</div>
          ) : stock.length === 0 ? (
            <div className="ai-empty">S’ka stok ende (bëj IN).</div>
          ) : (
            <div className="ai-tableWrap">
              <table className="ai-table">
                <thead>
                  <tr>
                    <th>Produkt</th>
                    <th>SKU</th>
                    <th className="ai-right">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s) => (
                    <tr key={s._id}>
                      <td className="ai-strong">{s.productId?.title || "-"}</td>
                      <td className="ai-sub">{s.productId?.sku || "-"}</td>
                      <td className="ai-right ai-strong">
                        {Number(s.qty ?? s.quantity ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MOVEMENTS */}
        <div className="ai-card ai-span2">
          <h3>Historiku (Movements)</h3>

          {!warehouseId ? (
            <div className="ai-empty">Zgjidh magazinën.</div>
          ) : movements.length === 0 ? (
            <div className="ai-empty">S’ka lëvizje ende.</div>
          ) : (
            <div className="ai-tableWrap">
              <table className="ai-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Produkt</th>
                    <th>Tipi</th>
                    <th className="ai-right">Qty</th>
                    <th>Arsye</th>
                    <th>Shënim</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m._id}>
                      <td className="ai-sub">{fmt(m.createdAt)}</td>
                      <td className="ai-strong">{m.productId?.title || "-"}</td>
                      <td>
                        <span
                          className={
                            "ai-pill " +
                            (m.type === "IN" ? "is-green" : "is-red")
                          }
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="ai-right ai-strong">
                        {Number(m.qty ?? m.quantity ?? 0)}
                      </td>
                      <td className="ai-sub">{m.reason || "-"}</td>
                      <td className="ai-sub">{m.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || "-";
  }
}
