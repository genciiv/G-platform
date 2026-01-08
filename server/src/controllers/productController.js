// server/src/controllers/productController.js
import Product from "../models/Product.js";

// GET /api/products?q=...
export async function listProducts(req, res) {
  const q = (req.query.q || "").trim();

  const filter = q
    ? {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { sku: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const items = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ items });
}

// GET /api/products/:id
export async function getProductById(req, res) {
  const { id } = req.params;
  const item = await Product.findById(id);
  if (!item) return res.status(404).json({ message: "Product not found" });
  res.json({ item });
}

// POST /api/products
export async function createProduct(req, res) {
  const { title, price, sku, description, image, active } = req.body || {};

  if (!title || String(title).trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  const doc = await Product.create({
    title: String(title).trim(),
    price: Number(price || 0),
    sku: sku ? String(sku).trim() : "",
    description: description ? String(description).trim() : "",
    image: image ? String(image).trim() : "",
    active: active !== undefined ? !!active : true,
  });

  res.status(201).json({ item: doc });
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { title, price, sku, description, image, active } = req.body || {};

  const item = await Product.findById(id);
  if (!item) return res.status(404).json({ message: "Product not found" });

  if (title !== undefined) item.title = String(title).trim();
  if (price !== undefined) item.price = Number(price || 0);
  if (sku !== undefined) item.sku = sku ? String(sku).trim() : "";
  if (description !== undefined)
    item.description = description ? String(description).trim() : "";
  if (image !== undefined) item.image = image ? String(image).trim() : "";
  if (active !== undefined) item.active = !!active;

  await item.save();
  res.json({ item });
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  const { id } = req.params;

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Product not found" });

  res.json({ ok: true });
}
