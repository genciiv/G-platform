// server/src/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },

    customerName: { type: String, required: true, trim: true },

    // ruaj si e shkruan useri
    phone: { type: String, required: true, trim: true },

    // ruaj vetëm shifrat (për kërkim të sigurt)
    phoneNormalized: { type: String, trim: true, index: true, default: "" },

    address: { type: String, required: true, trim: true },
    note: { type: String, trim: true, default: "" },

    items: { type: [orderItemSchema], default: [] },

    total: { type: Number, required: true, min: 0, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
