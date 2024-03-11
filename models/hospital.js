const mongoose = require("mongoose");

const Hospital = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  doctors: [], // *{ _id }
});

module.exports = mongoose.model("hospitals", Hospital);
