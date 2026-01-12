// server/src/routes/userAuthRoutes.js
import { Router } from "express";
import { registerUser, loginUser, meUser, logoutUser } from "../controllers/userAuthController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", meUser);
router.post("/logout", logoutUser);

export default router;
