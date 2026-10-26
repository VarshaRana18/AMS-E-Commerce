const Request = require("../models/Request");
const RepairStep = require("../models/RepairStep");
const { ObjectId } = require("mongodb");

exports.getRepairRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate("user_id", "name")
      .sort({ request_date: -1 })
      .lean();

    const requestsWithUsername = requests.map((request) => ({
      ...request,
      username: request.user_id ? request.user_id.name : "Unknown User",
      user_id: request.user_id ? request.user_id._id : request.user_id,
    }));

    res.json(requestsWithUsername);
  } catch (err) {
    console.error("Error fetching repair requests:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRepairSteps = async (req, res) => {
  try {
    const steps = await RepairStep.find({}).sort({ step_number: 1 });
    // console.log(steps);
    res.status(200).json(steps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveRepairSteps = async (req, res) => {
  try {
    const { steps } = req.body;

    if (!Array.isArray(steps)) {
      return res.status(400).json({ message: "Steps array is required." });
    }

    const existingSteps = await RepairStep.find({}, "step_number"); // Fetch all step numbers from DB
    const existingStepNumbers = existingSteps.map((step) => step.step_number);
    const newStepNumbers = steps.map((step) => step.step_number);

    // Delete steps that are in the DB but not in the new list
    const stepsToDelete = existingStepNumbers.filter(
      (stepNumber) => !newStepNumbers.includes(stepNumber)
    );

    await RepairStep.deleteMany({ step_number: { $in: stepsToDelete } });

    // Upsert (update or insert) the new/updated steps
    for (const { step_number, description } of steps) {
      if (!step_number || !description) {
        return res.status(400).json({
          message: "Each step must have step_number and description.",
        });
      }

      await RepairStep.updateOne(
        { step_number }, // Find by step_number
        { step_number, description }, // Update values
        { upsert: true } // Insert if not exists
      );
    }

    res.status(201).json({ message: "Steps saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRepairStatus = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  try {
    const allRepairs = await Request.find({});
    // console.log("All repairs in DB:", allRepairs[0]);

    const repair = await Request.findOneAndUpdate(
      { _id: _id },
      { status },
      { new: true }
    ).exec();

    if (repair) {
      res.json(repair);
    } else {
      res.status(404).json({ error: "Repair request not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update repair request charge
exports.updateRepairCharge = async (req, res) => {
  const { _id } = req.params;
  const { totalCharge } = req.body;

  try {
    const repair = await Request.findOneAndUpdate(
      { _id: _id },
      { totalCharge }, // Update `totalCharge` field
      { new: true }
    ).exec();

    if (repair) {
      res.json(repair);
    } else {
      res.status(404).json({ error: "Repair request not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPriceRange = async (req, res) => {
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
    console.error("Error fetching price range:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUnseenCounts = async (req, res) => {
  try {
    const count = await Request.countDocuments({ seen: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markSeen = async (req, res) => {
  try {
    await Request.updateMany({ seen: false }, { $set: { seen: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
