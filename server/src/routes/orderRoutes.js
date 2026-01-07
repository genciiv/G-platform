import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  createOrder,
  cancelOrder,
  trackOrder,
  listOrders,
  adminListOrders,
  adminUpdateStatus,
} from "../controllers/orderController.js";

const router = Router();

// public/customer
router.get("/track/:orderCode", trackOrder);
router.post("/", createOrder);
router.patch("/:id/cancel", cancelOrder);

// admin
router.get("/", requireAuth, requireAdmin, adminListOrders);
router.patch("/:id/status", requireAuth, requireAdmin, adminUpdateStatus);

export default router;
