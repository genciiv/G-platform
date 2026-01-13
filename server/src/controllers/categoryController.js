// server/src/controllers/categoryController.js
import Category from "../models/Category.js";

function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// PUBLIC: list
export async function listCategories(req, res) {
  try {
    const onlyActive = String(req.query.active || "1") !== "0";
    const q = String(req.query.q || "").trim();

    const filter = {};
    if (onlyActive) filter.isActive = true;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Category.find(filter).sort({ name: 1 });
    return res.json({ items });
  } catch (err) {
    console.error("❌ listCategories:", err);
    return res.status(500).json({ message: "Failed to load categories" });
  }
}

// ADMIN: create
export async function createCategory(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const icon = String(req.body?.icon || "").trim();
    const image = String(req.body?.image || "").trim();
    const isActive = req.body?.isActive !== false;

    if (!name) return res.status(400).json({ message: "Name is required" });

    let slug = String(req.body?.slug || "").trim().toLowerCase();
    if (!slug) slug = slugify(name);

    const exists = await Category.findOne({ slug }).select("_id");
    if (exists) return res.status(400).json({ message: "Slug already exists" });

    const item = await Category.create({ name, slug, icon, image, isActive });
    return res.status(201).json({ item });
  } catch (err) {
    console.error("❌ createCategory:", err);
    return res.status(500).json({ message: "Create failed" });
  }
}

// ADMIN: update
export async function updateCategory(req, res) {
  try {
    const id = req.params.id;

    const payload = {};
    if (req.body?.name != null) payload.name = String(req.body.name).trim();
    if (req.body?.icon != null) payload.icon = String(req.body.icon).trim();
    if (req.body?.image != null) payload.image = String(req.body.image).trim();
    if (req.body?.isActive != null) payload.isActive = !!req.body.isActive;

    if (req.body?.slug != null) {
      payload.slug = String(req.body.slug).trim().toLowerCase();
    } else if (payload.name) {
      // nëse ndryshon emri, nuk ja ndryshojmë slug automatik (që mos prishet linku)
    }

    if (payload.slug) {
      const exists = await Category.findOne({ slug: payload.slug, _id: { $ne: id } }).select("_id");
      if (exists) return res.status(400).json({ message: "Slug already exists" });
    }

    const item = await Category.findByIdAndUpdate(id, payload, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });

    return res.json({ item });
  } catch (err) {
    console.error("❌ updateCategory:", err);
    return res.status(500).json({ message: "Update failed" });
  }
}

// ADMIN: delete
export async function deleteCategory(req, res) {
  try {
    const id = req.params.id;
    const ok = await Category.findByIdAndDelete(id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ deleteCategory:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
}
