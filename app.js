const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");
const sequelize = require("./config/database");
const emailService = require("./utils/emailService");
const Appointment = require("./models/Appointment");
const User = require("./models/User");
const Service = require("./models/Service");
const Staff = require("./models/Staff");
const Review = require("./models/Review");
const { Op } = require("sequelize");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/services", require("./routes/services"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/reviews", require("./routes/reviews"));

User.hasMany(Appointment, { foreignKey: "userId" });
Appointment.belongsTo(User, { foreignKey: "userId" });

Service.hasMany(Appointment, { foreignKey: "serviceId" });
Appointment.belongsTo(Service, { foreignKey: "serviceId" });

Staff.hasMany(Appointment, { foreignKey: "staffId" });
Appointment.belongsTo(Staff, { foreignKey: "staffId" });

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

Appointment.hasOne(Review, { foreignKey: "appointmentId" });
Review.belongsTo(Appointment, { foreignKey: "appointmentId" });

// Database sync
sequelize.sync({ force: true }).then(() => {
  console.log("Database synced");
});

// Cron job for appointment reminders
cron.schedule("0 9 * * *", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.findAll({
    where: {
      dateTime: {
        [sequelize.Op.gte]: tomorrow,
        [sequelize.Op.lt]: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
      },
      status: "booked",
    },
    include: [{ model: User, attributes: ["email"] }],
  });

  for (const appointment of appointments) {
    await emailService.sendAppointmentReminder(
      appointment.User.email,
      appointment
    );
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
