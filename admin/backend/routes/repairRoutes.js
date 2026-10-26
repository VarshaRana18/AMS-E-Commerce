const express = require("express");
const router = express.Router();
const repairController = require("../controllers/repairController");
const authenticateToken = require("../middleware/authenticateToken");

// Fetch all repair steps
router.get("/steps", authenticateToken, repairController.getRepairSteps);

// Save or update repair steps
router.post("/steps", authenticateToken, repairController.saveRepairSteps);

// Fetch all repair requests
router.get("/requests", authenticateToken, repairController.getRepairRequests);

// Update repair request status
router.put(
  "/requests/:_id/status",
  authenticateToken,
  repairController.updateRepairStatus
);

// Update repair request charge
router.put(
  "/requests/:_id/charge",
  authenticateToken,
  repairController.updateRepairCharge
);

//Filtering
router.get(
  "/requests/pricerange",
  authenticateToken,
  repairController.getPriceRange
);

//Count Unseen requests
router.get(
  "/requests/unseen-count",
  authenticateToken,
  repairController.getUnseenCounts
);

router.post(
  "/requests/mark-seen",
  authenticateToken,
  repairController.markSeen
);

module.exports = router;
