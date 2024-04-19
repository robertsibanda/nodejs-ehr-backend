const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const User = require("../models/user");
const Appointment = require("../models/appointment");

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

  if (user_type === "doctor") {
    let doctors = await Doctor.find({});
    let patient = await Patient.findOne({ username: req.user.username });

    foundPeople = doctors.filter((p) => {
      if (p.fullName.toLowerCase().includes(search_string.toLowerCase())) {
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
      if (p.fullName.toLowerCase().includes(search_string.toLowerCase())) {
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

const UpdateRelationShip = async (req, res) => {
  const { relationship, approved, rejected } = req.body;
  if (!appointment || !approved || !rejected)
    return res.json({ error: "missing reqest data" });
};

const DeleteAppointment = async (req, res) => {
  const { id } = req.body;
  await Appointment.findOneAndDelete({ _id: id })
    .then((app) => {
      res.json({ success: "appointment deleted" });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

const GetAppointments = async (req, res) => {
  const { year, day, month, user_type } = req.body;

  console.log("Requesting appointments")

  if (user_type == "doctor") {
    console.log("user is a doctor")
    await Appointment.find({
      doctor: req.user.username,
      year,
      day,
      month,
    }).then(app => {
      console.log("appointments found : ", app)
      return res.json({ appointments : app})
    })

  } else if (user_type == "patient") {
    await Appointment.find({
      patient: req.user.username,
      year,
      day,
      month,
    }).then(app => {
      console.log('appointments found : ' , app)
      return res.json({ appointments: app });
    })
  }

  
};

module.exports = {
  SearchPerson,
  DeleteAppointment,
  ViewProfileInformation,
  GetAppointments,
};
