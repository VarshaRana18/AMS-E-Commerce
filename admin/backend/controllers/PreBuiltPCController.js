const PreBuiltPC = require("../models/preBuiltPC.model.js");
const { getComponentModel } = require("../models/components.model.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getAllPreBuiltPC = async (req, res) => {
  try {
    const preBuiltPCs = await PreBuiltPC.find().lean();
    res.json(preBuiltPCs);
  } catch (error) {
    console.error("Error fetching pre-built PCs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getPreBuiltPC = async (req, res) => {
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
};

exports.addPreBuiltPC = async (req, res) => {
  try {
    // Extract form data from the request body
    const {
      name,
      price,
      coverImage,
      img = [],
      motherboard,
      processor,
      graphicsCard,
      ram,
      storage,
      powerSupply,
      coolingSystem,
      case: cabinet,
    } = req.body;

    // Validate required fields
    if (!name || !price || !coverImage) {
      return res.status(400).json({
        message: "Name, price, and coverImage are required fields",
      });
    }

    // Generate a new ID first
    const newId = new mongoose.Types.ObjectId().toString();

    // Upload cover image to Cloudinary
    const coverImageResult = await cloudinary.uploader.upload(coverImage, {
      folder: `pre-built-pcs/${newId}/cover`, // Use the newId here
      resource_type: "image",
    });

    // Upload additional images to Cloudinary
    const uploadedImages = [];
    for (const image of img) {
      const result = await cloudinary.uploader.upload(image, {
        folder: `pre-built-pcs/${newId}/gallery`, // Use the same newId
        resource_type: "image",
      });
      uploadedImages.push(result.secure_url);
    }

    // Include the cover image in the images array if you want
    uploadedImages.push(coverImageResult.secure_url);

    // Define component types and their respective names
    const componentsToValidate = [
      { type: "motherboard", name: motherboard },
      { type: "processor", name: processor },
      { type: "graphics-card", name: graphicsCard },
      { type: "ram", name: ram },
      { type: "storage-device", name: storage },
      { type: "power-supply", name: powerSupply },
      { type: "cooling-system", name: coolingSystem },
      { type: "cabinet", name: cabinet },
    ];

    // Validate each component dynamically
    for (const component of componentsToValidate) {
      const model = getComponentModel(component.type);
      if (!model) {
        return res.status(400).json({
          message: `Invalid component type: ${component.type}`,
        });
      }

      if (component.name) {
        const componentExists = await model.findOne({ _id: component.name });
        if (!componentExists) {
          return res.status(400).json({
            message: `This ${component.type} does not exist`,
          });
        }
      }
    }

    const newPreBuiltPC = new PreBuiltPC({
      _id: newId, // Use the same ID we generated earlier
      name,
      price: parseFloat(price),
      coverImage: coverImageResult.secure_url,
      img: uploadedImages,
      motherboard: { name: motherboard },
      processor: { name: processor },
      graphicsCard: { name: graphicsCard },
      ram: { name: ram },
      storageDevice: { name: storage },
      powerSupply: { name: powerSupply },
      coolingSystem: { name: coolingSystem },
      cabinet: { name: cabinet },
    });

    await newPreBuiltPC.save();

    res.status(201).json({
      message: "Pre-built PC added successfully",
      data: newPreBuiltPC,
    });
  } catch (error) {
    console.error("❌ Error adding Pre-Built PC:", error);

    if (error.name === "CloudinaryError") {
      return res.status(400).json({
        message: "Image upload failed",
        details: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A PC with this name already exists",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
exports.deletePreBuiltPC = async (req, res) => {
  try {
    const { ids } = req.body; // Extract the array of IDs from the request body

    // Validate if IDs are provided
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid IDs provided for deletion." });
    }

    // Delete the pre-built PCs with the provided IDs
    const deleteResult = await PreBuiltPC.deleteMany({ _id: { $in: ids } });

    // Check if any documents were deleted
    if (deleteResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No pre-built PCs found for deletion." });
    }

    // Return success response
    res.status(200).json({
      message: "Pre-built PCs deleted successfully.",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting pre-built PCs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.addImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: `pre-built-pcs/${id}/img`,
    });

    // Update the PreBuiltPC document with Cloudinary URL
    const updatedPC = await PreBuiltPC.findByIdAndUpdate(
      id,
      { $push: { img: result.secure_url } },
      { new: true }
    );

    if (!updatedPC) {
      // If the PC wasn't found, delete the uploaded image from Cloudinary
      try {
        await cloudinary.uploader.destroy(result.public_id);
      } catch (cloudinaryError) {
        console.error("Error cleaning up Cloudinary image:", cloudinaryError);
      }
      return res.status(404).json({ error: "Pre-built PC not found" });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      public_id: result.public_id, // Useful for future deletion
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Handle Cloudinary-specific errors
    if (error.name === "CloudinaryError") {
      return res.status(400).json({
        error: "Image upload failed",
        details: error.message,
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCoverImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverImage } = req.body;

    if (!id || !coverImage) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (id or coverImage)",
      });
    }

    const updatedPC = await PreBuiltPC.findByIdAndUpdate(
      id,
      { $set: { coverImage } },
      { new: true }
    );

    if (!updatedPC) {
      return res.status(404).json({
        success: false,
        error: "PreBuiltPC not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cover image updated successfully",
      data: updatedPC,
    });
  } catch (error) {
    console.error("Error updating cover image:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Find the pre-built PC
    const preBuiltPC = await PreBuiltPC.findById(id);
    if (!preBuiltPC) {
      return res.status(404).json({ message: "Pre-built PC not found" });
    }

    if (!preBuiltPC.img || preBuiltPC.img.length <= 1) {
      return res.status(400).json({ message: "Cannot delete the last image" });
    }

    const updatedImages = preBuiltPC.img.filter((img) => img !== imageUrl);

    let updates = { img: updatedImages };
    if (preBuiltPC.coverImage === imageUrl) {
      updates.coverImage = updatedImages[0];
    }

    await PreBuiltPC.findByIdAndUpdate(id, updates);

    const urlParts = imageUrl.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];

    let folderPath = "";
    if (urlParts.length > 7) {
      const uploadIndex = urlParts.findIndex((part) => part === "upload");
      if (uploadIndex !== -1 && uploadIndex < urlParts.length - 2) {
        folderPath =
          urlParts.slice(uploadIndex + 1, urlParts.length - 1).join("/") + "/";
      }
    }

    const fullPublicId = folderPath + publicId;

    await cloudinary.uploader.destroy(fullPublicId);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // Validate price
    if (price === undefined || price === null) {
      return res.status(400).json({ message: "Price is required" });
    }

    // Ensure price is a number
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a valid positive number" });
    }

    // Find the pre-built PC
    const preBuiltPC = await PreBuiltPC.findById(id);
    if (!preBuiltPC) {
      return res.status(404).json({ message: "Pre-built PC not found" });
    }

    // Update the price
    preBuiltPC.price = numericPrice;
    await preBuiltPC.save();

    // Return success response
    res.status(200).json({
      message: "Price updated successfully",
      price: numericPrice,
    });
  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
