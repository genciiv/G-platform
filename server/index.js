// server/src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js"; // admin
import userAuthRoutes from "./routes/userAuthRoutes.js"; // USERS
import warehouseRoutes from "./routes/warehouseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import userProfile from "./routes/userProfile.js";

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// HEALTH
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ===== ROUTES =====
app.use("/api/auth", authRoutes); // ADMIN LOGIN
app.use("/api/userauth", userAuthRoutes); // USER LOGIN / REGISTER ✅
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/user", userProfile);

// SERVER
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
