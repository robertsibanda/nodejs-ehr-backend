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

  qty : {
    type: String,
    required: true
  },

  note: {
    type: String,
  },
});

module.exports = mongoose.model("prescriptions", Prescription);
