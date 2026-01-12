// server/src/routes/orderRoutes.js
import { Router } from "express";
import {
  createOrder,
  trackOrder,
  listOrders,
  updateOrderStatus,
  myOrders,
} from "../controllers/orderController.js";

import { optionalUser, requireUser } from "../middleware/userAuth.js";

const router = Router();

// ✅ create order (nëse user është i loguar, ruaj userId)
router.post("/", optionalUser, createOrder);

// TRACK (public)
router.get("/track", trackOrder);
router.get("/track/:orderCode", trackOrder);

// ✅ user orders (duhet login)
router.get("/my", requireUser, myOrders);

// admin
router.get("/", listOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
