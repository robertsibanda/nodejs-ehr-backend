const Event = require("../models/event");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const User = require("../models/user");

const SearchPerson = async (req, res) => {
  console.log("Searchinf for : ", req.body);
  const { search_string, user_type } = req.body;

  let foundPeople = [];

  let myRelations = [];

  if (user_type === "doctor") {
    // search for doctors
    await Doctor.find({}).then(async (docs) => {
      await Patient.findOne({ username: req.user.username }).then((patient) => {
        myRelations = patient.doctors;
        foundPeople = docs.filter((doc) => {
          if (
            doc.fullName.toLowerCase().includes(search_string.toLowerCase())
          ) {
            return doc;
          }
        });
      });
    });
  } else if (user_type === "patient") {
    //search for patients
    await Patient.find({}).then(async (patients) => {
      await Doctor.findOne({ username: req.user.username }).then((doc) => {
        myRelations = doc.patients;
        foundPeople = patients.filter((pat) => {
          if (
            pat.fullName.toLowerCase().includes(search_string.toLowerCase())
          ) {
            return pat;
          }
        });
      });
    });
  }

  console.log("Found people : ", foundPeople);
  if (foundPeople.length > 0 && user_type === "doctor") {
    // doctors found
    console.log("My Relations : ", myRelations);

    let people = foundPeople.map(person => {

      let approved = myRelations.map(rel => {
        console.log("Selected Approv: ", rel , `username ${person.username} vs ${rel.doctor}`)

        if (rel.doctor === person.username & rel.approved === "1") {
          return true
        }
        console.log("Rejected Approv: ", rel)

      })
      console.log("Approved : ", approved)
      let requested = myRelations.map(rel => {
        if (rel.doctor === person.username & rel.approved === "0") {
          console.log("Selected Req: ", rel)
          return true
        }
        console.log("Rejected Approv: ", rel)

      })
      console.log("requested : ", requested)

      return {
        name: person.fullName,
        username: person.username,
        contact: person.contact,
        hospital: person.hospital,
        work: person.profession,
        approved: approved.includes(true),
        requested: requested.includes(true)
      };
    })

    res.json({people});
  } else if (foundPeople.length > 0 && user_type === "patient") {
    //patients found
    res.json({
      people: foundPeople.map((person) => {
        return {
          name: person.fullName,
          username: person.username,
          contact: person.contact,
          status: person.doctors.filter((doc) => {
            if (req.user.username === doc) {
              return true;
            }
          }),
        };
      }),
    });
  } else {
    res.json({ error: "404" });
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
};
