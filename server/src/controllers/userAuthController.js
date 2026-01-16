// server/src/controllers/userAuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function setTokenCookie(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function toPublicUser(u) {
  return { _id: String(u._id), name: u.name, email: u.email, role: u.role };
}

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password min 6 chars" });
    }

    const exists = await User.findOne({ email }).select("_id");
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "user",
    });

    setTokenCookie(res, {
      id: String(user._id),
      role: "user",
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    return res.status(500).json({ message: "Register failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ user login: roli duhet të jetë user
    const role = user.role === "admin" ? "admin" : "user";

    setTokenCookie(res, {
      id: String(user._id),
      role,
      email: user.email,
      name: user.name,
    });

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const meUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(decoded.id).select("name email role");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("❌ meUser error:", err);
    return res.status(500).json({ message: "Failed" });
  }
};

export const logoutUser = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
  return res.json({ ok: true });
};
