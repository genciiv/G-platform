import Product from "../models/Product.js";

function toBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}
function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function cleanImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map((x) => String(x || "").trim()).filter(Boolean);
}

function cleanSpecs(specs) {
  if (!Array.isArray(specs)) return [];
  return specs
    .map((s) => ({
      key: String(s?.key || "").trim(),
      value: String(s?.value || "").trim(),
    }))
    .filter((s) => s.key && s.value);
}

// GET /api/products
export async function listProducts(req, res) {
  try {
    const items = await Product.find()
      .populate("category", "name slug showOnHome sortOrder")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: "Products error", error: err?.message });
  }
}

// GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const item = await Product.findById(req.params.id).populate(
      "category",
      "name slug showOnHome sortOrder"
    );
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ message: "Product error", error: err?.message });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const title = String(req.body?.title || "").trim();
    const price = toNum(req.body?.price, NaN);

    if (!title) return res.status(400).json({ message: "Title required" });
    if (!Number.isFinite(price) || price < 0)
      return res.status(400).json({ message: "Invalid price" });

    const payload = {
      title,
      sku: String(req.body?.sku || "").trim(),
      price,
      active: toBool(req.body?.active),
      category: req.body?.category || null,
      images: cleanImages(req.body?.images),
      specs: cleanSpecs(req.body?.specs),
      stockQty: Math.max(0, toNum(req.body?.stockQty, 0)),
    };

    const created = await Product.create(payload);
    const item = await Product.findById(created._id).populate(
      "category",
      "name slug showOnHome sortOrder"
    );

    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ message: "Create product error", error: err?.message });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const title = String(req.body?.title || "").trim();
    const price = toNum(req.body?.price, NaN);

    if (!title) return res.status(400).json({ message: "Title required" });
    if (!Number.isFinite(price) || price < 0)
      return res.status(400).json({ message: "Invalid price" });

    const payload = {
      title,
      sku: String(req.body?.sku || "").trim(),
      price,
      active: toBool(req.body?.active),
      category: req.body?.category || null,
      images: cleanImages(req.body?.images),
      specs: cleanSpecs(req.body?.specs),
      stockQty: Math.max(0, toNum(req.body?.stockQty, 0)),
    };

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug showOnHome sortOrder");

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ item: updated });
  } catch (err) {
    res.status(500).json({ message: "Update product error", error: err?.message });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: "Delete product error", error: err?.message });
  }
}
