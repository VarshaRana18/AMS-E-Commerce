import mongoose from "mongoose";
const { Schema } = mongoose;

const RequestSchema = new mongoose.Schema({
  _id: {
    type: String, 
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference the Customer
    ref: "User", // Reference the Customer model
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
    default: "Pending"
  },
  request_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  totalCharge: {
    type: String,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false
  }
  // timestamps: true,
});

const Request = mongoose.model("Request", RequestSchema);
export default Request;
