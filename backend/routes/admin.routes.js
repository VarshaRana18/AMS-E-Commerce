import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

// Import Admin Controllers
import {
  getAdminOrders,
  getOrderPriceRange,
  getUnseenOrderCounts,
  markOrdersSeen,
  getAdminOrderDetails,
  updateOrderStatus,
  updateOrderTracking,
  updateOrderCourier,
} from "../controllers/admin/admin.orders.controller.js";

import {
  getAdminRepairRequests,
  getRepairSteps,
  saveRepairSteps,
  updateRepairStatus,
  updateRepairCharge,
  getRepairPriceRange,
  getUnseenRepairCounts,
  markRepairsSeen,
} from "../controllers/admin/admin.repairs.controller.js";

import {
  getAdminUsers,
  getAdminUserById,
  updateUserRole,
} from "../controllers/admin/admin.users.controller.js";

import {
  getCategories,
  addCategories,
  getAdminComponents,
  getAdminComponentById,
  addComponent,
  changePrice,
  deleteComponents,
} from "../controllers/admin/admin.components.controller.js";

import {
  getAdminCarouselImages,
  uploadCarouselImage,
  deleteCarouselImage,
} from "../controllers/admin/admin.carousel.controller.js";

const router = express.Router();

// Enforce authentication & admin role guard across all admin sub-routes
router.use(protect);
router.use(restrictTo("admin"));

// ─── ORDERS ─────────────────────────────────────────────────────────
router.get("/orders", getAdminOrders);
router.get("/orders/pricerange", getOrderPriceRange);
router.get("/orders/unseen-count", getUnseenOrderCounts);
router.post("/orders/mark-seen", markOrdersSeen);
router.get("/orders/:id/details", getAdminOrderDetails);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/tracking_number", updateOrderTracking);
router.put("/orders/:id/courier", updateOrderCourier);

// ─── REPAIRS ────────────────────────────────────────────────────────
router.get("/repairs/requests", getAdminRepairRequests);
router.get("/repairs/requests/pricerange", getRepairPriceRange);
router.get("/repairs/requests/unseen-count", getUnseenRepairCounts);
router.post("/repairs/requests/mark-seen", markRepairsSeen);
router.put("/repairs/requests/:_id/status", updateRepairStatus);
router.put("/repairs/requests/:_id/charge", updateRepairCharge);
router.get("/repairs/steps", getRepairSteps);
router.post("/repairs/steps", saveRepairSteps);

// ─── USERS ──────────────────────────────────────────────────────────
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.patch("/users/:id/role", updateUserRole);

// ─── COMPONENTS & INVENTORY ─────────────────────────────────────────
router.get("/components/categories", getCategories);
router.post("/components/categories", addCategories);
router.get("/components/:type", getAdminComponents);
router.get("/components/:type/:id", getAdminComponentById);
router.post("/components", addComponent);
router.put("/components/:type/:id/price", changePrice);
router.delete("/components/:type/delete", deleteComponents);

// ─── CAROUSEL ───────────────────────────────────────────────────────
router.get("/carousel", getAdminCarouselImages);
router.post("/carousel", uploadCarouselImage);
router.delete("/carousel/:id", deleteCarouselImage);

export default router;
