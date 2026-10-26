const mongoose = require("mongoose");
const { Schema } = mongoose;

const componentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    specifications: [
      {
        title: {
          type: String,
          required: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed, // Can be string or number
          required: true,
        },
        isBasicInfo: {
          type: Boolean,
          required: true,
        },
      },
    ],
    img: {
      type: [String], // Supports multiple images
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0, // Ensures stock is not negative
    },
  },
  { _id: false }
);

componentSchema.virtual("href").get(function () {
  return `/components/${this.title.toLowerCase().replace(/\s+/g, "-")}`;
});

componentSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = this.title.replace(/\s+/g, "-"); // Preserve original casing
  }
  next();
});

const Component = mongoose.model("Component", componentSchema);

/**
 * Function to create a collection dynamically based on the component type
 */
const getComponentModel = (collectionName) => {
  return mongoose.model(collectionName, componentSchema, collectionName);
};

module.exports = { Component, getComponentModel };
