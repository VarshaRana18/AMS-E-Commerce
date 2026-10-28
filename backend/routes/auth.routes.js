import express from "express";
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public Authentication Endpoints (Guarded with Rate Limiting & Validation)
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/admin/login", authLimiter, validate(loginSchema), adminLogin);

// Protected User Profile Endpoints (Require Valid JWT)
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile); // Backwards-compatible alias
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

export default router;
