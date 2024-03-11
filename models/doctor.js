const mongoose = require("mongoose");

const Doctor = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },

  hospital: {
    type: String,
  },

  practice: {
    type: String,
  },

  patients: [], // *{ _id }
  calender: [], // *{ title, text, date, time, status(done/not)}
  permissions: [], // *{ perm: val} e.g { add_patient: private, calender: public }
});

module.exports = mongoose.model("doctors", Doctor);
