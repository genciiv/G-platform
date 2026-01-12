import { Router } from "express";
import {
  createOrder,
  trackOrder,
  listOrders,
  updateOrderStatus,
  myOrders,
} from "../controllers/orderController.js";

import { userOptional, userRequired } from "../middleware/userAuth.js";

const router = Router();

// ✅ kur krijon porosi, nëse je i loguar -> lidhet me userId
router.post("/", userOptional, createOrder);

// TRACK
router.get("/track", trackOrder);
router.get("/track/:orderCode", trackOrder);

// ✅ USER: porositë e mia
router.get("/my", userRequired, myOrders);

// admin
router.get("/", listOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
