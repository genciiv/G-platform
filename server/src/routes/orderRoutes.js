import { Router } from "express";
import { createOrder, cancelOrder, trackOrder, listOrders } from "../controllers/orderController.js";

const router = Router();

router.get("/", listOrders);
router.get("/track/:orderCode", trackOrder);
router.post("/", createOrder);
router.patch("/:id/cancel", cancelOrder);

export default router;
