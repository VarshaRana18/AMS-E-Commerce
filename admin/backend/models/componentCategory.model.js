const mongoose = require("mongoose");
const { Schema } = mongoose;

const componentCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true }, // "RAM", "Processor"
    img: { type: String, required: true },
    preset: [
      {
        type: String,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

componentCategorySchema.virtual("href").get(function () {
  return `/components/${this.title.toLowerCase().replace(/\s+/g, "-")}`;
});

const ComponentCategory = mongoose.model(
  "ComponentCategory",
  componentCategorySchema
);

module.exports = ComponentCategory;
