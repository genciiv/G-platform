// server/src/middleware/userAuth.js
import jwt from "jsonwebtoken";

/**
 * Lexon token nga cookie ose Authorization: Bearer <token>
 * cookie name: user_token
 */
function readToken(req) {
  const fromCookie = req.cookies?.user_token;
  const fromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  return fromCookie || fromHeader || "";
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.verify(token, secret);
}

/**
 * OPTIONAL USER:
 * - nëse ka token, vendos req.user = { id, email }
 * - nëse s’ka token, vazhdon pa user
 */
export function optionalUser(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return next();

    const decoded = verifyToken(token);
    if (decoded?.id) {
      req.user = { id: String(decoded.id), email: decoded.email || "" };
    }
    return next();
  } catch {
    // token i pavlefshëm -> thjesht s’e marrim user
    req.user = null;
    return next();
  }
}

/**
 * REQUIRE USER:
 * - duhet patjetër të jetë i loguar (token valid)
 */
export function requireUser(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: String(decoded.id), email: decoded.email || "" };
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
