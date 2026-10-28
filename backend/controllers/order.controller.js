import mongoose from "mongoose";
import Order from "../models/orders.js";
import User from "../models/user.model.js";
import OwnCustomPC from "../models/ownCustomPC.model.js";
import PreBuiltPC from "../models/preBuiltPC.model.js";
import { getComponentModel } from "../models/components.model.js";

// Helper: Resolve the proper Mongoose model for a given component type
export const resolveComponentModel = (type) => {
  if (!type) return null;
  const normalized = type.toLowerCase().trim();
  if (normalized === "owncustompcs") return OwnCustomPC;
  if (normalized === "prebuiltpcs" || normalized === "pre-built-pcs") return PreBuiltPC;
  return getComponentModel(normalized);
};

// Helper: Generate random 12-character alphanumeric order ID
const generateOrderId = async (session = null) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const query = Order.findById(orderId);
    if (session) query.session(session);
    const existing = await query;
    if (!existing) isUnique = true;
  }
  return orderId;
};

/**
 * @desc    Get all orders for the authenticated user
 * @route   GET /api/orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ order_date: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching orders" });
  }
};

/**
 * @desc    Get single order details by ID (with ownership validation)
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check (BOLA prevention)
    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to view this order",
      });
    }

    // Resolve address details
    let addressDetails = null;
    if (order.address) {
      const orderUser = await User.findOne(
        { "addresses._id": order.address },
        { "addresses.$": 1 }
      );
      addressDetails = orderUser?.addresses?.[0] || null;
    }

    // Resolve component details dynamically
    const componentDetails = await Promise.all(
      order.components.map(async (comp) => {
        try {
          if (comp.component_type === "owncustompcs") {
            const customPC = await OwnCustomPC.findById(comp.component_id).lean();
            return customPC ? { ...customPC, quantity: comp.quantity } : null;
          }
          const Model = resolveComponentModel(comp.component_type);
          if (!Model) return null;
          const componentData = await Model.findById(comp.component_id).lean();
          return componentData ? { ...componentData, quantity: comp.quantity } : null;
        } catch (err) {
          console.error(`Error resolving component detail (${comp.component_type}/${comp.component_id}):`, err);
          return null;
        }
      })
    );

    const response = {
      ...order,
      component_details: componentDetails.filter(Boolean),
      address_details: addressDetails,
    };

    return res.status(200).json({ success: true, order: response });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching order details" });
  }
};

/**
 * @desc    Place a new order with ACID Transaction, Atomic Stock Deduction & Idempotency
 * @route   POST /api/orders/checkout
 * @access  Private
 */
