import express from "express";
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/auth.validator.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public Authentication Endpoints (Guarded with Rate Limiting & Validation)
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/admin/login", authLimiter, validate(loginSchema), adminLogin);

// Email Verification Endpoints
router.get("/verify-email/:token", verifyEmail);
router.get("/verify-email", verifyEmail);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", authLimiter, validate(resendVerificationSchema), resendVerification);

// Protected User Profile Endpoints (Require Valid JWT)
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile); // Backwards-compatible alias
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

export default router;
