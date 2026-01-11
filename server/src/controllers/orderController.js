// server/src/controllers/orderController.js
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Warehouse from "../models/Warehouse.js";
import InventoryMovement from "../models/InventoryMovement.js";

function makeOrderCode() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `G-${yyyy}${mm}${dd}-${rand}`;
}

function normalizePhone(v = "") {
  return String(v)
    .trim()
    .replace(/\s+/g, "")
    .replace(/[()-]/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "");
}

/**
 * Gjej magazinën DEFAULT:
 * 1) active + code "WH-1" / "WH-01"
 * 2) name përmban "kryes" / "main" / "default"
 * 3) magazina e parë active (fallback)
 */
async function getDefaultWarehouse() {
  const byCode = await Warehouse.findOne({
    active: { $ne: false },
    code: { $in: ["WH-1", "WH-01", "WH1", "WH01"] },
  }).select("_id name code active");

  if (byCode) return byCode;

  const byName = await Warehouse.findOne({
    active: { $ne: false },
    name: { $regex: /(kryes|main|default)/i },
  }).select("_id name code active");

  if (byName) return byName;

  const first = await Warehouse.findOne({ active: { $ne: false } })
    .sort({ createdAt: 1 })
    .select("_id name code active");

  return first;
}

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

/**
 * ✅ HAPI 13: kur Order bëhet SHIPPED, bëj OUT në inventar në magazinë default
 * - kontrollo stokun për çdo item
 * - krijo InventoryMovement OUT për çdo item
 * - shëno order.inventoryDeducted = true
 */
async function deductStockForOrderIfNeeded(order, userId = null) {
  if (!order) throw new Error("Order missing");
  if (order.inventoryDeducted) return { ok: true, skipped: true };

  const wh = await getDefaultWarehouse();
  if (!wh) {
    const err = new Error(
      "No default warehouse found. Create a warehouse first."
    );
    err.statusCode = 400;
    throw err;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  if (items.length === 0) {
    const err = new Error("Order has no items.");
    err.statusCode = 400;
    throw err;
  }

  // 1) kontrollo stokun për të gjitha artikujt (para se të bësh OUT)
  for (const it of items) {
    const pid = it.productId?._id || it.productId;
    const need = Number(it.qty || 0);
    if (!mongoose.Types.ObjectId.isValid(pid) || need <= 0) continue;

    // eslint-disable-next-line no-await-in-loop
    const available = await getProductStockNumber(wh._id, pid);

    if (available < need) {
      const err = new Error(
        `Not enough stock for "${it.title}". Need: ${need}, Available: ${available} (Warehouse: ${wh.name})`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  // 2) krijo OUT movements
  for (const it of items) {
    const pid = it.productId?._id || it.productId;
    const need = Number(it.qty || 0);
    if (!mongoose.Types.ObjectId.isValid(pid) || need <= 0) continue;

    // eslint-disable-next-line no-await-in-loop
    await InventoryMovement.create({
      warehouseId: wh._id,
      productId: pid,
      type: "OUT",
      quantity: need,
      reason: "Order shipped",
      note: `Order ${order.orderCode}`,
      createdBy: userId || null,
    });
  }

  // 3) shëno që stok-u u zbrit
  order.inventoryDeducted = true;
  await order.save();

  return { ok: true, warehouse: wh };
}

/**
 * POST /api/orders
 * body:
 * { customerName, phone, address, note?, items: [{ productId, qty }] }
 */
export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, note, items } = req.body;

    if (!customerName || !String(customerName).trim())
      return res.status(400).json({ message: "customerName is required" });

    if (!phone || !String(phone).trim())
      return res.status(400).json({ message: "phone is required" });

    if (!address || !String(address).trim())
      return res.status(400).json({ message: "address is required" });

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "items are required" });

    const cleanItems = items
      .map((it) => ({ productId: it?.productId, qty: Number(it?.qty || 0) }))
      .filter(
        (it) => mongoose.Types.ObjectId.isValid(it.productId) && it.qty > 0
      );

    if (cleanItems.length === 0)
      return res.status(400).json({ message: "items invalid" });

    const productIds = cleanItems.map((x) => x.productId);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "title name price sku"
    );

    const pMap = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = cleanItems.map((it) => {
      const p = pMap.get(String(it.productId));
      const title = p?.title || p?.name || "Produkt";
      const price = Number(p?.price || 0);
      return { productId: it.productId, title, price, qty: it.qty };
    });

    const total = orderItems.reduce(
      (s, x) => s + Number(x.price || 0) * Number(x.qty || 0),
      0
    );

    let orderCode = makeOrderCode();
    for (let i = 0; i < 8; i++) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Order.findOne({ orderCode }).select("_id");
      if (!exists) break;
      orderCode = makeOrderCode();
    }

    const doc = await Order.create({
      orderCode,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      note: String(note || "").trim(),
      status: "Pending",
      total,
      items: orderItems,
      inventoryDeducted: false,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error("❌ createOrder error:", err);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

/**
 * GET /api/orders/track?code=...&phone=...
 * GET /api/orders/track/:orderCode?phone=...
 */
export const trackOrder = async (req, res) => {
  try {
    const orderCode = String(
      req.params.orderCode || req.query.code || ""
    ).trim();
    const phoneIn = String(req.query.phone || "").trim();

    if (!orderCode)
      return res.status(400).json({ message: "Order code is required" });
    if (!phoneIn) return res.status(400).json({ message: "Phone is required" });

    const order = await Order.findOne({ orderCode })
      .populate("items.productId", "title name price sku")
      .select("-__v");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ phone compare i sigurt (formatime +355 / 0 / spaces)
    if (normalizePhone(order.phone) !== normalizePhone(phoneIn)) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (err) {
    console.error("❌ trackOrder error:", err);
    return res.status(500).json({ message: "Failed to track order" });
  }
};

/**
 * ADMIN: GET /api/orders?q=
 */
export const listOrders = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const filter = {};

    if (q) {
      filter.$or = [
        { orderCode: new RegExp(q, "i") },
        { customerName: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
      ];
    }

    const items = await Order.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({ items });
  } catch (err) {
    console.error("❌ listOrders error:", err);
    return res.status(500).json({ message: "Failed to list orders" });
  }
};

/**
 * ADMIN: PATCH /api/orders/:id/status
 * body: { status }
 *
 * ✅ HAPI 13: nëse status bëhet "Shipped", zbret stokun (OUT) në magazinë default
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").trim();

    const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id).select("-__v");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // nëse po bëhet SHIPPED → deduktim stoku (vetëm 1 herë)
    if (status === "Shipped" && order.status !== "Shipped") {
      await deductStockForOrderIfNeeded(order, req.user?.id || null);
      order.shippedAt = order.shippedAt || new Date();
    }

    if (status === "Delivered") {
      order.deliveredAt = order.deliveredAt || new Date();
    }

    if (status === "Cancelled") {
      order.cancelledAt = order.cancelledAt || new Date();
    }

    order.status = status;
    await order.save();

    return res.json(order);
  } catch (err) {
    const code = err?.statusCode || 500;
    console.error("❌ updateOrderStatus error:", err);
    return res
      .status(code)
      .json({ message: err.message || "Failed to update status" });
  }
};
