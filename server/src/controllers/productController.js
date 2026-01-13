// server/src/controllers/productController.js
import Product from "../models/Product.js";

function normalizeImages(body) {
  // pranon:
  // - images: ["url1","url2"]
  // - imageUrls: ["url1"]
  // - image: "url"
  const a =
    body?.images ||
    body?.imageUrls ||
    body?.photos ||
    [];

  let arr = [];
  if (Array.isArray(a)) arr = a.map((x) => String(x || "").trim()).filter(Boolean);

  const single = String(body?.image || "").trim();
  if (single && !arr.includes(single)) arr.unshift(single);

  return arr;
}

// PUBLIC LIST
export async function listProducts(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();
    const activeOnly = String(req.query.active || "1") !== "0";
    const min = req.query.min != null ? Number(req.query.min) : null;
    const max = req.query.max != null ? Number(req.query.max) : null;

    const filter = {};
    if (activeOnly) filter.isActive = true;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    if (min != null || max != null) {
      filter.price = {};
      if (min != null && !Number.isNaN(min)) filter.price.$gte = min;
      if (max != null && !Number.isNaN(max)) filter.price.$lte = max;
    }

    const items = await Product.find(filter)
      .populate("category", "name slug icon")
      .sort({ createdAt: -1 });

    return res.json({ items });
  } catch (err) {
    console.error("❌ listProducts:", err);
    return res.status(500).json({ message: "Failed to load products" });
  }
}

// PUBLIC DETAILS
export async function getProduct(req, res) {
  try {
    const id = req.params.id;
    const item = await Product.findById(id).populate("category", "name slug icon");
    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json({ item });
  } catch (err) {
    console.error("❌ getProduct:", err);
    return res.status(500).json({ message: "Failed" });
  }
}

// ADMIN CREATE
export async function createProduct(req, res) {
  try {
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim();
    const price = Number(req.body?.price || 0);
    const sku = String(req.body?.sku || "").trim();
    const category = req.body?.category || null;
    const isActive = req.body?.isActive !== false;

    if (!title) return res.status(400).json({ message: "Title is required" });
    if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: "Invalid price" });

    const images = normalizeImages(req.body);

    const item = await Product.create({
      title,
      description,
      price,
      sku,
      category: category || null,
      images,
      image: images[0] || "",
      isActive,
    });

    const full = await Product.findById(item._id).populate("category", "name slug icon");
    return res.status(201).json({ item: full });
  } catch (err) {
    console.error("❌ createProduct:", err);
    return res.status(500).json({ message: "Create failed" });
  }
}

// ADMIN UPDATE
export async function updateProduct(req, res) {
  try {
    const id = req.params.id;

    const payload = {};
    if (req.body?.title != null) payload.title = String(req.body.title).trim();
    if (req.body?.description != null) payload.description = String(req.body.description).trim();
    if (req.body?.price != null) payload.price = Number(req.body.price);
    if (req.body?.sku != null) payload.sku = String(req.body.sku).trim();
    if (req.body?.category != null) payload.category = req.body.category || null;
    if (req.body?.isActive != null) payload.isActive = !!req.body.isActive;

    // images
    if (req.body?.images != null || req.body?.imageUrls != null || req.body?.photos != null || req.body?.image != null) {
      const images = normalizeImages(req.body);
      payload.images = images;
      payload.image = images[0] || "";
    }

    if (payload.price != null && (Number.isNaN(payload.price) || payload.price < 0)) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const item = await Product.findByIdAndUpdate(id, payload, { new: true }).populate(
      "category",
      "name slug icon"
    );

    if (!item) return res.status(404).json({ message: "Not found" });
    return res.json({ item });
  } catch (err) {
    console.error("❌ updateProduct:", err);
    return res.status(500).json({ message: "Update failed" });
  }
}

// ADMIN DELETE
export async function deleteProduct(req, res) {
  try {
    const id = req.params.id;
    const ok = await Product.findByIdAndDelete(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ deleteProduct:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
}
