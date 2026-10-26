import mongoose from "mongoose";
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

const FAQ = mongoose.model("FAQ", FAQsSchema);
export default FAQ;
