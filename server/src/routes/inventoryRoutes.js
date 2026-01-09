// server/src/routes/inventoryRoutes.js
import express from "express";
import {
  createMovement,
  getStockByWarehouse,
  listMovements,
} from "../controllers/inventoryController.js";

const router = express.Router();

// client bën POST /api/inventory/move
router.post("/move", createMovement);

// client bën GET /api/inventory/stock?warehouseId=...
router.get("/stock", getStockByWarehouse);
// nëse do edhe param-style:
router.get("/stock/:warehouseId", getStockByWarehouse);

// client bën GET /api/inventory/movements?warehouseId=...
router.get("/movements", listMovements);

export default router;
