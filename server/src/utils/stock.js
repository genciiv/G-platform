import InventoryMovement from "../models/InventoryMovement.js";

/**
 * Kthen stokun real për një produkt në një magazinë (IN - OUT +/- ADJUST)
 */
export async function getStockForWarehouse({ warehouseId, productId }) {
  const rows = await InventoryMovement.aggregate([
    {
      $match: {
        warehouseId: warehouseId,
        productId: productId,
      },
    },
    {
      $group: {
        _id: null,
        inQty: {
          $sum: {
            $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0],
          },
        },
        outQty: {
          $sum: {
            $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0],
          },
        },
        adjQty: {
          $sum: {
            $cond: [{ $eq: ["$type", "ADJUST"] }, "$quantity", 0],
          },
        },
      },
    },
  ]);

  const s = rows?.[0];
  if (!s) return 0;

  // ADJUST: për momentin e trajtojmë si +quantity (më vonë mund ta bëjmë +/-)
  return (s.inQty || 0) - (s.outQty || 0) + (s.adjQty || 0);
}
