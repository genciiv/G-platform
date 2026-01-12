import jwt from "jsonwebtoken";
import UserAccount from "../models/UserAccount.js";

function readToken(req) {
  const fromCookie = req.cookies?.user_token;
  const fromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  return fromCookie || fromHeader || "";
}

export async function userOptional(req, res, next) {
  try {
    const token = readToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret);

    const user = await UserAccount.findById(decoded.id).select("_id name email");
    req.user = user ? { id: String(user._id), name: user.name, email: user.email } : null;

    return next();
  } catch {
    req.user = null;
    return next();
  }
}

export async function userRequired(req, res, next) {
  await userOptional(req, res, () => {});
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  return next();
}
