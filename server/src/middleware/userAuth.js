// server/src/middleware/userAuth.js
import jwt from "jsonwebtoken";

export function userAuth(req, res, next) {
  try {
    const token =
      req.cookies?.user_token ||
      (req.headers.authorization || "").replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
