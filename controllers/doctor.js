// more complicated because of patient permissions

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const Note = require("../models/notes");
const Prescritpion = require("../models/prescription");
const Disease = require("../models/illness");
const illness = require("../models/illness");

const AddPatient = async (req, res) => {
  // TODO create notification
  const { patient } = req.body;
  await Doctor.findOne({ username: req.user.username })
    .then(async (doc) => {
      patients = doc.patients;
      await Doctor.findOneAndUpdate(
        { username: req.user.username },
        { patients: [...patients, { patient, approved: "0" }] }
      ).then((doc) => {
        return res.json({ sucess: "patiend added" });
      });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const DeletePatient = async (req, res) => {
  // TODO create notification
  const { patient } = req.body;
  await Doctor.findOne({ username: req.user.username })
    .then(async (doc) => {
      patients = doc.patients;
      await Doctor.findOneAndUpdate(
        { username: req.user.username },
        {
          patients: patient.filter((p) => {
            if (p !== patient) {
              return p;
            }
          }),
        }
      ).then((doc) => {
        return res.json({ sucess: "patiend removed" });
      });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const CreatePrescription = async (req, res) => {
  // TODO create notification
  const { medicine, reason, patient } = req.body;
  await Prescritpion.create({
    patient,
    medicine,
    //new Date()
    reason,
    doctor: req.user.username,
  })
    .then((pres) => {
      res.json({ success: "prescription created" });
    })
    .catch((err) => {
      res.json({ error: err.message });
      console.log(err);
    });
};

const CreateDiagnosis = async (req, res) => {
  // TODO create notification
  const { patient, title, other, doctor } = req.body;
  if (!patient || !title || !doctor || !other)
    return res.json({ error: "miising request data" });
  await illness
    .create({
      patient,
      doctor: req.user.username,
      title,
      //new Date()
      other,
    })
    .then((ill) => {
      res.json({ success: "Illness created" });
    });
};

const ViewInformation = async (req, res) => {
  // for all viewing categories : calendar, alleges, notes, prescriptions, medications
  const { category, person } = req.body;

  let patient = await Patient.findOne({ username: person });

  if (!patient) {
    return res.json({ error: "you account not registered as patient" });
  }
  if (category === "calendar") {
    let calender_information = patient.calender.filter((cal) => {
      if (cal.date > new Date()) {
        return cal;
      }
    });

    return res.json({ success: calender_information });
  } else if (category === "prescriptions") {
    return res.json({ prescriptions: patient.prescriptions });
  } else if (category === "notes") {
    return res.json({ notes: patient.notes });
  } else if (category === "doctors") {
    return res.json({ doctors: patient.doctors });
  } else if (category === "diagnosis") {
    return res.json({ diagnoses: patient.illnesses });
  }
};

async function createNotification(notification, req) {
  const { type_, username, title, content } = notification;
  await Notification.create({
    notificationType: type_,
    username,
    title,
    content,
    status: "0",
    other: req.user.username,
  })
    .then(async (notif) => {
      await User.findOne({ username })
        .then(async (user) => {
          await User.findOneAndUpdate(
            { username },
            { notifications: [...user.notifications, notif._id] }
          );
        })
        .then((notif) => {
          console.log("Notification created : ", notification);
        });
    })
    .catch((err) => {
      console.log("Error in notifications:  ", notification, " : ", err);
    });
}

module.exports = {
  CreatePrescription,
  DeletePatient,
  AddPatient,
  CreateDiagnosis,
  ViewInformation,
};
