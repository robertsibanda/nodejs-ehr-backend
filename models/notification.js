const mongoose = require("mongoose");

const Notification = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  notificationType: {
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

  other: {
    type: String,
  },
});

module.exports = mongoose.model("notifications", Notification);
