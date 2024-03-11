const mongoose = reuqire("mongoose");

const Prescription = mongoose.Schema({
  medicine: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    reuqired: true,
  },

  reason: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("prescription", Prescription);