export const checkout = async (req, res) => {
  const { components, address, total_price } = req.body;
  const idempotencyKey =
    req.headers["idempotency-key"] ||
    req.headers["x-idempotency-key"] ||
    req.body.idempotency_key;

  // 1. Idempotency Check: Return existing order if key was already submitted
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotency_key: idempotencyKey }).lean();
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        is_duplicate: true,
        message: "Order already processed (Idempotent response)",
        order: existingOrder,
      });
    }
  }

  // 2. Initial Request Validations
  if (!Array.isArray(components) || components.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order components array is required and cannot be empty",
    });
  }

  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required",
    });
  }

  // 3. Initiate MongoDB Client Session for ACID Transaction
  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      // Step A: Validate user exists
      const user = await User.findById(req.user._id).session(session);
      if (!user) {
        const error = new Error("Authenticated user record not found");
        error.statusCode = 404;
        throw error;
      }

      let calculatedTotalPrice = 0;
      const validatedComponents = [];

      // Step B: Atomic Precondition Inventory Deductions ($inc + { quantity: { $gte: qty } })
      for (const item of components) {
        const { component_id, component_type, quantity } = item;
        const orderQty = Number(quantity);

        if (!component_id || !component_type || isNaN(orderQty) || orderQty <= 0) {
          const error = new Error("Invalid component or quantity specified in checkout");
          error.statusCode = 400;
          throw error;
        }

        const Model = resolveComponentModel(component_type);
        if (!Model) {
          const error = new Error(`Unsupported component collection type: "${component_type}"`);
          error.statusCode = 400;
          throw error;
        }

        if (component_type.toLowerCase() === "owncustompcs") {
          // Process custom configured PC: verify and deduct each constituent part
          const customPC = await OwnCustomPC.findById(component_id).session(session);
          if (!customPC) {
            const error = new Error(`Custom PC configuration "${component_id}" not found`);
            error.statusCode = 404;
            throw error;
          }

          let customPCTotal = 0;
          for (const subComp of customPC.components) {
            const SubModel = resolveComponentModel(subComp.type);
            if (SubModel) {
              const deductedPart = await SubModel.findOneAndUpdate(
                { _id: subComp._id, quantity: { $gte: orderQty } },
                { $inc: { quantity: -orderQty } },
                { new: true, session }
              );

              if (!deductedPart) {
                const currentDoc = await SubModel.findById(subComp._id).session(session);
                const available = currentDoc ? (currentDoc.quantity || 0) : 0;
                const error = new Error(
                  `Insufficient stock for custom PC part "${currentDoc?.title || subComp._id}". Available: ${available}, Required: ${orderQty}`
                );
                error.statusCode = 409;
                throw error;
              }

              customPCTotal += (deductedPart.price || subComp.price || 0) * orderQty;
            }
          }

          calculatedTotalPrice += customPCTotal;
          validatedComponents.push({
            component_id,
            component_type,
            quantity: orderQty,
          });
        } else {
          // Standard Component or PreBuiltPC: Atomic conditional decrement
          const deductedComponent = await Model.findOneAndUpdate(
            { _id: component_id, quantity: { $gte: orderQty } },
            { $inc: { quantity: -orderQty } },
            { new: true, session }
          );

          if (!deductedComponent) {
            const currentDoc = await Model.findById(component_id).session(session);
            const available = currentDoc ? (currentDoc.quantity !== undefined ? currentDoc.quantity : 0) : 0;
            const title = currentDoc ? currentDoc.title : component_id;
            const error = new Error(
              `Insufficient stock for "${title}". Available: ${available}, Requested: ${orderQty}`
            );
            error.statusCode = 409;
            throw error;
          }

          calculatedTotalPrice += (deductedComponent.price || 0) * orderQty;
          validatedComponents.push({
            component_id,
            component_type,
            quantity: orderQty,
          });
        }
      }

      // Step C: Generate unique order identifier
      const orderId = await generateOrderId(session);

      // Step D: Create Order within the transaction
      const orderDoc = new Order({
        _id: orderId,
        user_id: user._id,
        components: validatedComponents,
        status: "Pending",
        total_price: calculatedTotalPrice > 0 ? calculatedTotalPrice : (total_price || 0),
        address,
        idempotency_key: idempotencyKey || undefined,
      });

      await orderDoc.save({ session });

      // Step E: Atomically clear the user's cart in the same transaction
      await User.findByIdAndUpdate(
        user._id,
        { $set: { cart: [] } },
        { session }
      );

      createdOrder = orderDoc;
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully with ACID transaction guarantee",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Transactional checkout failed:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process checkout transaction",
    });
  } finally {
    await session.endSession();
  }
};

/**
 * @desc    Cancel an order with ACID Transaction & Symmetric Inventory Replenishment
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();

  try {
    let cancelledOrder;

    await session.withTransaction(async () => {
      // Step A: Fetch order within transaction snapshot
      const order = await Order.findById(id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      // Step B: Ownership verification (BOLA defense)
      if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        const error = new Error("Forbidden: You are not authorized to cancel this order");
        error.statusCode = 403;
        throw error;
      }

      // Step C: Validate order status transition
      if (order.status === "Cancelled") {
        const error = new Error("Order is already cancelled");
        error.statusCode = 400;
        throw error;
      }

      if (["Shipped", "Delivered"].includes(order.status)) {
        const error = new Error(`Cannot cancel order that has already been ${order.status.toLowerCase()}`);
        error.statusCode = 400;
        throw error;
      }

      // Step D: Symmetric Stock Replenishment ($inc: { quantity: +qty })
      for (const comp of order.components) {
        const Model = resolveComponentModel(comp.component_type);
        if (Model) {
          if (comp.component_type.toLowerCase() === "owncustompcs") {
            const customPC = await OwnCustomPC.findById(comp.component_id).session(session);
            if (customPC?.components) {
              for (const subComp of customPC.components) {
                const SubModel = resolveComponentModel(subComp.type);
                if (SubModel) {
                  await SubModel.findByIdAndUpdate(
                    subComp._id,
                    { $inc: { quantity: comp.quantity } },
                    { session }
                  );
                }
              }
            }
          } else {
            await Model.findByIdAndUpdate(
              comp.component_id,
              { $inc: { quantity: comp.quantity } },
              { session }
            );
          }
        }
      }

      // Step E: Update status to Cancelled
      order.status = "Cancelled";
      await order.save({ session });
      cancelledOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully and inventory replenished",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Cancel order transaction error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error cancelling order",
    });
  } finally {
    await session.endSession();
  }
};
