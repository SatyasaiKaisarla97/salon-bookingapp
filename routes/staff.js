const express = require("express");
const Staff = require("../models/Staff");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const staff = await Staff.findAll({
      include: [{ model: User, attributes: ["name", "email"] }],
    });
    res.json(staff);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching staff", error: error.message });
  }
});

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  try {
    const { userId, specialization } = req.body;
    const staff = await Staff.create({ userId, specialization });
    await User.update({ role: "staff" }, { where: { id: userId } });
    res.status(201).json(staff);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating staff", error: error.message });
  }
});

// Add routes for updating and deleting staff

module.exports = router;
