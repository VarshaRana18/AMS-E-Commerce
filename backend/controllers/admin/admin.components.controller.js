import { getComponentModel, Component } from "../../models/components.model.js";
import ComponentCategory from "../../models/componentCategory.model.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc    Get all categories
 * @route   GET /api/admin/components/categories
 * @access  Private (Admin)
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await ComponentCategory.find();
    const formattedCategories = categories.map((category) => ({
      title: category.title,
      img: category.img,
      href: `/components/${category.title.toLowerCase().replace(/\s+/g, "-")}`,
    }));
    return res.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc    Add component category
 * @route   POST /api/admin/components/categories
 * @access  Private (Admin)
 */
export const addCategories = async (req, res) => {
  try {
    const { title, image, presetFields } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: "Please provide all required fields" });
    }

    let imageUrl = image;
    // Upload image to Cloudinary if it looks like a base64 string or file path
    if (image.startsWith("data:") || image.startsWith("http://tmp")) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "component-categories",
      });
      imageUrl = result.secure_url;
    }

    const newCategory = new ComponentCategory({
      title,
      img: imageUrl,
      preset: presetFields || [],
    });

    await newCategory.save();
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error adding component category:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get components by collection/category type
 * @route   GET /api/admin/components/:type
 * @access  Private (Admin)
 */
export const getAdminComponents = async (req, res) => {
  try {
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);
    const components = await ComponentModel.find({}).lean();
    return res.json(components);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get single component by ID
 * @route   GET /api/admin/components/:type/:id
 * @access  Private (Admin)
 */
export const getAdminComponentById = async (req, res) => {
  try {
    const { type, id } = req.params;
    const ComponentModel = getComponentModel(type);
    const component = await ComponentModel.findById(id).lean();

    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }
    return res.json(component);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Add a component into inventory
 * @route   POST /api/admin/components
 * @access  Private (Admin)
 */
export const addComponent = async (req, res) => {
  try {
    const { title, company, type, price, quantity, coverImage, specifications, img } = req.body;

    if (!title || !company || !type || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: "Missing required fields for component" });
    }

    const ComponentModel = getComponentModel(type);
    const id = title.replace(/\s+/g, "-");

    const newComponent = new ComponentModel({
      _id: id,
      title,
      company,
      type,
      price: Number(price),
      quantity: Number(quantity),
      coverImage: coverImage || (img && img[0]) || "",
      specifications: specifications || [],
      img: img || [],
    });

    await newComponent.save();
    return res.status(201).json(newComponent);
  } catch (error) {
    console.error("Error adding component:", error);
    return res.status(500).json({ message: "Failed to add component", error: error.message });
  }
};

/**
 * @desc    Update component price
 * @route   PUT /api/admin/components/:type/:id/price
 * @access  Private (Admin)
 */
export const changePrice = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { price } = req.body;

    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ message: "Valid price is required" });
    }

    const ComponentModel = getComponentModel(type);
    const updated = await ComponentModel.findByIdAndUpdate(
      id,
      { price: Number(price) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Component not found" });
    }

    return res.json({ success: true, component: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete components by IDs
 * @route   DELETE /api/admin/components/:type/delete
 * @access  Private (Admin)
 */
export const deleteComponents = async (req, res) => {
  try {
    const { type } = req.params;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Array of component IDs is required" });
    }

    const ComponentModel = getComponentModel(type);
    await ComponentModel.deleteMany({ _id: { $in: ids } });

    return res.json({ success: true, message: "Components deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
