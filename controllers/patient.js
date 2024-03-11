const Doctor = reuqire("../models/doctor");
const Patient = require("../models/patient");
const User = require("../models/user");

const AddDoctor = async (req, res) => {
  // add new doctor to doc_list
  const { doctor_name } = req.body; //user username instead of _id
  await Doctor.findOne({ _id: doctor_name })
    .then(async (doc) => {
      if (!doc) {
        return res.json({ error: "doctor not found" });
      }

      await Patient.findOne({ username: req.user.username }).then(
        async (patient) => {
          if (!patient) {
            return res.json({
              error: "you account is not registered under patients",
            });
          }

          if (patient.doctors.find(doc.username) === -1) {
            Patient.findOneAndUpdate(
              { username: req.user.username },
              { doctors: [...patient.doctors, doc.username] }
            ).then((p) => {
              return res.json({ success: "doctor added" });
            });
          } else {
            return res.json({ error: "doctor already in list" });
          }
        }
      );
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const DeleteDoctor = async (req, res) => {
  // delete doctor
  const { doctor_name } = req.body;
  await Patient.findOne({ username: req.user.username })
    .then(async (patient) => {
      if (!patient) {
        return res.json({ error: "you account not registered as patient" });
      }

      await Patient.findOneAndUpdate(
        { username: req.user.username },
        {
          doctor: patient.doctors.filter((doctor) => {
            if (doctor !== doctor_name) {
              return doctor;
            }
          }),
        }
      ).then((p) => {
        return res.json({ success: "doctor deleted" });
      });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const CreateAppointment = async (req, res) => {
  const { title, description, dateTime } = req.body;

  //TODO create id using uuid()

  let id = 1;
  await Patient.findOne({ username: req.user.username })
    .then(async (patient) => {
      if (!patient) {
        return res.json({ error: "patient not found" });
      }

      let appointments = patient.calender;

      await Patient.findOneAndUpdate(
        { username: req.user.username },
        {
          calender: [
            ...appointments,
            { title, description, date: dateTime, id },
          ],
        }
      ).then((p) => {
        return res.json({ success: "appointment created" });
      });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const DeleteAppointment = async (req, res) => {
  await Patient.findOne({ username: req.user.username })
    .then(async (patient) => {
      if (!patient) return res.json({ error: "not registered as patient" });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const EditAppointment = async (req, res) => {
  // I`m lazy to implement this
};

const ViewInformation = async (req, res) => {
  // for all viewing categories : calendar, alleges, notes, prescriptions, medications
  const { category, value } = req.body;

  let patient = await Patient.findOne({ username: req.user.username });

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
  } else {
    return res.json({ error: "category not found" });
  }
};

module.exports = {
  AddDoctor,
  DeleteDoctor,
  CreateAppointment,
  DeleteAppointment,
  EditAppointment,
  ViewInformation,
};
