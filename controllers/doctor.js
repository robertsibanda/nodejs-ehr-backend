// more complicated because of patient permissions

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const Note = require("../models/notes");
const Prescritpion = require("../models/prescription");
const Disease = require("../models/illness");
const illness = require("../models/illness");
const Notification = require("../models/notification");
const User = require("../models/user");

const AddPatient = async (req, res) => {
  // TODO create notification
  const { patient } = req.body;
  let patient_ = await Patient.findOne({ username: patient });

  await Patient.findOneAndUpdate(
    { username: patient },
    { requested: [...patient_.requested, req.user.username] }
  ).then((pat) => {
    res.json({ success: "request submitted" });
    const notificationContent = `User  ${req.user.username} has requqetsed to be your doctor`;

    let notification = {
      other: pat._id,
      type_: "relation",
      content: notificationContent,
      username: pat.username,
      title: "Relation Request",
    };
    createNotification(notification, req);
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

const approve = async (req, res) => {
  //approve appintment and relations
  const { category } = req.body;
  console.log("Aprroving : ", req.body);
  if (category === "appointment") {
    const { id } = req.body;

    let event = await Event.findOne({ _id: id });
    let doctor = await Doctor.findOne({ username: event.doctor });
    let patient = await Patient.findOne({ username: event.patient });

    if (event.approver === req.user.username) {
      await Event.findOneAndUpdate(
        { _id: id },
        { approved: true, rejected: false }
      ).then(async (event) => {
        await Doctor.findOneAndUpdate(
          { username: doctor.username },
          { calender: [...calender, id] }
        ).then(async (doc) => {
          await Patient.findOneAndUpdate(
            { username: patient.username },
            { calender: [...calender, id] }
          ).then(async (pat) => {
            res.json({ success: "appointment approved" });
            const notificationContent = `User  ${req.user.username} has approved an appintment with you on ${date} at ${time}`;

            let notification = {
              other: event._id,
              type_: "appintment approval",
              content: notificationContent,
              username: doctor.username,
              title: "Appointment",
            };
            createNotification(notification, req);
          });
        });
      });
    }
  } else if (category === "relation") {
    const { notification, other, approval } = req.body;
    let patient = await Patient.findOne({ username: other });
    let doctor = await Doctor.findOne({ username: req.user.username });
    await Notification.findOneAndUpdate(
      { _id: notification },
      { status: "1" }
    ).then(async (notif) => {
      if (approval === "1") {
        await Doctor.findOneAndUpdate(
          { username: req.user.username },
          {
            patients: [...doctor.patients, other],
            requested: doctor.requested.filter((r) => {
              if (r !== other) {
                return req;
              }
            }),
          }
        ).then(async (doc) => {
          await Patient.findOneAndUpdate(
            { username: other },
            {
              doctors: [...patient.doctors, doc.username],
              requested: patient.requested.filter((r) => {
                if (r !== doctor.username) {
                  return r;
                }
              }),
            }
          ).then((pat) => {
            res.json({ success: "relation approved" });

            const notificationContent = `User  ${req.user.username} has 
                approved an relation with you`;

            let notification = {
              other: "none",
              type_: "relation approved",
              content: notificationContent,
              username: other,
              title: "Relation",
            };
            createNotification(notification, req);
          });
        });
      } else {
        await Doctor.findOneAndUpdate(
          { doctor: req.user.username },
          {
            requested: doctor.requested.filter((req) => {
              if (req !== other) {
                return req;
              }
            }),
          }
        ).then(async (rel) => {
          res.json({ success: "rejected" });
          const notificationContent = `User  ${req.user.username} has rejected an relation with you`;

          let notification = {
            other: "none",
            type_: "relation rejected",
            content: notificationContent,
            username: other,
            title: "Relation",
          };
          createNotification(notification, req);
        });
      }
    });
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
  approve,
};
