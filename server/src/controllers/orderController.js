import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Helper për orderCode
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
 * POST /api/orders
 * body: { customerName, phone, address, note?, items:[{productId, qty}] }
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

    // unik code
    let orderCode = makeOrderCode();
    for (let i = 0; i < 8; i++) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await Order.findOne({ orderCode }).select("_id");
      if (!exists) break;
      orderCode = makeOrderCode();
    }

    // ✅ lidh userin nëse është i loguar
    const userId = req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)
      ? req.user.id
      : null;

    const doc = await Order.create({
      orderCode,
      userId,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      note: String(note || "").trim(),
      status: "Pending",
      total,
      items: orderItems,
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
 * ✅ USER: GET /api/orders/my
 */
export const myOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({ items });
  } catch (err) {
    console.error("❌ myOrders error:", err);
    return res.status(500).json({ message: "Failed to load orders" });
  }
};

/**
 * ADMIN: GET /api/orders
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
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").trim();

    const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updated) return res.status(404).json({ message: "Order not found" });
    return res.json(updated);
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};
