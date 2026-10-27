import express from "express";
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Authentication Endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);

// Protected User Profile Endpoints (Require Valid JWT)
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile); // Backwards-compatible alias
router.put("/profile", protect, updateProfile);

export default router;
