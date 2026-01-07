import { Router } from "express";
import { login, logout, me, adminSeed } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

// opsionale (vetëm lokalisht): krijon admin nga env
router.post("/seed-admin", adminSeed);

export default router;
