const Event = require("../models/event");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const User = require("../models/user");
const Relation = require("../models/relation");

const ViewProfileInformation = async (req, res) => {
  //get user iformation for profile viewing
  const { username } = req.body;

  const userInfor = User.findOne({ username })
    .then((user) => {
      person = {
        fullname: user.fullName,
        contact: user.contact,
      };
      return res.json({ person });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const SearchPerson = async (req, res) => {
  console.log("Searchinf for : ", req.body);
  const { search_string, user_type } = req.body;

  //TODO fix double request problem
  if (user_type === "doctor") {
    let doctors = await Doctor.find({});
    let patient = await Patient.findOne({ username: req.user.username });

    foundPeople = doctors.filter((p) => {
      if (p.fullName.toLowerCase().includes(search_string)) {
        return p;
      }
    });

    people = foundPeople.map((doc) => {
      doc_request = patient.requested.includes(doc.username);
      pat_requested = doc.requested.includes(patient.username);

      let requested = false;
      let approver = null;
      if (doc_request || pat_requested) {
        requested = true;
      }

      if (doc_request) approver = patient.username;
      if (pat_requested) approver = doc.username;

      return {
        name: doc.fullName,
        username: doc.username,
        contact: doc.contact,
        hospital: doc.hospital,
        work: doc.profession,
        approver,
        approved: doc.patients.includes(req.user.username),
        requested,
      };
    });

    res.json({ people });
    console.log(people);
  } else if (user_type === "patient") {
    let patients = await Patient.find({});
    let doctor = await Doctor.findOne({ username: req.user.username });

    foundPeople = patients.filter((p) => {
      if (p.fullName.toLowerCase().includes(search_string)) {
        return p;
      }
    });

    people = foundPeople.map((pat) => {
      pat_request = doctor.requested.includes(pat.username);
      doc_request = pat.requested.includes(doctor.username);

      let requested = false;
      let approver = null;
      if (doc_request || pat_request) {
        requested = true;
      }

      if (doc_request) {
        approver = pat.username;
        console.log("approver 1 : ", approver);
      }
      if (pat_request) {
        approver = doctor.username;
        console.log("approver 2 : ", approver);
      }

      return {
        name: pat.fullName,
        username: pat.username,
        contact: pat.contact,
        approved: pat.doctors.includes(req.user.username),
        requested,
        approver,
      };
    });

    res.json({ people });
    console.log(people);
  }
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

const UpdateRelationShip = async (req, res) => {
  const { relationship, approved, rejected } = req.body;
  if (!appointment || !approved || !rejected)
    return res.json({ error: "missing reqest data" });
};

const DeleteAppointment = async (req, res) => {
  //TODO create notification
};

module.exports = {
  SearchPerson,
  CreateAppointment,
  UpdateAppointment,
  DeleteAppointment,
  ViewProfileInformation,
};
