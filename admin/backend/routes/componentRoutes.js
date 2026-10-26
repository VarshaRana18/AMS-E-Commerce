const express = require("express");
const router = express.Router();

require("dotenv").config();

const componentController = require("../controllers/componentsController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/categories", authenticateToken, componentController.getCategories);
router.post(
  "/categories",
  authenticateToken,
  componentController.addCategories
);
router.delete(
  "/categories/delete",
  authenticateToken,
  componentController.deleteCategories
);
router.put(
  "/categories/:categoryName/image",
  authenticateToken,
  componentController.updateCategoryImage
);

// Get preset for a specific category
router.get(
  "/presets/:category",
  authenticateToken,
  componentController.getPresetByCategory
);

// Save a preset for a category
router.post(
  "/presets/:category",
  authenticateToken,
  componentController.savePreset
);

//Filtering For Filter in Product-Page
router.get(
  "/companies/:type",
  authenticateToken,
  componentController.getCompanies
);

router.get(
  "/pricerange/:type",
  authenticateToken,
  componentController.getPriceRange
);

//Products
router.get("/:type", authenticateToken, componentController.getComponents);
router.get("/:type/:id", authenticateToken, componentController.getComponent);

router.post("/", authenticateToken, componentController.addComponent);
router.delete(
  "/:type/delete",
  authenticateToken,
  componentController.deleteComponents
);

//add image in the album of component
router.post(
  "/:type/:id/image",
  authenticateToken,
  componentController.addImage
);
// delete images from the album of component
router.delete(
  "/:type/:id/images",
  authenticateToken,
  componentController.deleteImages
);
// Choose Cover Image
router.put(
  "/:type/:id/cover",
  authenticateToken,
  componentController.changeCoverImage
);

//Price Change
router.put(
  "/:type/:id/price",
  authenticateToken,
  componentController.changePrice
);

module.exports = router;
