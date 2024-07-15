const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    const review = await Review.create({
      userId: req.user.userId,
      appointmentId,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
});

router.post("/:id/respond", auth, async (req, res) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const { staffResponse } = req.body;
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    review.staffResponse = staffResponse;
    await review.save();
    res.json(review);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error responding to review", error: error.message });
  }
});

// Add routes for fetching reviews

module.exports = router;
