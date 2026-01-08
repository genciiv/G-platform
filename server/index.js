// server/src/index.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

// routes
import productRoutes from "./routes/productRoutes.js";
// nëse i ke edhe këto, mbaji:
// import authRoutes from "./routes/authRoutes.js";
// import warehouseRoutes from "./routes/warehouseRoutes.js";
// import inventoryRoutes from "./routes/inventoryRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// mount routes
app.use("/api/products", productRoutes);

// nëse i ke:
// app.use("/api/auth", authRoutes);
// app.use("/api/warehouses", warehouseRoutes);
// app.use("/api/inventory", inventoryRoutes);
// app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
