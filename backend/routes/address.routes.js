import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getAddresses)
  .post(addAddress);

router.route("/:addressId")
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
