import Warehouse from "../models/Warehouse.js";

function makeCodeFromName(name = "") {
  const clean = String(name)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean ? `WH-${clean}` : `WH-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

export async function getWarehouses(req, res) {
  const items = await Warehouse.find({}).sort({ createdAt: -1 });
  return res.json(items);
}

export async function createWarehouse(req, res) {
  try {
    const { name, code, location, active } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const finalCode = normalizeCode(code) || makeCodeFromName(name);

    const doc = await Warehouse.create({
      name: String(name).trim(),
      code: finalCode,
      location: String(location || "").trim(),
      active: active !== false,
    });

    return res.status(201).json(doc);
  } catch (err) {
    // duplicate key error (code unique)
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Kodi ekziston. Përdor një kod tjetër." });
    }

    // mongoose validation
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    console.error("createWarehouse error:", err);
    return res.status(500).json({ message: "Server error creating warehouse" });
  }
}

export async function updateWarehouse(req, res) {
  try {
    const { id } = req.params;
    const { name, code, location, active } = req.body;

    const patch = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (code !== undefined) patch.code = normalizeCode(code);
    if (location !== undefined) patch.location = String(location).trim();
    if (active !== undefined) patch.active = !!active;

    const updated = await Warehouse.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Warehouse not found" });
    return res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Kodi ekziston. Përdor një kod tjetër." });
    }
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    console.error("updateWarehouse error:", err);
    return res.status(500).json({ message: "Server error updating warehouse" });
  }
}

export async function deleteWarehouse(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Warehouse.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Warehouse not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteWarehouse error:", err);
    return res.status(500).json({ message: "Server error deleting warehouse" });
  }
}
