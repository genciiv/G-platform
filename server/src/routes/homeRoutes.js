import express from "express";
import { getHome } from "../controllers/homeController.js";

const router = express.Router();

// GET /api/home
router.get("/", getHome);

export default router;
