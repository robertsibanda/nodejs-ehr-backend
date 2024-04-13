const mongoose = require("mongoose");

const Illness = mongoose.Schema({
  patient: {
    type: String,
    required: true,
  },

  doctor: {
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

  note: {
    type: String,
  },
});

module.exports = mongoose.model("illness", Illness);
