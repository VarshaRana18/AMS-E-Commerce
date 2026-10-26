const { getComponentModel } = require("../models/components.model.js");
const ComponentCategory = require("../models/componentCategory.model.js");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getCategories = async (req, res) => {
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
};

exports.addCategories = async (req, res) => {
  const { title, image, presetFields } = req.body;

  if (!title || !image) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "component-categories",
    });

    const newCategory = new ComponentCategory({
      title,
      img: result.secure_url,
      preset: presetFields || [], // Store as array
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding component category:", error);

    // Handle duplicate key error (unique title)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Category with this name already exists" });
    }

    res.status(500).json({ error: "Failed to add component category" });
  }
};

exports.deleteCategories = async (req, res) => {
  const { titles } = req.body;

  if (!titles || !Array.isArray(titles)) {
    return res.status(400).json({ error: "Please provide an array of titles" });
  }

  try {
    for (const title of titles) {
      const type = String(title).toLowerCase().replace(/\s+/g, "-");
      const ComponentModel = getComponentModel(type);

      if (!ComponentModel) {
        return res.status(400).json({ message: "Invalid component type" });
      }

      const count = await ComponentModel.countDocuments();
      const isEmpty = count === 0;

      if (!isEmpty) {
        return res.status(400).json({
          message:
            "Cannot delete category with existing components of its type",
        });
      }

      await ComponentModel.collection.drop();
      console.log(`Collection "${type}" dropped successfully`);

      await ComponentCategory.deleteOne({ title: String(title) });
      console.log(`Category "${type}" deleted successfully`);
    }

    return res.status(200).json({ message: "Categories deleted successfully" });
  } catch (error) {
    console.error("Error deleting categories:", error);
    return res.status(500).json({ error: "Failed to delete categories" });
  }
};

exports.getComponents = async (req, res) => {
  try {
    const { type } = req.params; // Example: "processors", "rams"

    const ComponentModel = getComponentModel(type);
    if (!ComponentModel) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    const components = await ComponentModel.find({}).lean(); //lean method to fetch the id, otherwise the id is not returned. Added by samiul
    res.json(components);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.addComponent = async (req, res) => {
  const { type, coverImage, ...componentData } = req.body;
  const lowercaseType = type.toLowerCase().replace(/\s+/g, "-");
  componentData.type = lowercaseType;

  try {
    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(coverImage, {
      folder: "components",
    });

    // Set the Cloudinary URL
    componentData.coverImage = result.secure_url;

    const ComponentModel = getComponentModel(lowercaseType);
    const newComponent = new ComponentModel(componentData);
    await newComponent.save();

    res.status(201).json(newComponent);
  } catch (error) {
    console.error("Error saving component:", error);
    res.status(500).json({ error: "Failed to save component" });
  }
};

exports.getComponent = async (req, res) => {
  const { type, id } = req.params;
  const lowercaseType = type.toLowerCase().replace(/\s+/g, "-");

  try {
    const ComponentModel = getComponentModel(lowercaseType);
    const component = await ComponentModel.findById(id);
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// In your controllers file (e.g., controllers/componentsController.js)
exports.deleteComponents = async (req, res) => {
  const { type } = req.params;
  const { ids } = req.body;

  try {
    const ComponentModel = getComponentModel(type);
    if (!ComponentModel) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    // Delete the selected components
    await ComponentModel.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Components deleted successfully" });
  } catch (error) {
    console.error("Error deleting components:", error);
    res.status(500).json({ error: "Failed to delete components" });
  }
};

exports.addImage = async (req, res) => {
  const { type, id } = req.params;
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    // Find the component by ID
    const component = await ComponentModel.findById(id);

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: `components/${type}/${id}`,
    });

    // Add the new image URL to the img array
    component.img.push(result.secure_url);

    // Save the updated component
    await component.save();

    res.status(200).json({
      message: "Image added successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error adding image:", error);
    res.status(500).json({ error: "Failed to add image" });
  }
};

exports.deleteImages = async (req, res) => {
  const { type, id } = req.params;
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "Images array is required" });
  }
  try {
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    // Find the component by ID
    const component = await ComponentModel.findById(id);

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    // Delete images from Cloudinary
    for (const imageUrl of images) {
      try {
        // First, check if this is a Cloudinary URL
        if (!imageUrl.includes("cloudinary.com")) {
          console.log(`Skipping non-Cloudinary URL: ${imageUrl}`);
          continue;
        }
        // Split the URL by '/'
        const urlParts = imageUrl.split("/");

        // Find the index of 'upload' in the URL parts
        const uploadIndex = urlParts.findIndex((part) => part === "upload");

        if (uploadIndex === -1) {
          console.log(`Could not find 'upload' in URL: ${imageUrl}`);
          continue;
        }
        let publicIdParts = urlParts.slice(uploadIndex + 1);

        // If the first part starts with 'v' and the rest is numbers, it's a version number
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
          publicIdParts = publicIdParts.slice(1);
        }

        // Remove file extension from the last part
        const lastPartIndex = publicIdParts.length - 1;
        if (lastPartIndex >= 0) {
          const lastPart = publicIdParts[lastPartIndex];
          const dotIndex = lastPart.lastIndexOf(".");
          if (dotIndex !== -1) {
            publicIdParts[lastPartIndex] = lastPart.substring(0, dotIndex);
          }
        }

        // Join all parts to form the public ID
        const publicId = publicIdParts.join("/");

        // console.log(`Extracted public ID: ${publicId}`);

        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        // console.log(`Deleted image from Cloudinary: ${publicId}`, result);
      } catch (cloudinaryError) {
        console.error(
          `Error deleting image from Cloudinary: ${imageUrl}`,
          cloudinaryError
        );
      }
    }

    // Filter out the images to be deleted from the component
    component.img = component.img.filter((imgUrl) => !images.includes(imgUrl));

    // Save the updated component
    await component.save();

    res.status(200).json({
      message: "Images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting images:", error);
    res.status(500).json({ error: "Failed to delete images" });
  }
};

