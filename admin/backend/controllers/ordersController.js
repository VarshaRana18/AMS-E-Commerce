const Order = require("../models/Order");
const { getComponentModel } = require("../models/components.model.js");
const { ObjectId } = require("mongodb");
const PreBuiltPC = require("../models/preBuiltPC.model.js");
const OwnCustomPC = require("../models/ownCustomPC.js");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user_id", "name")
      .sort({ order_date: -1 })
      .lean();

    const ordersWithUsername = orders.map((order) => ({
      ...order,
      username: order.user_id ? order.user_id.name : "Unknown User",
      user_id: order.user_id ? order.user_id._id : order.user_id,
    }));

    res.json(ordersWithUsername);
  } catch (err) {
    console.error("Error fetching Orders:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPriceRange = async (req, res) => {
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
      // Round down minPrice to nearest 1000
      const minPrice = Math.floor(result[0].minPrice / 1000) * 1000;
      // Round up maxPrice to nearest 1000
      const maxPrice = Math.ceil(result[0].maxPrice / 1000) * 1000;

      // Ensure there's always at least 1000 difference between min and max
      const adjustedMaxPrice = Math.max(maxPrice, minPrice + 1000);

      res.json({
        minPrice: minPrice,
        maxPrice: adjustedMaxPrice,
      });
    } else {
      res.json({ minPrice: 0, maxPrice: 10000 });
    }
  } catch (error) {
    console.error("Error fetching price range of orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUnseenCounts = async (req, res) => {
  try {
    const count = await Order.countDocuments({ seen: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markSeen = async (req, res) => {
  try {
    await Order.updateMany({ seen: false }, { $set: { seen: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const componentsWithDetails = await Promise.all(
      order.components.map(async (component) => {
        try {
          if (component.component_type === "prebuiltpcs") {
            const details = await PreBuiltPC.findById(
              component.component_id
            ).lean();
            return {
              ...component,
              component_name: details?.name || "Prebuilt PC",
              component_price: details?.price || 0,
              component_brand: "Pre-built PC",
              component_details:
                {
                  ...details, // This includes all PC specs
                  name: details?.name,
                  price: details?.price,
                  coverImage: details?.coverImage,
                  img: details?.img,
                  // All the specs will be included automatically
                } || null,
            };
          } else if (component.component_type === "owncustompcs") {
            const customPC = await OwnCustomPC.findById(
              component.component_id
            ).lean();

            if (!customPC) {
              console.error(
                `Custom PC with ID ${component.component_id} not found`
              );
              return {
                ...component,
                component_name: "Custom PC (Not Found)",
                component_price: 0,
                component_brand: "N/A",
                component_details: null,
              };
            }

            // Adapt to the actual structure in the database
            const componentDetails = {
              motherboard:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "motherboard"
                ) || null,
              processor:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "processor"
                ) || null,
              "graphics-card":
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "graphics card"
                ) || null,
              ram:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "ram"
                ) || null,
              storage:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "storage device"
                ) || null,
              "power-supply":
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "power supply"
                ) || null,
              cooling:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "cooling system"
                ) || null,
              cabinet:
                customPC.components.find(
                  (c) => c.type.toLowerCase() === "cabinet"
                ) || null,
            };

            return {
              ...component,
              component_name: customPC?.name || "Custom PC",
              component_price: customPC?.price || 0,
              component_brand: "Custom Built PC",
              component_details: {
                ...customPC,
                components: componentDetails,
                type: "owncustompcs",
              },
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
          console.error(
            `Error fetching component ${component.component_id}:`,
            err
          );
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

    res.json({
      ...order,
      components: componentsWithDetails,
    });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
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

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTrackingNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number } = req.body;

    if (!tracking_number || tracking_number.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const { courier } = req.body;

    if (!courier || courier.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Courier name is required",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
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
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
