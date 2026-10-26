import express from "express";
import { getComponentModel } from "../models/components.model.js";
import ComponentCategory from "../models/componentCategory.model.js";

const router = express.Router();

// GET all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await ComponentCategory.find();

    const formattedCategories = categories.map((category) => ({
      title: category.title,
      img: category.img,
      href: `/components/${category.title.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    res.json(formattedCategories);
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all components of a specific type
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params; // Example: "processors", "rams"
    const ComponentModel = getComponentModel(type); // Get the correct collection dynamically

    const components = await ComponentModel.find({}).lean(); //lean method to fetch the id, otherwise the id is not returned. Added by samiul
    res.json(components);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//GET the companies
router.get("/companies/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const ComponentModel = getComponentModel(type);
    const companies = await ComponentModel.distinct("company");

    res.json(companies);
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// GET the price range (min and max price) for a specific component type
router.get("/pricerange/:type", async (req, res) => {
  try {
    
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);

    const minPriceDoc = await ComponentModel.findOne().sort({ price: 1 }).select("price").lean();
    const maxPriceDoc = await ComponentModel.findOne().sort({ price: -1 }).select("price").lean();

    const minPrice = minPriceDoc?.price || 0;
    const maxPrice = maxPriceDoc?.price || 0;

    res.json({ minPrice, maxPrice });
  } catch (error) {
    console.error("❌ Error fetching price range:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// GET a specific component by ID within a category
router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const ComponentModel = getComponentModel(type); // Get the correct collection dynamically

    const component = await ComponentModel.findById(id).lean(); // Fetch the component by ID

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    res.json(component);
  } catch (error) {
    console.error("❌ Error fetching component:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;
