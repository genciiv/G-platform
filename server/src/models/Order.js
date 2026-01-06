import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot emri
    sku: { type: String, required: true },  // snapshot sku
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, trim: true, uppercase: true }, // p.sh. GA-000123
    status: {
      type: String,
      enum: ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "NEW",
    },

    // për multi-magazina: nga cila magazinë do dalë stoku
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },

    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, default: "", trim: true },
    },

    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
  },
  { timestamps: true }
);

orderSchema.index({ orderCode: 1 }, { unique: true });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
