import express from "express";
import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  checkout,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyOrders);
router.post("/checkout", checkout);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

export default router;
