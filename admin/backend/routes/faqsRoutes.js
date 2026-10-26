const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");
const authenticateToken = require("../middleware/authenticateToken");

// GET all FAQs
router.get("/", authenticateToken, async (req, res) => {
  try {
    const faqs = await FAQ.find({});
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST to save FAQs (insert, update, delete)
router.post("/", authenticateToken, async (req, res) => {
  const { faqs } = req.body; // Array of FAQs from the frontend

  try {
    // Get all existing FAQs from the database
    const existingFAQs = await FAQ.find({});
    const existingFAQIds = existingFAQs.map((faq) => faq._id.toString());

    // Arrays to track FAQs to insert, update, and delete
    const FAQsToInsert = [];
    const FAQsToUpdate = [];
    const FAQsToDelete = existingFAQIds.slice(); // Start with all existing IDs

    // Process FAQs from the frontend
    faqs.forEach((faq) => {
      if (faq._id) {
        // If FAQ has an ID, it exists in the database and needs to be updated
        FAQsToUpdate.push(faq);
        FAQsToDelete.splice(FAQsToDelete.indexOf(faq._id), 1); // Remove from delete list
      } else {
        // If FAQ has no ID, it's new and needs to be inserted
        FAQsToInsert.push(faq);
      }
    });

    // Insert new FAQs
    if (FAQsToInsert.length > 0) {
      await FAQ.insertMany(FAQsToInsert);
    }

    // Update existing FAQs
    if (FAQsToUpdate.length > 0) {
      await Promise.all(
        FAQsToUpdate.map(async (faq) => {
          await FAQ.findByIdAndUpdate(faq._id, {
            question: faq.question,
            answer: faq.answer,
          });
        })
      );
    }

    // Delete FAQs that are no longer in the frontend
    if (FAQsToDelete.length > 0) {
      await FAQ.deleteMany({ _id: { $in: FAQsToDelete } });
    }

    res.status(200).json({ message: "FAQs saved successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
