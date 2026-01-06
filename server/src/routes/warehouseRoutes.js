import { Router } from "express";
import { listWarehouses } from "../controllers/warehouseController.js";

const router = Router();

router.get("/", listWarehouses);

export default router;
