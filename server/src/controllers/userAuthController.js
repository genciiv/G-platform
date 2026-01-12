// server/src/controllers/userAuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserAccount from "../models/UserAccount.js";

function signToken(payload) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("user_token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // në prod duhet true (HTTPS)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function readToken(req) {
  const fromCookie = req.cookies?.user_token;
  const fromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  return fromCookie || fromHeader || "";
}

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password min 6 chars" });
    }

    const exists = await UserAccount.findOne({ email }).select("_id");
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserAccount.create({
      name,
      email,
      passwordHash,
    });

    const token = signToken({ id: String(user._id), email: user.email });

    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    return res.status(500).json({ message: "Register failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await UserAccount.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: String(user._id), email: user.email });
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const meUser = async (req, res) => {
  try {
    const token = readToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserAccount.findById(decoded.id).select("name email");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    return res.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ meUser error:", err);
    return res.status(500).json({ message: "Failed" });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("user_token");
  return res.json({ ok: true });
};
