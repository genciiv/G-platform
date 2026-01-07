import { Router } from "express";
import {
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouseController.js";

const router = Router();

router.get("/", listWarehouses);
router.post("/", createWarehouse);
router.patch("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;
