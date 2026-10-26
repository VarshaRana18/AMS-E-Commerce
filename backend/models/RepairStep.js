import mongoose from "mongoose";
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

const RepairStep = mongoose.model("RepairStep", RepairStepsSchema);
export default RepairStep;
