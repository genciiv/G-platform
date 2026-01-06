import mongoose from "mongoose";
import InventoryMovement from "../models/InventoryMovement.js";
import { getStockForWarehouse } from "../utils/stock.js";

export async function addMovement(req, res) {
  try {
    const { warehouseId, productId, type, quantity, note, refType, refId } = req.body;

    const mv = await InventoryMovement.create({
      warehouseId,
      productId,
      type,
      quantity,
      note: note || "",
      refType: refType || "MANUAL",
      refId: refId || null,
    });

    res.status(201).json(mv);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

export async function getStock(req, res) {
  try {
    const { warehouseId, productId } = req.query;

    if (!warehouseId || !productId) {
      return res.status(400).json({ message: "warehouseId and productId are required" });
    }

    const stock = await getStockForWarehouse({
      warehouseId: new mongoose.Types.ObjectId(warehouseId),
      productId: new mongoose.Types.ObjectId(productId),
    });

    res.json({ warehouseId, productId, stock });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
