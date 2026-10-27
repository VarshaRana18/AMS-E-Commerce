import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Critical: Prevents password hash from being returned in queries
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "admin"],
        message: "{VALUE} is not a valid role",
      },
      default: "customer",
    },
    mobile: {
      type: String,
      trim: true,
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
    timestamps: true, //Automatically adds two fields to your user documents: createdAt and updatedAt.
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) { 
        delete ret.password;
        return ret;
      },
    },//In an Express.js API, when you do res.json(user), Express automatically calls .toJSON() on the Mongoose document.
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    //toJSON and toObject : These properties configure how a Mongoose document behaves when it is converted into a standard JavaScript object using .toJSON() or .toObject().
    //transform is a lifecycle hook that runs right before the conversion is finalized.
  }
);

// Virtual for total items count in cart
userSchema.virtual("totalCartItems").get(function () {
  return this.cart ? this.cart.reduce((total, item) => total + item.quantity, 0) : 0;
});

// Pre-save hook: Hash password automatically before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method: Verify candidate password against hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
