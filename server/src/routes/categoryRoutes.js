// server/src/routes/categoryRoutes.js
import express from "express";
import Category from "../models/Category.js";
import { slugify } from "../utils/slugify.js";

// Nëse ke middleware admin, përdore këtu:
// import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// PUBLIC: list categories
// GET /api/categories?active=1
router.get("/", async (req, res) => {
  const active = String(req.query.active || "");
  const filter = {};
  if (active === "1" || active === "true") filter.isActive = true;

  const items = await Category.find(filter).sort({ name: 1 }).lean();
  res.json({ items });
});

// ADMIN: create
// POST /api/categories
router.post("/", /*requireAdmin,*/ async (req, res) => {
  const { name, icon = "", isActive = true } = req.body || {};
  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ message: "Emri i kategorisë është i detyrueshëm." });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let i = 1;

  // ensure unique slug
  while (await Category.exists({ slug })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }

  const created = await Category.create({
    name: String(name).trim(),
    slug,
    icon: String(icon || ""),
    isActive: Boolean(isActive),
  });

  res.status(201).json({ item: created });
});

// ADMIN: update
// PUT /api/categories/:id
router.put("/:id", /*requireAdmin,*/ async (req, res) => {
  const { id } = req.params;
  const { name, icon, isActive } = req.body || {};

  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: "Kategoria nuk u gjet." });

  if (typeof name === "string" && name.trim().length >= 2) {
    cat.name = name.trim();

    // regen slug if name changed
    const baseSlug = slugify(cat.name);
    let slug = baseSlug;
    let i = 1;
    while (await Category.exists({ slug, _id: { $ne: cat._id } })) {
      i += 1;
      slug = `${baseSlug}-${i}`;
    }
    cat.slug = slug;
  }

  if (typeof icon === "string") cat.icon = icon;
  if (typeof isActive === "boolean") cat.isActive = isActive;

  await cat.save();
  res.json({ item: cat });
});

// ADMIN: delete
// DELETE /api/categories/:id
router.delete("/:id", /*requireAdmin,*/ async (req, res) => {
  const { id } = req.params;
  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: "Kategoria nuk u gjet." });

  await cat.deleteOne();
  res.json({ ok: true });
});

export default router;
