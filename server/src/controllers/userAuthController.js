// server/src/controllers/userAuthController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserAccount from "../models/UserAccount.js";

function signUserToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ id: user._id, role: "user" }, secret, { expiresIn: "7d" });
}

function setUserCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("user_token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // ne prod duhet true (https)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password min 6 chars" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const exists = await UserAccount.findOne({ email: cleanEmail }).select(
      "_id"
    );
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await UserAccount.create({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
    });

    const token = signUserToken(user);
    setUserCookie(res, token);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ registerUser error:", err);
    return res.status(500).json({ message: "Register failed" });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const user = await UserAccount.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signUserToken(user);
    setUserCookie(res, token);

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ loginUser error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function meUser(req, res) {
  try {
    const token = req.cookies?.user_token;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret);

    const user = await UserAccount.findById(decoded.id).select("name email");
    if (!user) return res.status(401).json({ message: "Not logged in" });

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    return res.status(401).json({ message: "Not logged in" });
  }
}

export async function logoutUser(req, res) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("user_token", "", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 0,
  });
  return res.json({ ok: true });
}
