import User from "../models/user.model.js";
import { getComponentModel } from "../models/components.model.js";

/**
 * @desc    Get current user's cart items with full component details
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(200).json({ success: true, cart: [], totalCartPrice: 0 });
    }

    // Hydrate cart item details dynamically
    const cartDetails = await Promise.all(
      user.cart.map(async (item) => {
        try {
          const ComponentModel = getComponentModel(item.type);
          const component = await ComponentModel.findById(item._id).lean();
          if (!component) return null;

          return {
            ...component,
            quantity: item.quantity,
            itemSubtotal: (component.price || 0) * item.quantity,
          };
        } catch (err) {
          console.error(`Error resolving cart component (${item.type}/${item._id}):`, err);
          return null;
        }
      })
    );

    const validItems = cartDetails.filter(Boolean);
    const totalCartPrice = validItems.reduce((acc, item) => acc + (item.itemSubtotal || 0), 0);

    return res.status(200).json({
      success: true,
      cart: validItems,
      totalCartPrice,
      totalItems: user.totalCartItems,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Internal server error fetching cart" });
  }
};

/**
 * @desc    Add an item to the current user's cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { _id, type, quantity = 1 } = req.body;

    if (!_id || !type) {
      return res.status(400).json({
        success: false,
        message: "Component ID (_id) and component type are required",
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) => item._id === _id && item.type === type
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      user.cart.push({ _id, type, quantity: qty });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: user.cart,
      totalItems: user.totalCartItems,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to add item to cart" });
  }
};

/**
 * @desc    Update quantity of an item in cart
 * @route   PUT /api/cart
 * @access  Private
 */
export const updateCartQuantity = async (req, res) => {
  try {
    const { _id, quantity } = req.body;

    if (!_id || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Item ID and quantity are required" });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cartItem = user.cart.find((item) => item._id.toString() === _id.toString());
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    cartItem.quantity = qty;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart: user.cart,
      totalItems: user.totalCartItems,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to update cart quantity" });
  }
};

/**
 * @desc    Remove an item or clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const { _id, type, clearAll } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (clearAll) {
      user.cart = [];
    } else {
      if (!_id || !type) {
        return res.status(400).json({
          success: false,
          message: "Please specify item _id and type to remove, or pass clearAll: true",
        });
      }

      const initialLength = user.cart.length;
      user.cart = user.cart.filter(
        (item) => !(item._id === _id && item.type === type)
      );

      if (user.cart.length === initialLength) {
        return res.status(404).json({ success: false, message: "Item not found in cart" });
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: clearAll ? "Cart cleared successfully" : "Item removed from cart",
      cart: user.cart,
      totalItems: user.totalCartItems,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove item from cart" });
  }
};
