// server/src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },

    // ✅ multiple image urls
    images: { type: [String], default: [] },

    // ✅ category relation
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });

export default mongoose.model("Product", productSchema);
