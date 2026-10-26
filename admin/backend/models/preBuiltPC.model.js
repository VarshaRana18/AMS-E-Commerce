const mongoose = require("mongoose");
const { Schema } = mongoose;

const PreBuiltPCSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  coverImage: {
    type: String,
    required: true,
  },
  img: {
    type: [String], // Supports multiple images
    required: true,
  },

  motherboard: {
    name: { type: String, required: true },
  },
  processor: {
    name: { type: String, required: true },
  },
  graphicsCard: {
    name: { type: String, required: true },
  },
  ram: {
    name: { type: String, required: true },
  },
  storageDevice: {
    name: { type: String, required: true },
  },
  powerSupply: {
    name: { type: String, required: true },
  },
  coolingSystem: {
    name: { type: String, required: true },
  },
  cabinet: {
    name: { type: String, required: true },
  },
});

const PreBuiltPC = mongoose.model("PreBuiltPC", PreBuiltPCSchema);
module.exports = PreBuiltPC;
