import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import componentRoutes from "./routes/componentRoutes.js";
import preBuiltPCRoute from "./routes/preBuiltPCRoute.js";
import customPCRoute from "./routes/customPCRoute.js";
import fileUpload from "express-fileupload";
import cors from "cors";
import carouselRoutes from "./routes/carousel.js";
import repairRoutes from "./routes/repairs.js";
import FAQsRoutes from "./routes/faqs.js";
console.log("Environment Variables:", {
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI ? "exists" : "missing",
  VERCEL: process.env.VERCEL ? "true" : "false"
});
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (keep existing)
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// CORS Configuration (keep existing)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ams-react.vercel.app",
    "https://ams-react-git-main-your-github-username.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Add health check endpoint (new)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Routes (keep existing)
app.use("/api/auth", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/pre-built-pcs", preBuiltPCRoute);
app.use("/api/custom-pc", customPCRoute);
app.use("/api/carousel", carouselRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/faqs", FAQsRoutes);

// Keep existing root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error handling middleware (new)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Modified server startup (preserves existing behavior)
const startServer = async () => {
  try {
    await connectDB();
    
    if (process.env.VERCEL_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

await startServer();

// Export for Vercel (new)
export default app;