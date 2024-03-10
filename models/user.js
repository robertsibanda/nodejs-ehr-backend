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

  email: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
  },

  userType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("user", User);
