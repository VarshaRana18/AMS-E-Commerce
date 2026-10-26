const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepairStepsSchema = new mongoose.Schema({
  step_number: {
    type: Number,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("RepairStep", RepairStepsSchema);
