const cloudinary = require("cloudinary").v2;
const CarouselImage = require("../models/CarouselImage");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({});
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadCarouselImage = async (req, res) => {
  try {
    const imageFile = req.file;
    const order = parseInt(req.body.order);
    const imageName = req.body.imageName;

    if (!imageFile) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const base64Image = imageFile.buffer.toString("base64");
    const dataURI = `data:${imageFile.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary with folder structure
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "carousel",
      public_id: imageName.split(".")[0],
      resource_type: "auto",
    });

    // Store the secure_url directly from the upload result
    const carouselImage = new CarouselImage({
      order: order,
      imageLink: uploadResult.secure_url,
      imageName: imageName,
    });

    await carouselImage.save();

    res.status(200).json({
      message: "Image uploaded successfully",
      imageData: carouselImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Failed to upload image", error: error.message });
  }
};

exports.deleteCarouselImages = async (req, res) => {
  try {
    const { ids } = req.body;

    // Get images data from MongoDB before deletion
    const imagesToDelete = await CarouselImage.find({ _id: { $in: ids } });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Delete from Cloudinary first
    for (const image of imagesToDelete) {
      const publicId = `carousel/${image.imageName.split(".")[0]}`;
      const cloudinaryResult = await cloudinary.uploader.destroy(publicId);

      if (cloudinaryResult.result !== "ok") {
        throw new Error(`Failed to delete image ${publicId} from Cloudinary`);
      }
    }

    // Delete from MongoDB after successful Cloudinary deletion
    await CarouselImage.deleteMany({ _id: { $in: ids } });

    // Get remaining images and update their order
    const remainingImages = await CarouselImage.find().sort({ order: 1 });

    // Update orders sequentially
    for (let i = 0; i < remainingImages.length; i++) {
      await CarouselImage.findByIdAndUpdate(
        remainingImages[i]._id,
        { order: i + 1 },
        { new: true, runValidators: false }
      );
    }

    res.status(200).json({
      message: "Images deleted successfully from both Cloudinary and database",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete images", error: error.message });
  }
};
