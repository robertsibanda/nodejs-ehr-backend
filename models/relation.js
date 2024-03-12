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
    type: String,
    required: true,
  },

  rejected: {
    type: String,
    required: true,
  },

  approver: {
    type: String,
    required: true,
  },
});
