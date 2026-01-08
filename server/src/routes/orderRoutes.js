// server/src/routes/orderRoutes.js
import { Router } from "express";
import {
  createOrder,
  trackOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

router.post("/", createOrder);
router.get("/track/:orderCode", trackOrder);

// admin
router.get("/", listOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
