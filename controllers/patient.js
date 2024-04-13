const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const User = require("../models/user");
const Notification = require("../models/notification");
const Event = require("../models/event");
const Relation = require("../models/relation");
const Illness = require("../models/illness");
const Prescritpion = require("../models/prescription");

const AddDoctor = async (req, res, next) => {
  // add new doctor to doc_list
  const { doctor } = req.body; //user username instead of _id
  console.log("adding doctor : ", req.body, " for: ", req.user);
  await Doctor.findOne({ username: doctor })
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

          if (patient.doctors.includes(doctor) === false) {
            await Doctor.findOneAndUpdate(
              { username: doc.username },
              { requested: [...doc.requested, req.user.username] }
            ).then(async (relation) => {
              res.json({ success: "doctor added" });
              const notificationContent = `User  ${req.user.username} is requesting to be your patient`;
              notification = {
                type_: "relation",
                content: notificationContent,
                username: doctor,
                title: "New Patient",
                other: req.user.username,
              };
              createNotification(notification, req);
            });
          } else {
            return res.json({ error: "doctor already in list" });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.json({ error: err.message });
    });
};

const DeleteDoctor = async (req, res) => {
  // delete doctor
  const { doctor } = req.body;
  await Patient.findOne({ username: req.user.username })
    .then(async (patient) => {
      if (!patient) {
        return res.json({ error: "you account not registered as patient" });
      }

      await Patient.findOneAndUpdate(
        { username: req.user.username },
        {
          doctors: patient.doctors.filter((doc) => {
            if (doc !== doctor) {
              return doc;
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
  const { title, description, date, time, doctor } = req.body;

  let doctor_ = await Doctor.findOne({ username: doctor });

  await Event.findOne({ doctor, date, time }).then(async (event) => {
    if (event)
      return res.json({ error: "Doctor already booked for that time" });

    await Event.findOne({ patient: req.user.username, date, time }).then(
      async (event) => {
        if (event)
          return res.json({
            error: "You already have an appointment that time",
          });

        await Event.create({
          doctor,
          patient: req.user.username,
          title,
          date,
          time,
          approved: "0",
          rejected: "0",
          approver: doctor,
          status: "0",
        }).then(async (event) => {
          res.json({ sucess: "appointment requested" });

          const notificationContent = `User  ${req.user.username} is requesting an appintment with you on ${date} at ${time}`;

          let notification = {
            other: event._id,
            type_: "appintment created",
            content: notificationContent,
            username: doctor_.username,
            title: "Appointment",
          };
          createNotification(notification, req);
        });
      }
    );
  });
};

const DeleteAppointment = async (req, res) => {
  await Patient.findOne({ username: req.user.username })
    .then(async (patient) => {
      if (!patient) res.json({ error: "not registered as patient" });
    })
    .catch((err) => {
      return res.json({ error: err.message });
    });
};

const EditAppointment = async (req, res) => {
  // I`m too lazy to implement this
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
  } else if (category == "results") {
    return res.json({ results: patient.results });
  } else if (category === "medicine") {
    await Prescritpion.find({ patient: req.user.username }).then((presc) => {
      if (presc == null) return json({ error: "prescriptions not found" });
      res.json({ medicine: presc });
    });
  } else if (category === "notes") {
    return res.json({ notes: patient.notes });
  } else if (category === "doctors") {
    let docs = [];

    for (let index = 0; index < patient.doctors.length; index++) {
      const element = patient.doctors[index];
      doc_infor = await Doctor.findOne({ username: element }).then((infor) => {
        docs = [...docs, infor];
      });
    }

    people = docs.map((doc) => {
      return {
        name: doc.fullName,
        username: doc.username,
        contact: doc.contact,
        hospital: doc.hospital,
        work: doc.profession,
      };
    });

    console.log("People : ", people);
    return res.json({ doctors: people });
  } else if (category === "diagnosis") {
    let illness = [];

    for (let index = 0; index < patient.illnesses.length; index++) {
      const element = patient.doctors[index];
      await Illness.findOne({ _id: element }).then((infor) => {
        illness = [...illness, infor];
      });
    }

    diseases = illness.map((ill) => {
      return {
        name: ill.title,
        doctor: ill.doctor,
        date: ill.date,
        other: ill.other,
      };
    });
    return res.json({ diagnoses: diseases });
  } else if (category == "alleges") {
    return res.json({ alleges: patient.alleges });
  }
};

const approve = async (req, res) => {
  //approve appintment and relations
  const { category } = req.body;
  let patient = await Patient.findOne({ username: req.user.username });
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
    //TODO finish this
    const { doctor } = req.body;
    if (patient.requested.includes(doctor)) {
      await Patient.findOneAndUpdate(
        { username: patient.username },
        {
          requested: patient.requested.filter((doc) => {
            if (doc !== doctor) {
              return doc;
            }
          }),
          doctors: [patient.doctors, doctor],
        }
      );

      res.json({ success: "relation approved" });

      const notificationContent = `User  ${req.user.username} has 
                approved an relation with you`;

      let notification = {
        other: "none",
        type_: "relation approved",
        content: notificationContent,
        username: doctor,
        title: "Relation",
      };
      createNotification(notification, req);
    }
  }
};

async function createNotification(notification, req) {
  const { type_, username, title, content, other } = notification;
  await Notification.create({
    notificationType: type_,
    username,
    title,
    content,
    status: "0",
    other,
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
  AddDoctor,
  DeleteDoctor,
  CreateAppointment,
  DeleteAppointment,
  EditAppointment,
  ViewInformation,
  approve,
};
