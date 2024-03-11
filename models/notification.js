const mongoose = require("mongoose");

const Notification = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});
