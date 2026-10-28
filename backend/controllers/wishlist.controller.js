import User from "../models/user.model.js";
import { getComponentModel } from "../models/components.model.js";

/**
 * @desc    Get current user's wishlist with component details
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.status(200).json({ success: true, wishlist: [] });
    }

    const wishlistDetails = await Promise.all(
      user.wishlist.map(async (item) => {
        try {
          const ComponentModel = getComponentModel(item.type);
          const component = await ComponentModel.findById(item._id).lean();
          return component;
        } catch (err) {
          console.error(`Error resolving wishlist item (${item.type}/${item._id}):`, err);
          return null;
        }
      })
    );

    return res.status(200).json({
      success: true,
      wishlist: wishlistDetails.filter(Boolean),
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc    Add an item to wishlist
 * @route   POST /api/wishlist
 * @access  Private
 */
export const addToWishlist = async (req, res) => {
  try {
    const { _id, type } = req.body;

    if (!_id || !type) {
      return res.status(400).json({
        success: false,
        message: "Component ID (_id) and type are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const alreadyInWishlist = user.wishlist.some(
      (item) => item._id === _id && item.type === type
    );

    if (alreadyInWishlist) {
      return res.status(400).json({ success: false, message: "Item already in wishlist" });
    }

    user.wishlist.push({ _id, type });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to add to wishlist" });
  }
};

/**
 * @desc    Remove an item from wishlist
 * @route   DELETE /api/wishlist
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { _id, type } = req.body;

    if (!_id || !type) {
      return res.status(400).json({
        success: false,
        message: "Component ID (_id) and type are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(
      (item) => !(item._id === _id && item.type === type)
    );

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
};
