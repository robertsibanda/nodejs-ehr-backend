const mongoose = require("mongoose");

const Illness = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },

  other: {
    type: String,
  },
});

module.exports = mongoose.model("illness", Illness);
