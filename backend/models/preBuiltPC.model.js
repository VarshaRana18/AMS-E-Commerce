import mongoose from "mongoose";

const PreBuiltPCSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
    coverImage: {
      type: String,
      required: true,
    },
    img: {
      type: [String], // Supports multiple images
      required: true,
    },
    type: {
      type: String,
      default: "prebuiltpcs",
      immutable: true, // Prevents modification after creation
    },
    motherboard: { name: { type: String, required: true } },
    processor: { name: { type: String, required: true } },
    graphicsCard: { name: { type: String, required: true } },
    ram: { name: { type: String, required: true } },
    storageDevice: { name: { type: String, required: true } },
    powerSupply: { name: { type: String, required: true } },
    coolingSystem: { name: { type: String, required: true } },
    cabinet: { name: { type: String, required: true } },
  },
  { timestamps: true }
);

const PreBuiltPC = mongoose.model("PreBuiltPC", PreBuiltPCSchema);
export default PreBuiltPC;
