import jwt from "jsonwebtoken";

// Lexon token nga: Authorization: Bearer <token>
export function requireUser(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized (no token)" });
    }

    // përdor sekretin që ke në .env
    const secret =
      process.env.JWT_SECRET || process.env.USER_JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret);

    // prano id nga forma të ndryshme
    const id = decoded?.id || decoded?._id || decoded?.userId;
    if (!id) {
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized (bad token)" });
    }

    req.user = { id, decoded };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}
