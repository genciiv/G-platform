import Category from "../models/Category.js";
import Product from "../models/Product.js";

export async function getHome(req, res) {
  try {
    const categories = await Category.find({ showOnHome: true }).sort({
      sortOrder: 1,
      createdAt: 1,
    });

    const sections = [];

    for (const c of categories) {
      const items = await Product.find({
        active: true,
        category: c._id,
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("title sku price images specs stockQty active category createdAt");

      sections.push({
        category: { _id: c._id, name: c.name, slug: c.slug },
        items,
      });
    }

    res.json({ sections });
  } catch (err) {
    res.status(500).json({ message: "Home error", error: err?.message });
  }
}
