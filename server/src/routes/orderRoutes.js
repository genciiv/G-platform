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

// track me query
router.get("/track", trackOrder);
// track me param
router.get("/track/:orderCode", trackOrder);

// admin list + update status
router.get("/", listOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
