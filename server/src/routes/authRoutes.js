import { Router } from "express";
import { adminSeed, login, logout, me } from "../controllers/authController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/seed-admin", adminSeed); // ✅ krijon/ndryshon admin nga .env
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, requireAdmin, me);

export default router;
