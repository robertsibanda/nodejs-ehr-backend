const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const User = require("../models/user");
const Notification = require("../models/notification");
const Event = require("../models/event");

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

          if (
            (patient.doctors.includes({
              username: doc.username,
              approved: "0",
            }) ===
              false) &
            (patient.doctors.includes({
              username: doc.username,
              approved: "1",
            }) ===
              false)
          ) {
            await Patient.findOneAndUpdate(
              { username: req.user.username },
              {
                doctors: [
                  ...patient.doctors,
                  { doctor: doc.username, approved: "0" },
                ],
              }
            ).then(async (p) => {
              await Doctor.findOneAndUpdate(
                { username: doc.username },
                {
                  patients: [
                    ...doc.patients,
                    { patient: req.user.username, approved: "0" },
                  ],
                }
              );
              res.json({ success: "doctor added" });
              const notificationContent = `User  ${req.user.username} is requesting to be your patient`;
              notification = {
                type_: "relation",
                content: notificationContent,
                username: doc.username,
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
};
