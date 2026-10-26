import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrderSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  //includes PC components as well as Pre-Built PC orders.
  components: [
    {
      component_id: {
        type: String,
        required: true,
      },
      component_type: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  order_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    // enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
  },
  total_price: {
    type: Number,
    required: true,
  },
  seen: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    required: true
  },
  tracking_number: {
    type: String,
    required: true,
    default: "Not Shipped Yet"
  },
  courier: {
    type: String,
    required: true,
    default: "Not Shipped Yet"  
  }
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
