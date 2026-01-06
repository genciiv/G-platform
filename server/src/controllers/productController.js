import Product from "../models/Product.js";

export async function createProduct(req, res) {
  try {
    const data = req.body;
    const p = await Product.create({
      name: data.name,
      sku: data.sku,
      barcode: data.barcode || "",
      categoryId: data.categoryId,
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      description: data.description || "",
      images: data.images || [],
      isActive: data.isActive ?? true,
    });
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listProducts(req, res) {
  const rows = await Product.find()
    .populate("categoryId", "name slug")
    .sort({ createdAt: -1 });

  res.json(rows);
}
