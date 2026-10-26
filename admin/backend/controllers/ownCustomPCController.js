const ownCustomPC = require("../models/ownCustomPC.js");
const User = require("../models/User.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

exports.getOwnCustomPC = async (req, res) => {
  try {
    // Use populate to fetch user data in a single query
    const ownCustomPCs = await ownCustomPC
      .find()
      .populate("user_id", "name") // Only fetch the name field from User
      .lean();

    // Transform the data to match your expected format
    const ordersWithUsername = ownCustomPCs.map((order) => ({
      ...order,
      username: order.user_id.name,
      user_id: order.user_id._id, // Keep the original user_id
    }));

    res.json(ordersWithUsername);
  } catch (error) {
    console.error("Error fetching Own Custom PCs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateOwnCustomPCStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const orderObjectId = new mongoose.Types.ObjectId(orderId);

  if (!mongoose.Types.ObjectId.isValid(orderObjectId)) {
    return res.status(400).json({ message: "Invalid Order ID" });
  }

  try {
    const updatedOrder = await ownCustomPC.findByIdAndUpdate(
      orderObjectId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateOwnCustomPCCharge = async (req, res) => {
  const { orderId } = req.params;
  const { totalCharge } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid Order ID" });
  }

  try {
    const updatedOrder = await ownCustomPC.findByIdAndUpdate(
      orderId,
      { price: totalCharge.replace("₹", "") },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating total charge:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
