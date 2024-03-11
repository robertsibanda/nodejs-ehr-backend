const mongoose = require("mongoose");

const Notes = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  doctor: {
    type: String,
    required: true,
  },
});
