const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

const carouselController = require("../controllers/carouselController");
const authenticateToken = require("../middleware/authenticateToken");

require("dotenv").config();

router.get("/", authenticateToken, carouselController.getCarouselImages);
router.post(
  "/",
  upload.single("imageFile"),
  authenticateToken,
  carouselController.uploadCarouselImage
);
router.delete(
  "/delete",
  authenticateToken,
  carouselController.deleteCarouselImages
);

module.exports = router;
