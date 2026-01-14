// server/src/middleware/auth.js
import jwt from "jsonwebtoken";

function readToken(req) {
  // 1) cookie token (default)
  const c = req.cookies || {};
  if (c.token) return c.token;

  // 2) fallback cookie names
  if (c.user_token) return c.user_token;
  if (c.admin_token) return c.admin_token;

  // 3) Authorization header
  const h = req.headers?.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);

  return null;
}

export function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export function requireUser(req, res, next) {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
