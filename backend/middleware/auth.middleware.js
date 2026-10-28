import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Middleware to protect private routes.
 * Validates the JWT Bearer token and attaches the authenticated user to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header or cookie
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie) {
      // Manual cookie parsing if cookie-parser is not active
      const cookies = Object.fromEntries(
        req.headers.cookie
          .split(";")
          .map((c) => c.trim().split("="))
          .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))])
      );
      if (cookies.token) {
        token = cookies.token;
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid Bearer token.",
      });
    }

    // 2. Verify token
    const secret = process.env.JWT_SECRET || "fallback_ams_jwt_dev_secret_key_2026";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please log in again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please authenticate again.",
      });
    }

    // 3. Verify user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 4. Attach user to request context
    req.user = currentUser;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal authentication error.",
    });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Restricts access to users having one of the specified roles.
 * @param {...string} roles - e.g. 'admin', 'customer'
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action.",
      });
    }
    next();
  };
};

/**
 * Middleware to eliminate Broken Object Level Authorization (BOLA / IDOR).
 * Ensures a requester can only access or mutate their own account resources,
 * unless granted overarching admin privileges.
 * @param {string} paramKey - Key in req.params containing identifier (e.g., 'email', 'userId')
 */
export const verifyUserOwnership = (paramKey = "email") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Administrators bypass resource ownership constraints
    if (req.user.role === "admin") {
      return next();
    }

    const targetValue = req.params[paramKey];
    if (!targetValue) {
      return next();
    }

    if (paramKey === "email") {
      if (req.user.email.toLowerCase() !== targetValue.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to access or modify resources belonging to another user.",
        });
      }
    } else if (paramKey === "userId" || paramKey === "id") {
      if (req.user._id.toString() !== targetValue.toString()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to access or modify resources belonging to another user.",
        });
      }
    }

    next();
  };
};
