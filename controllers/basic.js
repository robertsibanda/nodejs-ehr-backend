const Event = require("../models/event");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const User = require("../models/user");

const SearchPerson = async (req, res) => {
  const { search_string, user_type } = req.body;
  await User.find({ userType: user_type }).then(async (people) => {
    foundPeople = people.filter((person) => {
      if (person.fullName.toLowerCase().includes(search_string.toLowerCase())) {
        return person;
      }
    });

    if (foundPeople.length > 0) {
      res.json({ people: foundPeople });
    } else {
      res.json({ error: "404" });
    }
  });
};

const CreateAppointment = async (req, res) => {
  // TODO create notifications
  const { person, title, date, time } = req.body;

  let doctor = null;
  let patient = null;
  let approver = null;

  if (!person || !title || !date || !time)
    return res.json({ error: "missing request information" });

  if (req.user.userType == "doctor") {
    doctor = req.ser.username;
    patient = person;
    approver = patient;
  } else if (req.user.userType == "patient") {
    doctor = person;
    patient = req.user.username;
    approver = doctor;
  }

  await Event.findOne({ doctor, patient, date, time }).then(async (event) => {
    if (event) return res.json({ error: "Time already taken" });

    await Event.findOne({ doctor, date, time }).then(async (event) => {
      if (event) {
        if (req.user.userType == "doctor")
          return res.json({ error: "You are already booked for that time" });
        return res.json({ error: "Doctor already booked at that time" });
      }

      await Event.findOne({ patient, date, time }).then(async (event) => {
        if (event) {
          if (req.user.userType == "doctor")
            return res.json({ error: "Patient already booked for that time" });
          return res.json({
            error: "You already habe an appointment for that time",
          });
        }

        await Event.create({
          doctor,
          patient,
          title,
          date,
          time,
          approved: false,
          rejected: false,
          approver,
          status: "0",
        }).then((event) => {
          res.json({ sucess: "event created successfully" });
        });
      });
    });
  });
};

const UpdateAppointment = async (req, res) => {
  // TODO create notifications
  const { appointment, approved, rejected } = req.body;
  if (!appointment || !approved || !rejected)
    return res.json({ error: "missing reqest data" });

  Event.findOneAndUpdate({ _id: appointment }, { approved, rejected }).then(
    (app) => {
      res.json({ sucess: "appointment updated" });
    }
  );
};

const DeleteAppointment = async (req, res) => {
  //TODO create notification
};

module.exports = {
  SearchPerson,
  CreateAppointment,
  UpdateAppointment,
  DeleteAppointment,
};
