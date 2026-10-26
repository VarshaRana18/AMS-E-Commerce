import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "https://www.svgrepo.com/show/452030/avatar-default.svg",
    },
    cart: [
      {
        _id: { type: String, required: true },
        type: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    wishlist: [
      {
        _id: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],

    addresses: [
      {
        name: String,
        phoneNumber: String,
        pincode: String,
        flat: String,
        area: String,
        landmark: String,
        city: String,
        state: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("totalCartItems").get(function () {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
});

const User = mongoose.model("User", userSchema);
export default User;
