import express from "express";
import PreBuiltPC from "../models/preBuiltPC.model.js";
import { getComponentModel } from "../models/components.model.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const preBuiltPCs = await PreBuiltPC.find().lean();

    res.json(preBuiltPCs);
  } catch (error) {
    console.error("Error fetching pre-built PCs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the Pre-Built PC by ID
    const preBuiltPC = await PreBuiltPC.findById(id);
    if (!preBuiltPC) {
      console.log("❌ Pre-Built PC not found");
      return res.status(404).json({ message: "Pre-Built PC not found" });
    }

    // Extract component names
    const {
      motherboard,
      processor,
      graphicsCard,
      ram,
      storageDevice,
      powerSupply,
      coolingSystem,
      cabinet,
    } = preBuiltPC;

    // Function to fetch component details dynamically
    const fetchComponent = async (componentName, collectionName) => {
      if (!componentName || !componentName.name) {
        console.log(
          `⚠️ ${collectionName} name is missing in Pre-Built PC:`,
          componentName
        );
        return null;
      }

      const model = getComponentModel(collectionName);
      return await model.findOne({ _id: componentName.name }).lean();
    };

    // Fetch all components
    const [
      fetchedMotherboard,
      fetchedProcessor,
      fetchedGraphicsCard,
      fetchedRAM,
      fetchedStorageDevice,
      fetchedPowerSupply,
      fetchedCoolingSystem,
      fetchedCabinet,
    ] = await Promise.all([
      fetchComponent(motherboard, "motherboard"),
      fetchComponent(processor, "processor"),
      fetchComponent(graphicsCard, "graphics-card"),
      fetchComponent(ram, "ram"),
      fetchComponent(storageDevice, "storage-device"),
      fetchComponent(powerSupply, "power-supply"),
      fetchComponent(coolingSystem, "cooling-system"),
      fetchComponent(cabinet, "cabinet"),
    ]);

    // Send response with all component details
    res.json({
      ...preBuiltPC.toObject(),
      motherboard: fetchedMotherboard,
      processor: fetchedProcessor,
      graphicsCard: fetchedGraphicsCard,
      ram: fetchedRAM,
      storageDevice: fetchedStorageDevice,
      powerSupply: fetchedPowerSupply,
      coolingSystem: fetchedCoolingSystem,
      cabinet: fetchedCabinet,
    });
  } catch (error) {
    console.error("❌ Error fetching Pre-Built PC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
