const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./auth");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true, // Allow cookies
  })
);

app.use("/api", authRoutes); // Use the routes

const PORT = process.env.PORT || 5170;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
