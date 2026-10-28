import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded reliably whether running from project root or backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });

import { connectDB } from "./config/db.js";

// Production Infrastructure & Security Middleware
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { AppError } from "./utils/appError.js";

// Legacy and Public Routes
import authRoutes from "./routes/auth.js";
import componentRoutes from "./routes/componentRoutes.js";
import preBuiltPCRoute from "./routes/preBuiltPCRoute.js";
import customPCRoute from "./routes/customPCRoute.js";
import carouselRoutes from "./routes/carousel.js";
import repairRoutes from "./routes/repairs.js";
import FAQsRoutes from "./routes/faqs.js";

// Modern Secure REST Resource Routes (Protected / RBAC)
import authUserRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const getClusterHost = (uri) => {
  if (!uri) return "missing";
  const match = uri.match(/@([^/?]+)/);
  return match ? match[1] : "configured";
};

console.log("Environment Variables:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  DB_NAME: process.env.DB_NAME || "(default from URI)",
  CLUSTER_HOST: getClusterHost(process.env.MONGO_URI),
  JWT_SECRET: process.env.JWT_SECRET ? "configured" : "missing",
  VERCEL: process.env.VERCEL ? "true" : "false",
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin asset loading for local images/Vite dev
    crossOriginEmbedderPolicy: false,
  })
);

// High-Precision Request Timing & Logging
app.use(requestLogger);

// Rate Limiting for all API routes
app.use("/api", apiLimiter);

// Body & File Parsing
app.use(express.json({ limit: "10mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://ams-react.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "x-idempotency-key"],
    exposedHeaders: ["X-Total-Count", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
    credentials: true,
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Modern REST Endpoints
app.use("/api/auth", authUserRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/admin", adminRoutes);

// Legacy Route Compatibility Layer
app.use("/api/auth", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/pre-built-pcs", preBuiltPCRoute);
app.use("/api/custom-pc", customPCRoute);
app.use("/api/carousel", carouselRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/faqs", FAQsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("AMS E-Commerce Backend is operational.");
});

// 404 Handler for Unmatched Routes
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl} on this server`, 404));
});

// Centralized Global Error Handler
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();

    if (process.env.VERCEL_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`🚀 Unified API Server running locally on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

await startServer();

export default app;
