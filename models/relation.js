const mongoose = require("mongoose");

const Relation = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  doctor: {
    type: String,
    required: true,
  },

  patient: {
    type: String,
    required: true,
  },

  approved: {
    type: Boolean,
    required: true,
  },

  rejected: {
    type: Boolean,
    required: true,
  },

  approver: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("relations", Relation);
