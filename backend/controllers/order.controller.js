import Order from "../models/orders.js";
import User from "../models/user.model.js";
import OwnCustomPC from "../models/ownCustomPC.model.js";
import { getComponentModel } from "../models/components.model.js";

// Helper: Generate random 12-character alphanumeric order ID
const generateOrderId = async () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const existing = await Order.findById(orderId);
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
          const ComponentModel = getComponentModel(comp.component_type);
          const componentData = await ComponentModel.findById(comp.component_id).lean();
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
 * @desc    Cancel an order (with ownership validation)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check (BOLA prevention)
    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to cancel this order",
      });
    }

    // Validate that order is in a cancellable state
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order is already cancelled" });
    }
    if (["Shipped", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order that has already been ${order.status.toLowerCase()}`,
      });
    }

    order.status = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ success: false, message: "Server error cancelling order" });
  }
};

/**
 * @desc    Place a new order (Checkout)
 * @route   POST /api/orders/checkout
 * @access  Private
 */
export const checkout = async (req, res) => {
  try {
    const { components, address, total_price } = req.body;

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ success: false, message: "Order components array is required and cannot be empty" });
    }

    if (!address) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const orderId = await generateOrderId();

    const newOrder = new Order({
      _id: orderId,
      user_id: user._id,
      components,
      status: "Pending",
      total_price: total_price || 0,
      address,
    });

    await newOrder.save();

    // Clear cart on user document
    user.cart = [];
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ success: false, message: "Server error during checkout" });
  }
};
