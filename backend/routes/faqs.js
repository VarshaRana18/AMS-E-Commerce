import express from "express";
import FAQ from "../models/FAQ.js";

const router = express.Router();

// GET all FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find({});
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
