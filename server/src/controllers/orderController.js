import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import InventoryMovement from "../models/InventoryMovement.js";
import { getStockForWarehouse } from "../utils/stock.js";
import { makeOrderCode } from "../utils/orderCode.js";

function bad(res, message, code = 400) {
  return res.status(code).json({ message });
}

// POST /api/orders
export async function createOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { warehouseId, customer, items } = req.body;

    if (!warehouseId) return bad(res, "warehouseId is required");
    if (!customer?.fullName || !customer?.phone || !customer?.address) {
      return bad(
        res,
        "customer.fullName, customer.phone, customer.address are required"
      );
    }
    if (!Array.isArray(items) || items.length === 0)
      return bad(res, "items is required");

    const whId = new mongoose.Types.ObjectId(warehouseId);

    // Merr produktet nga DB (për çmim/sku snapshot + validim)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).session(session);

    if (dbProducts.length !== items.length) {
      return bad(res, "Some products are missing or inactive");
    }

    // Ndërto order items + kontrollo stokun për secilin
    const orderItems = [];
    let total = 0;

    for (const it of items) {
      const qty = Number(it.quantity);
      if (!it.productId || !qty || qty < 1)
        return bad(res, "Each item needs productId and quantity >= 1");

      const prod = dbProducts.find(
        (p) => String(p._id) === String(it.productId)
      );
      if (!prod) return bad(res, "Product not found in selection");

      // çmimi real që shet (nëse ka discountPrice)
      const price = prod.discountPrice ?? prod.price;

      // kontroll stok
      const stock = await getStockForWarehouse({
        warehouseId: whId,
        productId: prod._id,
        session,
      });

      if (stock < qty) {
        return bad(
          res,
          `Not enough stock for ${prod.name} (available ${stock}, requested ${qty})`
        );
      }

      orderItems.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        price,
        quantity: qty,
      });

      total += price * qty;
    }

    const orderCode = makeOrderCode("GA");

    // Krijo porosinë
    const [order] = await Order.create(
      [
        {
          orderCode,
          warehouseId: whId,
          customer: {
            fullName: customer.fullName,
            phone: customer.phone,
            address: customer.address,
            city: customer.city || "",
          },
          items: orderItems,
          total,
          paymentMethod: "COD",
          status: "NEW",
        },
      ],
      { session }
    );

    // Krijo OUT movements (dalje mall) të lidhura me porosinë
    const moves = orderItems.map((oi) => ({
      warehouseId: whId,
      productId: oi.productId,
      type: "OUT",
      quantity: oi.quantity,
      refType: "ORDER",
      refId: order._id,
      note: `Order ${order.orderCode}`,
    }));

    await InventoryMovement.insertMany(moves, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(order);
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: e.message });
  }
}

// PATCH /api/orders/:id/cancel
export async function cancelOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const order = await Order.findById(id).session(session);
    if (!order) return bad(res, "Order not found", 404);

    if (order.status === "CANCELLED")
      return bad(res, "Order already cancelled");
    if (order.status === "DELIVERED")
      return bad(res, "Delivered orders cannot be cancelled");

    // ndrysho status
    order.status = "CANCELLED";
    await order.save({ session });

    // rikthe stokun (IN) për çdo item
    const moves = order.items.map((oi) => ({
      warehouseId: order.warehouseId,
      productId: oi.productId,
      type: "IN",
      quantity: oi.quantity,
      refType: "ORDER",
      refId: order._id,
      note: `Cancel ${order.orderCode}`,
    }));

    await InventoryMovement.insertMany(moves, { session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ ok: true, orderId: order._id, status: order.status });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ message: e.message });
  }
}

// GET /api/orders/track/:orderCode
export async function trackOrder(req, res) {
  const { orderCode } = req.params;

  const order = await Order.findOne({
    orderCode: String(orderCode).toUpperCase(),
  })
    .select("orderCode status customer.fullName customer.city createdAt total")
    .lean();

  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json(order);
}

// GET /api/orders (për admin më vonë) – tani e lëmë të hapur
export async function listOrders(req, res) {
  const rows = await Order.find().sort({ createdAt: -1 }).limit(50).lean();

  res.json(rows);
}

export const adminListOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("warehouseId", "name")
      .limit(200);

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Shipped", "Delivered", "Canceled"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Order not found" });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update status" });
  }
};
