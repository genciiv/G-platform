import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/adminAuth.jsx";
import "./adminLogin.css";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u?.role !== "admin") throw new Error("Not admin");
      nav("/admin/products");
    } catch {
      setErr("Login i pasaktë");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="al_wrap">
      <div className="al_card">
        <h2>Admin Login</h2>

        <form className="al_form" onSubmit={submit}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {err ? <p className="al_err">{err}</p> : null}

          <button disabled={loading}>{loading ? "Duke hyrë..." : "Hyr"}</button>
        </form>
      </div>
    </div>
  );
}
