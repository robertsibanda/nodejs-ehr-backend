// handle creating notifications for both doctor and patient
//handle deletion of notiications
const Notification = require("../models/notification");
const User = require("../models/user");

async function createNotification(req, res) {
  const { type_, username, title, content } = req.notification;
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
          User.findOneAndUpdate(
            { username },
            { notifications: [...user.notifications, notif._id] }
          );
        })
        .then((notif) => {
          console.log("Notification created : ", req.notification);
        });
    })
    .catch((err) => {
      console.log(
        "Error in notifications:  ",
        req.notifications,
        " : ",
        err.message
      );
    });
}

module.expors = createNotification;
