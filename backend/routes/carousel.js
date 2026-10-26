// In carousel.js route, remove any auth middleware if present
import express from "express";
import CarouselImage from "../models/CarouselImage.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const carouselImages = await CarouselImage.find().sort({ order: 1 });
    res.status(200).json(carouselImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
