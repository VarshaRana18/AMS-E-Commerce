import Order from "../../models/orders.js";
import User from "../../models/user.model.js";
import PreBuiltPC from "../../models/preBuiltPC.model.js";
import OwnCustomPC from "../../models/ownCustomPC.model.js";
import { getComponentModel } from "../../models/components.model.js";

/**
 * @desc    Get all orders with populated customer names (Admin)
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
export const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user_id", "name email")
      .sort({ order_date: -1 })
      .lean();

    const ordersWithUsername = orders.map((order) => ({
      ...order,
      username: order.user_id ? order.user_id.name : "Unknown User",
      email: order.user_id ? order.user_id.email : "N/A",
      user_id: order.user_id ? order.user_id._id : order.user_id,
    }));

    return res.status(200).json(ordersWithUsername);
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get price range distribution of all orders
 * @route   GET /api/admin/orders/pricerange
 * @access  Private (Admin)
 */
export const getOrderPriceRange = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: { $toDouble: "$total_price" } },
          maxPrice: { $max: { $toDouble: "$total_price" } },
        },
      },
    ]);

    if (result.length > 0) {
      const minPrice = Math.floor(result[0].minPrice / 1000) * 1000;
      const maxPrice = Math.ceil(result[0].maxPrice / 1000) * 1000;
      const adjustedMaxPrice = Math.max(maxPrice, minPrice + 1000);

      return res.json({ minPrice, maxPrice: adjustedMaxPrice });
    }
    return res.json({ minPrice: 0, maxPrice: 10000 });
  } catch (error) {
    console.error("Error fetching order price range:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc    Count unseen orders
 * @route   GET /api/admin/orders/unseen-count
 * @access  Private (Admin)
 */
export const getUnseenOrderCounts = async (req, res) => {
  try {
    const count = await Order.countDocuments({ seen: false });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Mark all unseen orders as seen
 * @route   POST /api/admin/orders/mark-seen
 * @access  Private (Admin)
 */
export const markOrdersSeen = async (req, res) => {
  try {
    await Order.updateMany({ seen: false }, { $set: { seen: true } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get complete order details with populated component specs
 * @route   GET /api/admin/orders/:id/details
 * @access  Private (Admin)
 */
export const getAdminOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const componentsWithDetails = await Promise.all(
      order.components.map(async (component) => {
        try {
          if (component.component_type === "prebuiltpcs") {
            const details = await PreBuiltPC.findById(component.component_id).lean();
            return {
              ...component,
              component_name: details?.name || details?.title || "Prebuilt PC",
              component_price: details?.price || 0,
              component_brand: "Pre-built PC",
              component_details: details || null,
            };
          } else if (component.component_type === "owncustompcs") {
            const customPC = await OwnCustomPC.findById(component.component_id).lean();
            return {
              ...component,
              component_name: customPC?.name || "Custom PC",
              component_price: customPC?.price || 0,
              component_brand: "Custom Built PC",
              component_details: customPC || null,
            };
          } else {
            const model = getComponentModel(component.component_type);
            const details = await model.findById(component.component_id).lean();
            return {
              ...component,
              component_name: details?.title || "N/A",
              component_price: details?.price || 0,
              component_brand: details?.company || "N/A",
              component_details: details || null,
            };
          }
        } catch (err) {
          console.error(`Error fetching component ${component.component_id}:`, err);
          return {
            ...component,
            component_name: "N/A",
            component_price: 0,
            component_brand: "N/A",
            component_details: null,
          };
        }
      })
    );

    return res.json({
      ...order,
      components: componentsWithDetails,
    });
  } catch (error) {
    console.error("Error in getAdminOrderDetails:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private (Admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Update tracking number
 * @route   PUT /api/admin/orders/:id/tracking_number
 * @access  Private (Admin)
 */
export const updateOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number } = req.body;

    if (!tracking_number || tracking_number.trim() === "") {
      return res.status(400).json({ success: false, message: "Tracking number is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.tracking_number = tracking_number;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Tracking number updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating tracking number:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Update courier partner
 * @route   PUT /api/admin/orders/:id/courier
 * @access  Private (Admin)
 */
export const updateOrderCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const { courier } = req.body;

    if (!courier || courier.trim() === "") {
      return res.status(400).json({ success: false, message: "Courier name is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.courier = courier;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Courier updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating courier:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
