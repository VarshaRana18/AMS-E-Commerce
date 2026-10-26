import express from "express";
// import Request from "../models/Request.js";
import RepairStep from "../models/RepairStep.js";

const router = express.Router();

router.get("/steps", async (req, res) => {
  try {
    const repairSteps = await RepairStep.find().sort({ order: 1 }); // Sort by order
    res.status(200).json(repairSteps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
