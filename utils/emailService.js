const transporter = require("../config/email");

const sendAppointmentConfirmation = async (email, appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Appointment Confirmation",
    text: `Your appointment has been confirmed for ${appointment.dateTime}.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendAppointmentReminder = async (email, appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Appointment Reminder",
    text: `This is a reminder for your appointment on ${appointment.dateTime}.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
};
