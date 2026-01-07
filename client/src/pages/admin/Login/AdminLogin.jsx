import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/adminAuth.jsx";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@gapp.local");
  const [password, setPassword] = useState("Admin12345!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password required");
      return;
    }

    try {
      setLoading(true);
      await login({ email: email.trim(), password });
      navigate("/admin/products", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLogin">
      <div className="adminLogin__card">
        <h1>Admin Login</h1>
        <p>Hyr për të menaxhuar dyqanin.</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gapp.local"
            autoComplete="username"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            autoComplete="current-password"
          />

          {error ? <div className="adminLogin__error">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Duke u futur..." : "Identifikohu"}
          </button>
        </form>

        <div className="adminLogin__hint">
          Nëse s’ke admin: hap <code>/api/auth/seed-admin</code> një herë.
        </div>
      </div>
    </div>
  );
}
