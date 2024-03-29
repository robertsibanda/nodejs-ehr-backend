const mongoose = require("mongoose");

const Token = mongoose.Schema({
  username: {
    // username not userid(_id)
    type: String,
    required: true,
  },

  accessToken: {
    type: String,
    required: true,
  },

  refreshToken: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("tokens", Token);
