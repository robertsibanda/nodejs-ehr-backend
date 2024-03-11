const mongoose = require("mongoose");

const Event = mongoose.Schema({
  doctor: {
    type: String,
    required: true,
  },

  patient: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  approved: {
    type: Boolean,
  },

  rejected: {
    type: Boolean,
  },

  approver: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("events", Event);
