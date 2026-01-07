import Warehouse from "../models/Warehouse.js";

/**
 * GET /api/warehouses
 */
export const listWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ createdAt: -1 });
    res.json(warehouses);
  } catch (err) {
    console.error("listWarehouses:", err.message);
    res.status(500).json({ message: "Failed to fetch warehouses" });
  }
};

/**
 * POST /api/warehouses
 */
export const createWarehouse = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Warehouse name is required" });
    }

    const warehouse = await Warehouse.create({
      name,
      location: location || "",
    });

    res.status(201).json(warehouse);
  } catch (err) {
    console.error("createWarehouse:", err.message);
    res.status(500).json({ message: "Failed to create warehouse" });
  }
};

/**
 * PATCH /api/warehouses/:id
 */
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.json(warehouse);
  } catch (err) {
    console.error("updateWarehouse:", err.message);
    res.status(500).json({ message: "Failed to update warehouse" });
  }
};

/**
 * DELETE /api/warehouses/:id
 */
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await Warehouse.findByIdAndDelete(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    console.error("deleteWarehouse:", err.message);
    res.status(500).json({ message: "Failed to delete warehouse" });
  }
};
