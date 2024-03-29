const mongoose = require("mongoose");

const User = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    require: true,
  },

  contact: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  userType: {
    type: String,
    required: true,
  },

  notifications: [],
});

module.exports = mongoose.model("users", User);
