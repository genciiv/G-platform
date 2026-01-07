// server/src/controllers/inventoryController.js
import mongoose from "mongoose";
import InventoryMovement from "../models/InventoryMovement.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";

/**
 * POST /api/inventory/movements
 * Body:
 * {
 *   warehouseId,
 *   productId,
 *   type: "IN" | "OUT",
 *   quantity: number,
 *   note?: string
 * }
 */
export const createMovement = async (req, res) => {
  try {
    const { warehouseId, productId, type, quantity, note } = req.body;

    const qty = Number(quantity);

    if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouseId" });
    }
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }
    if (!["IN", "OUT"].includes(type)) {
      return res.status(400).json({ message: "type must be IN or OUT" });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "quantity must be > 0" });
    }

    // Ensure warehouse & product exist
    const [warehouse, product] = await Promise.all([
      Warehouse.findById(warehouseId),
      Product.findById(productId),
    ]);

    if (!warehouse)
      return res.status(404).json({ message: "Warehouse not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // If OUT, ensure enough stock
    if (type === "OUT") {
      const currentStock = await getProductStockNumber(warehouseId, productId);
      if (currentStock < qty) {
        return res.status(400).json({
          message: `Not enough stock. Available: ${currentStock}`,
        });
      }
    }

    const mv = await InventoryMovement.create({
      warehouseId,
      productId,
      type,
      quantity: qty,
      note: note || "",
      createdBy: req.user?.id || null, // admin/staff user id (if auth enabled)
    });

    const populated = await InventoryMovement.findById(mv._id)
      .populate("warehouseId", "name location")
      .populate("productId", "name price sku")
      .sort({ createdAt: -1 });

    return res.json(populated);
  } catch (err) {
    console.error("❌ createMovement error:", err.message);
    return res.status(500).json({ message: "Failed to create movement" });
  }
};

/**
 * GET /api/inventory/stock/:warehouseId
 * Returns:
 * [{ productId, stock, product }]
 */
export const getStockByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouseId" });
    }

    const wh = await Warehouse.findById(warehouseId).select("_id name");
    if (!wh) return res.status(404).json({ message: "Warehouse not found" });

    const rows = await InventoryMovement.aggregate([
      { $match: { warehouseId: new mongoose.Types.ObjectId(warehouseId) } },
      {
        $group: {
          _id: "$productId",
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
      { $sort: { stock: -1 } },
    ]);

    const productIds = rows.map((r) => r._id);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name price sku images"
    );

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const out = rows.map((r) => ({
      productId: r._id,
      stock: r.stock,
      product: productMap.get(String(r._id)) || null,
    }));

    return res.json({
      warehouse: wh,
      items: out,
    });
  } catch (err) {
    console.error("❌ getStockByWarehouse error:", err.message);
    return res.status(500).json({ message: "Failed to get stock" });
  }
};

/**
 * GET /api/inventory/movements?warehouseId=&productId=&type=&page=&limit=
 * Returns paginated movements list for admin.
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

    const [items, total] = await Promise.all([
      InventoryMovement.find(filter)
        .populate("warehouseId", "name location")
        .populate("productId", "name price sku")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      InventoryMovement.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    console.error("❌ listMovements error:", err.message);
    return res.status(500).json({ message: "Failed to fetch movements" });
  }
};

/* =========================
   Helpers (internal)
   ========================= */

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
