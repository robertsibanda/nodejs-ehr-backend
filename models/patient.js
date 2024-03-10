const mongoose = require("mongoose");

const Patient = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  profilePicture,

  doctors: [], // *{ usernames }
  notes: [], // *{ text, date, doctor }
  calender: [], // *{ id(uuid), title, date, time, status(done/not)}
  illnesses: [], // *{ title, date}
  medications: [], // *{ title, duration, date, }
  prescriptions: [], // *{ doctor, medicine, date, qty }
  visits: [], // *{ title, doctor, date&time }

  permissions: [], // *{ perm: val} e.g { add_doc: public, calender: private }
});

module.exports = mongoose.model("patient", Patient);
