// server/src/routes/productRoutes.js
import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

// GET /api/products?q=&category=&min=&max=&active=1
router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();
  const active = String(req.query.active || "");
  const min = req.query.min != null && req.query.min !== "" ? Number(req.query.min) : null;
  const max = req.query.max != null && req.query.max !== "" ? Number(req.query.max) : null;

  const filter = {};

  if (active === "1" || active === "true") filter.isActive = true;

  if (category) {
    // category can be ObjectId OR slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
    if (isObjectId) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat?._id) filter.category = cat._id;
      else filter.category = "__none__"; // no results
    }
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (min != null || max != null) {
    filter.price = {};
    if (min != null && !Number.isNaN(min)) filter.price.$gte = min;
    if (max != null && !Number.isNaN(max)) filter.price.$lte = max;
  }

  const items = await Product.find(filter)
    .sort({ createdAt: -1 })
    .populate("category", "name slug icon isActive")
    .lean();

  res.json({ items });
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id)
    .populate("category", "name slug icon isActive")
    .lean();
  if (!p) return res.status(404).json({ message: "Produkti nuk u gjet." });
  res.json({ item: p });
});

// ADMIN: create product
router.post("/", async (req, res) => {
  const { title, sku, description, price, images, category, isActive = true } = req.body || {};

  if (!title || String(title).trim().length < 2) {
    return res.status(400).json({ message: "Titulli është i detyrueshëm." });
  }

  const payload = {
    title: String(title).trim(),
    sku: String(sku || "").trim(),
    description: String(description || ""),
    price: Number(price || 0),
    images: Array.isArray(images) ? images.filter(Boolean) : [],
    isActive: Boolean(isActive),
    category: category || null,
  };

  const created = await Product.create(payload);
  const item = await Product.findById(created._id).populate("category", "name slug icon isActive").lean();
  res.status(201).json({ item });
});

// ADMIN: update product
router.put("/:id", async (req, res) => {
  const { title, sku, description, price, images, category, isActive } = req.body || {};

  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Produkti nuk u gjet." });

  if (typeof title === "string" && title.trim().length >= 2) p.title = title.trim();
  if (typeof sku === "string") p.sku = sku.trim();
  if (typeof description === "string") p.description = description;
  if (price != null) p.price = Number(price || 0);
  if (Array.isArray(images)) p.images = images.filter(Boolean);

  // allow null
  if (category === null || category === "" || category === undefined) p.category = null;
  else p.category = category;

  if (typeof isActive === "boolean") p.isActive = isActive;

  await p.save();
  const item = await Product.findById(p._id).populate("category", "name slug icon isActive").lean();
  res.json({ item });
});

// ADMIN: delete product
router.delete("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Produkti nuk u gjet." });
  await p.deleteOne();
  res.json({ ok: true });
});

export default router;
