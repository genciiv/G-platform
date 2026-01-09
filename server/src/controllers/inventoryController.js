// server/src/controllers/inventoryController.js
import mongoose from "mongoose";
import InventoryMovement from "../models/InventoryMovement.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";

/**
 * POST /api/inventory/move
 * Body:
 * {
 *   warehouseId,
 *   productId,
 *   type: "IN" | "OUT",
 *   quantity: number (REQUIRED)  // pranojmë edhe qty
 *   reason?: string,
 *   note?: string
 * }
 */
export const createMovement = async (req, res) => {
  try {
    const { warehouseId, productId, type, quantity, qty, reason, note } =
      req.body;

    const q = Number(quantity ?? qty);

    if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouseId" });
    }
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({ message: "type must be IN or OUT" });
    }
    if (!Number.isFinite(q) || q <= 0) {
      return res.status(400).json({ message: "quantity must be > 0" });
    }

    const [warehouse, product] = await Promise.all([
      Warehouse.findById(warehouseId),
      Product.findById(productId),
    ]);

    if (!warehouse)
      return res.status(404).json({ message: "Warehouse not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (type === "OUT") {
      const currentStock = await getProductStockNumber(warehouseId, productId);
      if (currentStock < q) {
        return res.status(400).json({
          message: `Not enough stock. Available: ${currentStock}`,
        });
      }
    }

    const mv = await InventoryMovement.create({
      warehouseId,
      productId,
      type,
      quantity: q,
      reason: reason || "",
      note: note || "",
      createdBy: req.user?.id || null,
    });

    const populated = await InventoryMovement.findById(mv._id)
      .populate("warehouseId", "name code location")
      .populate("productId", "title sku")
      .lean();

    // ✅ kthejmë qty në response që client të jetë happy
    return res.json({
      ...populated,
      qty: populated.quantity,
    });
  } catch (err) {
    console.error("❌ createMovement error:", err);
    return res.status(500).json({ message: err?.message || "Failed to create movement" });
  }
};

/**
 * GET /api/inventory/stock?warehouseId=...
 * (pranon edhe /api/inventory/stock/:warehouseId)
 */
export const getStockByWarehouse = async (req, res) => {
  try {
    const warehouseId = req.query.warehouseId || req.params.warehouseId;

    if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouseId" });
    }

    const wh = await Warehouse.findById(warehouseId).select("_id name code");
    if (!wh) return res.status(404).json({ message: "Warehouse not found" });

    const rows = await InventoryMovement.aggregate([
      { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
      {
        $group: {
          _id: "$productId",
          qty: {
            $sum: {
              $cond: [
                { $eq: ["$type", "IN"] },
                "$quantity",
                { $multiply: ["$quantity", -1] },
              ],
            },
          },
        },
      },
      { $sort: { qty: -1 } },
    ]);

    const productIds = rows.map((r) => r._id);
    const products = await Product.find({ _id: { $in: productIds } })
      .select("title sku")
      .lean();

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const items = rows.map((r) => ({
      _id: `${warehouseId}_${String(r._id)}`,
      productId: productMap.get(String(r._id)) ? productMap.get(String(r._id)) : { _id: r._id },
      qty: r.qty,
    }));

    return res.json({
      warehouse: wh,
      items,
    });
  } catch (err) {
    console.error("❌ getStockByWarehouse error:", err);
    return res.status(500).json({ message: err?.message || "Failed to get stock" });
  }
};

/**
 * GET /api/inventory/movements?warehouseId=&productId=&type=&page=&limit=
 */
export const listMovements = async (req, res) => {
  try {
    const { warehouseId, productId, type } = req.query;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

    const filter = {};

    if (warehouseId) {
      if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
        return res.status(400).json({ message: "Invalid warehouseId filter" });
      }
      filter.warehouseId = warehouseId;
    }
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid productId filter" });
      }
      filter.productId = productId;
    }
    if (type) {
      if (!["IN", "OUT"].includes(type)) {
        return res.status(400).json({ message: "Invalid type filter" });
      }
      filter.type = type;
    }

    const [itemsRaw, total] = await Promise.all([
      InventoryMovement.find(filter)
        .populate("warehouseId", "name code location")
        .populate("productId", "title sku")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      InventoryMovement.countDocuments(filter),
    ]);

    const items = itemsRaw.map((m) => ({
      ...m,
      qty: m.quantity,
    }));

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("❌ listMovements error:", err);
    return res.status(500).json({ message: err?.message || "Failed to fetch movements" });
  }
};

/* Helpers */
async function getProductStockNumber(warehouseId, productId) {
  const agg = await InventoryMovement.aggregate([
    {
      $match: {
        warehouseId: new mongoose.Types.ObjectId(warehouseId),
        productId: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        stock: {
          $sum: {
            $cond: [
              { $eq: ["$type", "IN"] },
              "$quantity",
              { $multiply: ["$quantity", -1] },
            ],
          },
        },
      },
    },
  ]);

  return agg?.[0]?.stock || 0;
}
