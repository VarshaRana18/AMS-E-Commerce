const mongoose = require("mongoose");
const { Schema } = mongoose;

const RequestSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the Customer
    ref: "User",
    required: true,
  },
  component_name: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  totalCharge: {
    type: String,
    required: true,
  },
  request_date: {
    type: Date,
    default: Date.now,
  },
  seen: { type: Boolean, default: false },
});

module.exports = mongoose.model("Request", RequestSchema);
