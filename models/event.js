const mongoose = require("mongoose");

const Event = mongoose.Schema({
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

  status: {
    type: String,
    required: true,
  },
});
