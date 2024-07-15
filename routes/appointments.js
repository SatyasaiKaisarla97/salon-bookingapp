const express = require("express");
const Appointment = require("../models/Appointment");
const auth = require("../middleware/auth");
const emailService = require("../utils/emailService");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { serviceId, staffId, dateTime } = req.body;
    const appointment = await Appointment.create({
      userId: req.user.userId,
      serviceId,
      staffId,
      dateTime,
    });

    // Send confirmation email
    await emailService.sendAppointmentConfirmation(req.user.email, appointment);

    res.status(201).json(appointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error booking appointment", error: error.message });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.userId },
    });
    res.json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
});

// Add routes for updating and cancelling appointments

module.exports = router;
