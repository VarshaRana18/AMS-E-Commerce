import CarouselImage from "../../models/CarouselImage.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @desc    Get all carousel images
 * @route   GET /api/admin/carousel
 * @access  Private (Admin)
 */
export const getAdminCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({}).sort({ order: 1 });
    return res.status(200).json(images);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Upload carousel image
 * @route   POST /api/admin/carousel
 * @access  Private (Admin)
 */
export const uploadCarouselImage = async (req, res) => {
  try {
    const { image, order, imageName } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    let imageUrl = image;
    if (image.startsWith("data:") || image.startsWith("http://tmp")) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "carousel",
      });
      imageUrl = uploadResult.secure_url;
    }

    const carouselImage = new CarouselImage({
      order: Number(order) || 1,
      imageLink: imageUrl,
      imageName: imageName || "Carousel Image",
    });

    await carouselImage.save();

    return res.status(201).json({
      message: "Image uploaded successfully",
      imageData: carouselImage,
    });
  } catch (error) {
    console.error("Upload carousel error:", error);
    return res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};

/**
 * @desc    Delete carousel image
 * @route   DELETE /api/admin/carousel/:id
 * @access  Private (Admin)
 */
export const deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CarouselImage.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Carousel image not found" });
    }

    return res.json({ success: true, message: "Carousel image deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
