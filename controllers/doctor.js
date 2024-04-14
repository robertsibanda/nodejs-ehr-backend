// more complicated because of patient permissions

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const Prescritpion = require("../models/prescription");
const illness = require("../models/illness");
const Notification = require("../models/notification");
const User = require("../models/user");
const patient = require("../models/patient");
const Appointment = require("../models/appointment");

const AddPatient = async (req, res) => {
  // TODO create notification
  const { patient } = req.body;
  let patient_ = await Patient.findOne({ username: patient });

  await Patient.findOneAndUpdate(
    { username: patient },
    { requested: [...patient_.requested, req.user.username] }
  ).then((pat) => {
    res.json({ success: "request submitted" });
    const notificationContent = `User  ${req.user.username} has requetsed to be your doctor`;

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
  const { medicine, note, person, qty } = req.body;
  await Prescritpion.create({
    patient: person,
    medicine,
    date: new Date(),
    note,
    qty,
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

const CreateNote = async (req, res) => {
  const { content, person } = req.body;

  console.log("Notes body : ", req.body);

  const patient = await Patient.findOne({ username: person });

  if (!patient || patient == null)
    return res.json({ Error: "patient not found" });

  const note = {
    doctor: req.user.username,
    content,
    date: new Date(),
  };
  await Patient.findOneAndUpdate(
    { username: person },
    { notes: [...patient.notes, note] }
  )
    .then((p) => {
      console.log("Note added : ", p);
      res.json({ success: "note added" });
    })
    .catch((err) => {
      console.log("Error (adding notes): " + err.messae);
      res.json({ error: err.message });
    });
};

const CreateDiagnosis = async (req, res) => {
  // TODO create notification
  const { person, title, note } = req.body;
  if (!person || !title || !note)
    return res.json({ error: "miising request data" });

  await illness
    .create({
      patient: person,
      doctor: req.user.username,
      note,
      //new Date()
      other,
    })
    .then((ill) => {
      res.json({ success: "Illness created" });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

const CreateAllege = async (req, res) => {
  const { person, allege, note, reaction } = req.body;
  if (!person || !allege || !note || !reaction)
    return res.json({ error: "missing information" });

  await Patient.findOne({ username: person })
    .then(async (patient) => {
      patient.alleges
        .forEach((all) => {
          if (all.allege == allege) {
            return res.json({ error: "allege already registred" });
          }
        })
        .then(async (re) => {
          await Patient.findOneAndUpdate(
            { username: patient.username },
            {
              alleges: [
                ...patient.alleges,
                {
                  allege,
                  note,
                  reaction,
                  date: new Date(),
                },
              ],
            }
          );
        });
    })
    .catch((err) => {
      console.log({ Error: err.message });
    });
};

const ViewInformation = async (req, res) => {
  // for all viewing categories : calendar, alleges, notes, prescriptions, medications
  const { category, person } = req.body;

  let patient = await Patient.findOne({ username: person });

  let doctor = await Doctor.findOne({ username: req.user.username });

  console.log("looking at : ", { category, person });

  if (!doctor) {
    return res.json({ error: "you account not registered as a doctor" });
  }

  if (category === "calendar") {
    let calender_information = patient.calender.filter((cal) => {
      if (cal.date > new Date()) {
        return cal;
      }
    });

    return res.json({ success: calender_information });
  } else if (category === "medicine") {
    await Prescritpion.find({ patient: person }).then((presc) => {
      if (presc == null) return json({ error: "prescriptions not found" });
      res.json({ medicine: presc });
    });
  } else if (category === "notes") {
    return res.json({ notes: patient.notes });
  } else if (category == "results") {
    return res.json({ results: patient.results });
  } else if (category === "doctors") {
    let docs = [];

    for (let index = 0; index < patient.doctors.length; index++) {
      const element = patient.doctors[index];
      await Doctor.findOne({ username: element }).then((infor) => {
        docs = [...docs, infor];
      });
    }

    people = docs.map((doc) => {
      console.log("Doc doc : ", doc);
      doc_request = patient.requested.includes(doc.username);
      pat_requested = doctor.requested.includes(patient.username);

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

    res.json({ doctors: people });
  } else if (category === "diagnosis") {
    return res.json({ diagnoses: patient.illnesses });
  } else if (category == "alleges") {
    return res.json({ alleges: patient.alleges });
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

const CreateResult = async (req, res) => {
  const { person, test, test_code, result, result_code } = req.body;
  await Patient.findOne({ username: person })
    .then(async (pat) => {
      if (patient == null) return res.json({ error: "patient not found" });
      await Patient.findOneAndUpdate(
        { username: pat.username },
        {
          results: [
            ...pat.results,
            {
              test,
              test_code,
              result,
              result_code,
              date: new Date(),
            },
          ],
        }
      ).then((pat_) => {
        res.json({ success: "result added succeffully" });
      });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
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

const CreateAppointment = async (req, res) => {
  const { person, year, month, day, hour, minute, description } = req.body;
  await Appointment.findOne({
    doctor: req.user.username,
    year,
    month,
    day,
    hour,
    minute,
  })
    .then(async (appointment) => {
      if (appointment !== null)
        return res.json({ error: "doctor already occupied at this time" });
      await Appointment.findOne({
        patient: person,
        year,
        month,
        day,
        hour,
        minute,
      }).then(async (app) => {
        if (app !== null)
          return res.json({ error: "patient already occupied at this time" });
        await Appointment.create({
          doctor: req.user.username,
          patient: person,
          year,
          day,
          description,
          month,
          hour,
          minute,
          status: "0",
        }).then((ap) => {
          res.json({ success: "appointment created succeffully" });
        });
      });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

module.exports = {
  CreatePrescription,
  DeletePatient,
  AddPatient,
  CreateDiagnosis,
  CreateAllege,
  CreateResult,
  ViewInformation,
  CreateNote,
  CreateAppointment,
  approve,
};
