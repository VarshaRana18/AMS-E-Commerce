import mongoose from "mongoose";

const { Schema } = mongoose;

const CarouselSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    unique: true,
  },
  imageLink: {
    type: String,
    required: true,
  },
  imageName: {
    type: String,
    required: true,
  },
});

const CarouselImage = mongoose.model("CarouselImage", CarouselSchema);
export default CarouselImage;
