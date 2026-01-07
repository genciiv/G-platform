import Product from "../models/Product.js";

/**
 * GET /api/products
 * Public: list products
 */
export const listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("listProducts:", err.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * GET /api/products/:id
 * Public: single product
 */
export const getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    console.error("getProduct:", err.message);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/**
 * POST /api/products
 * Admin: create product
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, discountPrice, description, sku, images } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }

    const p = await Product.create({
      name: String(name).trim(),
      price: Number(price),
      discountPrice:
        discountPrice === undefined || discountPrice === ""
          ? undefined
          : Number(discountPrice),
      description: description || "",
      sku: sku || "",
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json(p);
  } catch (err) {
    console.error("createProduct:", err.message);
    res.status(500).json({ message: "Failed to create product" });
  }
};

/**
 * PATCH /api/products/:id
 * Admin: update product
 */
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateProduct:", err.message);
    res.status(500).json({ message: "Failed to update product" });
  }
};

/**
 * DELETE /api/products/:id
 * Admin: delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct:", err.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
