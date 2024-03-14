const mongoose = require("mongoose");

const Prescription = mongoose.Schema({
  patient: {
    type: String,
    required: true,
  },

  doctor: {
    type: String,
    required: true,
  },

  medicine: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    reuqired: true,
  },

  reason: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("prescriptions", Prescription);
