import { Router } from "express";
import { createWarehouse, listWarehouses } from "../controllers/warehouseController.js";

const router = Router();

router.get("/", listWarehouses);
router.post("/", createWarehouse);

export default router;
