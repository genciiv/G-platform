import Category from "../models/Category.js";

export async function createCategory(req, res) {
  try {
    const { name, slug, parentId } = req.body;
    const c = await Category.create({ name, slug, parentId: parentId || null });
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listCategories(req, res) {
  const rows = await Category.find().sort({ createdAt: -1 });
  res.json(rows);
}
