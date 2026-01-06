import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true }, // unik
    barcode: { type: String, trim: true }, // opsionale
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },

    description: { type: String, default: "" },
    images: [{ url: String, publicId: String }], // më vonë Cloudinary

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ categoryId: 1 });

export default mongoose.model("Product", productSchema);
