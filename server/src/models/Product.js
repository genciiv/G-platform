// server/src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },

    price: { type: Number, required: true, min: 0, default: 0 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { unique: false });
productSchema.index({ title: "text", sku: "text" });

export default mongoose.model("Product", productSchema);
