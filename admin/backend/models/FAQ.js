const mongoose = require("mongoose");
const { Schema } = mongoose;

const FAQsSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    unique: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("FAQ", FAQsSchema);
