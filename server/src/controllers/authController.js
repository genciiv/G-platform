import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const adminSeed = async (req, res) => {
  // kjo route e përdor vetëm lokalisht (opsionale).
  try {
    const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Missing ADMIN_EMAIL or ADMIN_PASSWORD in env" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.json({ ok: true, message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: "admin", name: "Admin" });

    return res.json({ ok: true, message: "Admin created" });
  } catch (err) {
    return res.status(500).json({ message: "Seed failed" });
  }
};

export const login = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email, active: true });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // kur ta hedhësh live me https -> true
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
};

export const me = async (req, res) => {
  return res.json({ ok: true, user: req.user });
};
