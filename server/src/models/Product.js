import mongoose from "mongoose";

const specSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    price: { type: Number, required: true },
    active: { type: Boolean, default: true },

    // ✅ kategori
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // ✅ fotot (URL)
    images: [{ type: String, trim: true }],

    // ✅ detaje dinamike
    specs: [specSchema],

    // ✅ sasia ne stok (e thjeshte)
    stockQty: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
