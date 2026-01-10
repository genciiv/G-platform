import { Router } from "express";
import {
  createOrder,
  trackOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

router.post("/", createOrder);

// TRACK - prano query style
router.get("/track", trackOrder);

// TRACK - prano param style
router.get("/track/:orderCode", trackOrder);

// admin
router.get("/", listOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
