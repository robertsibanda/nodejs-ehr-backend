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
        { patients: [...patients, patient] }
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

module.exports = {
  CreatePrescription,
  DeletePatient,
  AddPatient,
  CreateDiagnosis,
};
