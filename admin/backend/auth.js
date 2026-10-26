const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
require("dotenv").config();
const router = express.Router();

const authenticateToken = require("./middleware/authenticateToken");

const carouselRoutes = require("./routes/carouselRoutes");
const repairRoutes = require("./routes/repairRoutes");
const faqsRoutes = require("./routes/faqsRoutes");
const componentRoutes = require("./routes/componentRoutes");
const customPCRoutes = require("./routes/customPCRoutes");
const orderRoutes = require("./routes/ordersRoutes");

router.use("/carousel", carouselRoutes);
router.use("/repairs", repairRoutes);
router.use("/faqs", faqsRoutes);
router.use("/components", componentRoutes);
router.use("/customs", customPCRoutes);
router.use("/orders", orderRoutes);

const { ObjectId } = require("mongodb");

// temporary
const User = require("./models/User.js");
const { getComponentModel } = require("./models/components.model.js");
//

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key_";
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const hashedPassword = bcrypt.hashSync(adminPassword, 10);

// Login route
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (
    username !== adminUsername ||
    !bcrypt.compareSync(password, hashedPassword)
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Generate JWT Token
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "8h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Set to true in production (HTTPS)
    sameSite: "Strict",
  });

  res.json({ token, message: "Login Successful" });
});

// Session route
router.get("/session", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ username: decoded.username });
  } catch {
    res.status(401).json({ message: "Invalid Token" });
  }
});

// Fetch users
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    // console.log(user);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
