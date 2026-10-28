import User from "../models/user.model.js";

/**
 * @desc    Get all addresses for authenticated user
 * @route   GET /api/addresses
 * @access  Private
 */
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

/**
 * @desc    Add a new address for authenticated user
 * @route   POST /api/addresses
 * @access  Private
 */
export const addAddress = async (req, res) => {
  try {
    const { name, phoneNumber, pincode, flat, area, landmark, city, state, isDefault } = req.body;

    if (!name || !phoneNumber || !pincode || !flat || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields (name, phone, pincode, flat, city, state)",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If marked default, unset existing default
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name,
      phoneNumber,
      pincode,
      flat,
      area,
      landmark,
      city,
      state,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Add address error:", error);
    return res.status(500).json({ success: false, message: "Failed to add address" });
  }
};

/**
 * @desc    Update an address by ID
 * @route   PUT /api/addresses/:addressId
 * @access  Private
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phoneNumber, pincode, flat, area, landmark, city, state, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (name) address.name = name;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (pincode) address.pincode = pincode;
    if (flat) address.flat = flat;
    if (area !== undefined) address.area = area;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

/**
 * @desc    Delete an address by ID
 * @route   DELETE /api/addresses/:addressId
 * @access  Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};
