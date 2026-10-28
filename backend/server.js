import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether running from project root or backend directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { connectDB } from "./config/db.js";

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

console.log("Environment Variables:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  DB_NAME: process.env.DB_NAME || "(default from URI)",
  MONGO_URI: process.env.MONGO_URI ? "configured" : "missing",
  JWT_SECRET: process.env.JWT_SECRET ? "configured" : "missing",
  VERCEL: process.env.VERCEL ? "true" : "false",
});

const app = express();
const PORT = process.env.PORT || 5000;

// Body & File Parsing
app.use(express.json());
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
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request Logger
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
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

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

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
