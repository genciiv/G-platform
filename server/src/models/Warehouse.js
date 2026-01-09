import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    location: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// UNIQUE per code (s'lejon dy magazina me te njejtin kod)
warehouseSchema.index({ code: 1 }, { unique: true });

export default mongoose.model("Warehouse", warehouseSchema);
