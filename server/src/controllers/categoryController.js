import Category from "../models/Category.js";

function toBool(v) {
  // vjen nga client si true/false (ose "true"/"false")
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return false;
}

function toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// GET /api/categories
export async function listCategories(req, res) {
  try {
    const items = await Category.find().sort({ sortOrder: 1, createdAt: 1 });
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Categories error", error: err?.message });
  }
}

// POST /api/categories
export async function createCategory(req, res) {
  try {
    const name = (req.body?.name || "").trim();
    const slug = (req.body?.slug || "").trim();

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const showOnHome = toBool(req.body?.showOnHome);
    const sortOrder = toNum(req.body?.sortOrder, 0);

    const created = await Category.create({
      name,
      slug,
      showOnHome,
      sortOrder,
    });

    return res.status(201).json({ item: created });
  } catch (err) {
    // p.sh. slug unique
    return res.status(500).json({ message: "Create category error", error: err?.message });
  }
}

// PUT /api/categories/:id
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;

    const name = (req.body?.name || "").trim();
    const slug = (req.body?.slug || "").trim();

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const showOnHome = toBool(req.body?.showOnHome);
    const sortOrder = toNum(req.body?.sortOrder, 0);

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        showOnHome,   // ✅ kjo ishte pjesa që zakonisht mungon
        sortOrder,    // ✅ edhe kjo
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Category not found" });
    return res.json({ item: updated });
  } catch (err) {
    return res.status(500).json({ message: "Update category error", error: err?.message });
  }
}

// DELETE /api/categories/:id
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: "Delete category error", error: err?.message });
  }
}
