import express from "express";
import {
  getMyOrders,
  getOrderById,
  cancelOrder,
  checkout,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  checkoutSchema,
  orderIdParamSchema,
} from "../validators/order.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyOrders);
router.post("/checkout", validate(checkoutSchema), checkout);
router.get("/:id", validate(orderIdParamSchema, "params"), getOrderById);
router.patch("/:id/cancel", validate(orderIdParamSchema, "params"), cancelOrder);

export default router;
