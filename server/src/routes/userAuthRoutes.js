// server/src/routes/userAuthRoutes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  meUser,
  logoutUser,
} from "../controllers/userAuthController.js";

const router = Router();

// /api/userauth/register
router.post("/register", registerUser);

// /api/userauth/login
router.post("/login", loginUser);

// /api/userauth/me
router.get("/me", meUser);

// /api/userauth/logout
router.post("/logout", logoutUser);

export default router;
