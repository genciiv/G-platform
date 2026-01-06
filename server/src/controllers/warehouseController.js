import Warehouse from "../models/Warehouse.js";

export async function createWarehouse(req, res) {
  try {
    const { name, code, address } = req.body;
    const w = await Warehouse.create({ name, code, address });
    res.status(201).json(w);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function listWarehouses(req, res) {
  const rows = await Warehouse.find().sort({ createdAt: -1 });
  res.json(rows);
}
