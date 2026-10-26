const mongoose = require("mongoose");
const { Schema } = mongoose;

const OwnCustomPCSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    default: "Custom PC",
    immutable: true, // Prevents modification after creation
  },
  type: {
    type: String,
    default: "custompcs",
    immutable: true, // Prevents modification after creation
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  components: [
    {
      component_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      component_type: {
        type: String,
        required: true,
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
  },
  total_price: {
    type: Number,
    required: true,
  },
});

const OwnCustomPC = mongoose.model("OwnCustomPC", OwnCustomPCSchema);

module.exports = OwnCustomPC;
