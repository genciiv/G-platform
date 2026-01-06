import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../services/api.js";

export default function TrackOrder() {
  const [sp] = useSearchParams();
  const codeFromUrl = sp.get("code") || "";

  const [code, setCode] = useState(codeFromUrl);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function fetchIt(c) {
    setErr("");
    setData(null);
    const cc = (c || "").trim();
    if (!cc) return setErr("Vendos kodin e porosisë");

    try {
      const res = await api.get(`/api/orders/track/${encodeURIComponent(cc)}`);
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Nuk u gjet porosia");
    }
  }

  useEffect(() => {
    if (codeFromUrl) fetchIt(codeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2>Gjurmim Porosie</h2>

      <div style={{ maxWidth: 520, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="p.sh. GA-20260106-123456"
          />
          <button
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
            onClick={() => fetchIt(code)}
          >
            Kërko
          </button>
        </div>

        {err ? <p style={{ color: "#c00" }}>{err}</p> : null}

        {data ? (
          <div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
            <div><b>Kodi:</b> {data.orderCode}</div>
            <div><b>Status:</b> {data.status}</div>
            <div><b>Emri:</b> {data.customer?.fullName}</div>
            <div><b>Qyteti:</b> {data.customer?.city || "-"}</div>
            <div><b>Totali:</b> {data.total}€</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
