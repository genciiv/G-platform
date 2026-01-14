// server/src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js"; // admin
import userAuthRoutes from "./routes/userAuthRoutes.js"; // users
import warehouseRoutes from "./routes/warehouseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";

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

// ✅ DEBUG: të tregon nëse serveri ka /api/home apo jo
app.get("/api/routes", (req, res) => {
  res.json({
    ok: true,
    routes: [
      "/api/health",
      "/api/auth/*",
      "/api/userauth/*",
      "/api/warehouses/*",
      "/api/categories/*",
      "/api/products/*",
      "/api/inventory/*",
      "/api/orders/*",
      "/api/home",
    ],
  });
});

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/userauth", userAuthRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/home", homeRoutes);

// 404 fallback (që ta shohësh qartë kur mungon diçka)
app.use((req, res) => {
  res.status(404).json({ message: "Not Found", path: req.originalUrl });
});

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
