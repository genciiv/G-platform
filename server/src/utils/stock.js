import InventoryMovement from "../models/InventoryMovement.js";

/**
 * Stock real për produkt + magazinë (IN - OUT + ADJUST)
 * session është opsional (për transaksione)
 */
export async function getStockForWarehouse({ warehouseId, productId, session = null }) {
  const agg = InventoryMovement.aggregate([
    { $match: { warehouseId, productId } },
    {
      $group: {
        _id: null,
        inQty: { $sum: { $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0] } },
        outQty: { $sum: { $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0] } },
        adjQty: { $sum: { $cond: [{ $eq: ["$type", "ADJUST"] }, "$quantity", 0] } }
      }
    }
  ]);

  if (session) agg.session(session);

  const rows = await agg;
  const s = rows?.[0];
  if (!s) return 0;

  return (s.inQty || 0) - (s.outQty || 0) + (s.adjQty || 0);
}
