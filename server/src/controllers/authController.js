// server/src/controllers/authController.js
import bcrypt from "bcrypt";
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

export async function adminSeed(req, res) {
  try {
    const name = process.env.ADMIN_NAME || "Admin";
    const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "ADMIN_EMAIL/ADMIN_PASSWORD missing in .env" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.findOneAndUpdate(
      { email },
      { name, email, passwordHash, role: "admin" },
      { new: true, upsert: true }
    );

    return res.json({
      ok: true,
      message: "Admin is ready (created/updated)",
      email: admin.email,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const password = req.body?.password || "";

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ vetëm admin
    if (user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    // ✅ DEBUG
    console.log("LOGIN ADMIN:", {
      id: String(user._id),
      role: user.role,
      email: user.email,
    });

    setTokenCookie(res, {
      id: String(user._id),
      role: "admin",
      email: user.email,
      name: user.name,
    });

    return res.json({
      ok: true,
      admin: {
        _id: String(user._id),
        email: user.email,
        name: user.name,
        role: "admin",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function logout(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });
  return res.json({ ok: true });
}

export async function me(req, res) {
  return res.json({
    ok: true,
    admin: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  });
}
