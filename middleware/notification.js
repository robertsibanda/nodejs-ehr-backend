// handle creating notifications for both doctor and patient
//handle deletion of notiications
const Notification = require("../models/notification");
const User = require("../models/user");

const createNotification = async (req, res, next) => {
  const { username, title, content } = req.notification;
  await Notification.create({
    username,
    title,
    content,
    status: "0",
  })
    .then(async (notif) => {
      await User.findOne({ username: user }).then(async (user) => {
        User.findOneAndUpdate(
          { username },
          { notifications: [...notifications, notif._id] }
        );
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
};

module.expors = {
  createNotification,
};
