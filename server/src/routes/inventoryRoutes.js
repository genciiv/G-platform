import { Router } from "express";
import { addMovement, getStock } from "../controllers/inventoryController.js";

const router = Router();

router.post("/movements", addMovement);
router.get("/stock", getStock);

export default router;
