const mongoose = require("mongoose");

const Appointment = mongoose.Schema({
  doctor: {
    type: String,
    required: true,
  },

  patient: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  day: {
    type: String,
    required: true,
  },

  month: {
    type: String,
    required: true,
  },

  year: {
    type: String,
    required: true,
  },

  hour: {
    type: String,
    required: true,
  },

  minute: {
    type: String,
    required: true,
  },

  status: {
    type: String,
  },
});

module.exports = mongoose.model("appointments", Appointment);
