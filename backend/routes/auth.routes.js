import express from "express";
import {
  register,
  login,
  adminLogin,
  getMe,
  googleAuth,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.post("/google", googleAuth);

// Protected routes (require valid JWT)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

export default router;
