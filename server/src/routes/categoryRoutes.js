import { Router } from "express";
import { createCategory, listCategories } from "../controllers/categoryController.js";

const router = Router();

router.get("/", listCategories);
router.post("/", createCategory);

export default router;
