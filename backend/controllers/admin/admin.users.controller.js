import User from "../../models/user.model.js";

/**
 * @desc    Get all users list (Admin)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get user by ID (Admin)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update user role (Admin: e.g. promote customer to admin)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["customer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
