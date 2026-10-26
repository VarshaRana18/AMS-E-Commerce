const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const PreBuiltPCController = require("../controllers/PreBuiltPCController");
const OwnCustomPCController = require("../controllers/ownCustomPCController");

router.get(
  "/pre-built-pcs",
  authenticateToken,
  PreBuiltPCController.getAllPreBuiltPC
);
router.post(
  "/pre-built-pcs/",
  authenticateToken,
  PreBuiltPCController.addPreBuiltPC
);
router.delete(
  "/pre-built-pcs/delete",
  authenticateToken,
  PreBuiltPCController.deletePreBuiltPC
);
router.get(
  "/pre-built-pcs/:id",
  authenticateToken,
  PreBuiltPCController.getPreBuiltPC
);
router.post(
  "/pre-built-pcs/:id/images",
  authenticateToken,
  PreBuiltPCController.addImages
);
router.delete(
  "/pre-built-pcs/:id/images",
  authenticateToken,
  PreBuiltPCController.deleteImage
);
router.put(
  "/pre-built-pcs/:id/cover",
  authenticateToken,
  PreBuiltPCController.updateCoverImage
);
router.put(
  "/pre-built-pcs/:id/price",
  authenticateToken,
  PreBuiltPCController.updatePrice
);

router.get(
  "/own-custom-pcs",
  authenticateToken,
  OwnCustomPCController.getOwnCustomPC
);
router.put(
  "/own-custom-pcs/:orderId/status",
  authenticateToken,
  OwnCustomPCController.updateOwnCustomPCStatus
);
router.put(
  "/own-custom-pcs/:orderId/charge",
  authenticateToken,
  OwnCustomPCController.updateOwnCustomPCCharge
);
router.put(
  "/own-custom-pcs/:orderId/charge",
  authenticateToken,
  OwnCustomPCController.updateOwnCustomPCCharge
);

module.exports = router;
