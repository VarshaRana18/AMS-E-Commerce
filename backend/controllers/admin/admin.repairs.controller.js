import Request from "../../models/Request.js";
import RepairStep from "../../models/RepairStep.js";

/**
 * @desc    Get all customer repair requests
 * @route   GET /api/admin/repairs/requests
 * @access  Private (Admin)
 */
export const getAdminRepairRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate("user_id", "name email")
      .sort({ request_date: -1 })
      .lean();

    const requestsWithUsername = requests.map((request) => ({
      ...request,
      username: request.user_id ? request.user_id.name : "Unknown User",
      email: request.user_id ? request.user_id.email : "N/A",
      user_id: request.user_id ? request.user_id._id : request.user_id,
    }));

    return res.status(200).json(requestsWithUsername);
  } catch (err) {
    console.error("Error fetching admin repair requests:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Get configured repair workflow steps
 * @route   GET /api/admin/repairs/steps
 * @access  Private (Admin)
 */
export const getRepairSteps = async (req, res) => {
  try {
    const steps = await RepairStep.find({}).sort({ step_number: 1 });
    return res.status(200).json(steps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Save or update repair workflow steps
 * @route   POST /api/admin/repairs/steps
 * @access  Private (Admin)
 */
export const saveRepairSteps = async (req, res) => {
  try {
    const { steps } = req.body;

    if (!Array.isArray(steps)) {
      return res.status(400).json({ message: "Steps array is required." });
    }

    const existingSteps = await RepairStep.find({}, "step_number");
    const existingStepNumbers = existingSteps.map((s) => s.step_number);
    const newStepNumbers = steps.map((s) => s.step_number);

    const stepsToDelete = existingStepNumbers.filter(
      (num) => !newStepNumbers.includes(num)
    );

    await RepairStep.deleteMany({ step_number: { $in: stepsToDelete } });

    for (const { step_number, description } of steps) {
      if (!step_number || !description) {
        return res.status(400).json({
          message: "Each step must have step_number and description.",
        });
      }

      await RepairStep.updateOne(
        { step_number },
        { step_number, description },
        { upsert: true }
      );
    }

    return res.status(201).json({ message: "Steps saved successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Update repair request status
 * @route   PUT /api/admin/repairs/requests/:_id/status
 * @access  Private (Admin)
 */
export const updateRepairStatus = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    const repair = await Request.findOneAndUpdate(
      { _id },
      { status },
      { new: true }
    );

    if (!repair) {
      return res.status(404).json({ error: "Repair request not found" });
    }

    return res.json(repair);
  } catch (error) {
    console.error("Database error in updateRepairStatus:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc    Update repair request total charge
 * @route   PUT /api/admin/repairs/requests/:_id/charge
 * @access  Private (Admin)
 */
export const updateRepairCharge = async (req, res) => {
  try {
    const { _id } = req.params;
    const { totalCharge } = req.body;

    const repair = await Request.findOneAndUpdate(
      { _id },
      { totalCharge: String(totalCharge) },
      { new: true }
    );

    if (!repair) {
      return res.status(404).json({ error: "Repair request not found" });
    }

    return res.json(repair);
  } catch (error) {
    console.error("Database error in updateRepairCharge:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc    Get repair requests price range
 * @route   GET /api/admin/repairs/requests/pricerange
 * @access  Private (Admin)
 */
export const getRepairPriceRange = async (req, res) => {
  try {
    const result = await Request.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: { $toDouble: "$totalCharge" } },
          maxPrice: { $max: { $toDouble: "$totalCharge" } },
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
    console.error("Error fetching repair price range:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @desc    Count unseen repair requests
 * @route   GET /api/admin/repairs/requests/unseen-count
 * @access  Private (Admin)
 */
export const getUnseenRepairCounts = async (req, res) => {
  try {
    const count = await Request.countDocuments({ seen: false });
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc    Mark all unseen repair requests as seen
 * @route   POST /api/admin/repairs/requests/mark-seen
 * @access  Private (Admin)
 */
export const markRepairsSeen = async (req, res) => {
  try {
    await Request.updateMany({ seen: false }, { $set: { seen: true } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