exports.changeCoverImage = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { coverImage } = req.body;

    if (!type || !id || !coverImage) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (type, id, or coverImage)",
      });
    }

    // Get the appropriate model based on component type
    const ComponentModel = getComponentModel(type);

    // Update the cover image
    const updatedComponent = await ComponentModel.findByIdAndUpdate(
      id,
      { $set: { coverImage: coverImage } },
      { new: true }
    );

    if (!updatedComponent) {
      return res.status(404).json({
        success: false,
        error: "Component not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cover image updated successfully",
      data: updatedComponent,
    });
  } catch (error) {
    console.error("Error updating cover image:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.changePrice = async (req, res) => {
  const { type, id } = req.params;
  const { price } = req.body;

  try {
    const ComponentModel = getComponentModel(type);

    const component = await ComponentModel.findByIdAndUpdate(
      { _id: id, type },
      { price },
      { new: true }
    );
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }

    res.status(200).json({ message: "Price updated successfully", component });
  } catch (error) {
    console.error("Error changing price:", error);
    res.status(500).json({ error: "Failed to change price" });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const { type } = req.params;

    const ComponentModel = getComponentModel(type);
    const companies = await ComponentModel.distinct("company");

    res.json(companies);
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getPriceRange = async (req, res) => {
  try {
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);

    const minPriceDoc = await ComponentModel.findOne()
      .sort({ price: 1 })
      .select("price")
      .lean();
    const maxPriceDoc = await ComponentModel.findOne()
      .sort({ price: -1 })
      .select("price")
      .lean();

    const minPrice = minPriceDoc?.price || 0;
    const maxPrice = maxPriceDoc?.price || 0;

    res.json({ minPrice, maxPrice });
  } catch (error) {
    console.error("❌ Error fetching price range:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getPresetByCategory = async (req, res) => {
  try {
    const category = await ComponentCategory.findOne(
      { title: req.params.category },
      "preset"
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Convert preset array to the format expected by frontend
    const specifications = category.preset.map((item) => ({
      label: item,
      value: "",
      basicInfo: false,
    }));

    res.json({ specifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.savePreset = async (req, res) => {
  try {
    const { specifications } = req.body;

    // Convert frontend format to our preset format
    const preset = specifications.map((spec) => spec.label);

    const category = await ComponentCategory.findOneAndUpdate(
      { title: req.params.category },
      { preset },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Preset saved successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateCategoryImage = async (req, res) => {
  const { categoryName } = req.params;
  const { newImage } = req.body;

  try {
    const category = await ComponentCategory.findOne({ title: categoryName });
    if (!category) {
      return res
        .status(404)
        .json({ message: `${categoryName} Category not found` });
    }

    const oldImage = category.img;

    // Delete old image from Cloudinary if it exists and is from Cloudinary
    if (oldImage && oldImage.includes("cloudinary.com")) {
      try {
        const urlParts = oldImage.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");

        if (uploadIndex !== -1) {
          let publicIdParts = urlParts.slice(uploadIndex + 1);

          // Remove version if present
          if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
          }

          // Remove file extension
          const lastPartIndex = publicIdParts.length - 1;
          if (lastPartIndex >= 0) {
            const lastPart = publicIdParts[lastPartIndex];
            const dotIndex = lastPart.lastIndexOf(".");
            if (dotIndex !== -1) {
              publicIdParts[lastPartIndex] = lastPart.substring(0, dotIndex);
            }
          }

          const publicId = publicIdParts.join("/");
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudinaryError) {
        console.error(
          `Error deleting old image from Cloudinary: ${oldImage}`,
          cloudinaryError
        );
      }
    }
    // Upload new image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(newImage, {
      folder: "component-categories",
    });

    // Update database with new image URL
    const updatedCategory = await ComponentCategory.findOneAndUpdate(
      { title: categoryName },
      { img: uploadResult.secure_url },
      { new: true }
    );

    res.status(200).json({
      message: "Image updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error in updateCategoryImage:", error);
    res.status(500).json({ message: "Error updating category image" });
  }
};
