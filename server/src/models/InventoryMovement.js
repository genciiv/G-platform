import mongoose from "mongoose";

const inventoryMovementSchema = new mongoose.Schema(
  {
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    type: { type: String, enum: ["IN", "OUT", "ADJUST"], required: true },
    quantity: { type: Number, required: true, min: 1 },

    // për të lidhur me porosi ose faturë furnizimi në të ardhmen
    refType: { type: String, enum: ["ORDER", "PURCHASE", "MANUAL"], default: "MANUAL" },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

inventoryMovementSchema.index({ warehouseId: 1, productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model("InventoryMovement", inventoryMovementSchema);
