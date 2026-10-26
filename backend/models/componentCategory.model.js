import mongoose from "mongoose";

const componentCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true }, // "RAM", "Processor"
    img: { type: String, required: true }, // Common image for the category
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

componentCategorySchema.virtual("href").get(function () {
  return `/components/${this.title.replace(/\s+/g, "-")}`;
});

const ComponentCategory = mongoose.model(
  "ComponentCategory",
  componentCategorySchema
);

export default ComponentCategory;
