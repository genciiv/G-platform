// server/src/controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";

function genOrderCode() {
  // p.sh. G-20260108-482193
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `G-${y}${m}${day}-${rand}`;
}

// POST /api/orders
export async function createOrder(req, res) {
  const { customerName, phone, address, note, items } = req.body || {};

  if (!customerName || !phone || !address) {
    return res
      .status(400)
      .json({ message: "Name, phone and address are required" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart items are required" });
  }

  // Normalize items
  const normalized = items
    .map((it) => ({
      productId: it.productId || it._id || it.id,
      qty: Number(it.qty || 1),
    }))
    .filter((x) => x.productId && x.qty > 0);

  if (normalized.length === 0) {
    return res.status(400).json({ message: "Invalid items" });
  }

  // Fetch products to validate + get title/price
  const ids = normalized.map((x) => x.productId);
  const prods = await Product.find({ _id: { $in: ids } });

  const map = new Map(prods.map((p) => [String(p._id), p]));
  const orderItems = normalized
    .map((x) => {
      const p = map.get(String(x.productId));
      if (!p) return null;
      return {
        productId: p._id,
        title: p.title,
        price: Number(p.price || 0),
        qty: x.qty,
      };
    })
    .filter(Boolean);

  if (orderItems.length === 0) {
    return res.status(400).json({ message: "Products not found" });
  }

  const total = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);

  // generate unique code (retry few times)
  let orderCode = genOrderCode();
  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.findOne({ orderCode });
    if (!exists) break;
    orderCode = genOrderCode();
  }

  const doc = await Order.create({
    orderCode,
    customerName: String(customerName).trim(),
    phone: String(phone).trim(),
    address: String(address).trim(),
    note: note ? String(note).trim() : "",
    items: orderItems,
    total,
    status: "Pending",
  });

  res.status(201).json({ orderCode: doc.orderCode, order: doc });
}

// GET /api/orders/track/:orderCode
export async function trackOrder(req, res) {
  const { orderCode } = req.params;
  const doc = await Order.findOne({ orderCode: String(orderCode).trim() });
  if (!doc) return res.status(404).json({ message: "Order not found" });
  res.json({ order: doc });
}

// GET /api/orders (admin list)
export async function listOrders(req, res) {
  const docs = await Order.find().sort({ createdAt: -1 });
  res.json({ items: docs });
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const doc = await Order.findById(id);
  if (!doc) return res.status(404).json({ message: "Order not found" });

  doc.status = status;
  await doc.save();

  res.json({ order: doc });
}
