import express from "express";
import {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All cart operations strictly require JWT authentication
router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart)
  .put(updateCartQuantity)
  .delete(removeFromCart);

export default router;
