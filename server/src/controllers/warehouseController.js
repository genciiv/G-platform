import Warehouse from "../models/Warehouse.js";

// GET /api/warehouses
export const listWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });
    return res.json(warehouses);
  } catch (err) {
    console.error("❌ listWarehouses error:", err.message);
    return res.status(500).json({ message: "Failed to fetch warehouses" });
  }
};
