// server/src/middleware/auth.js
import jwt from "jsonwebtoken";

function readToken(req) {
  const c = req.cookies || {};

  // cookie name UNIK
  if (c.token) return c.token;

  // fallback header
  const h = req.headers?.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);

  return null;
}

export function requireAuth(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded duhet te kete { id, role, email, name }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}

export function requireUser(req, res, next) {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}
