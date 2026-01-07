import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createMovement,
  getStockByWarehouse,
} from "../controllers/inventoryController.js";

const router = Router();

// admin
router.get(
  "/stock/:warehouseId",
  requireAuth,
  requireAdmin,
  getStockByWarehouse
);
router.post("/movements", requireAuth, requireAdmin, createMovement);

export default router;
