const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const ordersController = require("../controllers/ordersController");

router.get("/", authenticateToken, ordersController.getOrders);
router.get("/:id/details", authenticateToken, ordersController.getOrderDetails);
router.get("/pricerange", authenticateToken, ordersController.getPriceRange);

router.put("/:id/status", authenticateToken, ordersController.updateStatus);
router.put(
  "/:id/tracking_number",
  authenticateToken,
  ordersController.updateTrackingNumber
);
router.put("/:id/courier", authenticateToken, ordersController.updateCourier);

//Count Unseen requests
router.get(
  "/unseen-count",
  authenticateToken,
  ordersController.getUnseenCounts
);

router.post("/mark-seen", authenticateToken, ordersController.markSeen);

module.exports = router;
