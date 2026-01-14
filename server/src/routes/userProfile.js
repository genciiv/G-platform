// server/src/routes/userProfile.js
import { Router } from "express";
import { requireAuth, requireUser } from "../middleware/auth.js";
import {
  getMe,
  updateMe,
  updateAddresses,
} from "../controllers/userProfileController.js";

const router = Router();

// Profile
router.get("/me", requireAuth, requireUser, getMe);
router.put("/me", requireAuth, requireUser, updateMe);

// Addresses
router.put("/me/addresses", requireAuth, requireUser, updateAddresses);

export default router;
