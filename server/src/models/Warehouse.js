import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // p.sh. "Magazine Fier"
    code: { type: String, required: true, trim: true, uppercase: true }, // p.sh. "FR"
    address: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

warehouseSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Warehouse", warehouseSchema);
