const express = require("express");
const Service = require("../models/Service");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching services", error: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const { name, description, duration, price } = req.body;
    const service = await Service.create({
      name,
      description,
      duration,
      price,
    });
    res.status(201).json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
});

// Add routes for updating and deleting services

module.exports = router;
