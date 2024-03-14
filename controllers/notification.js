const Notification = require("../models/notification");
const User = require("../models/user");

const get = async (req, res) => {
  await Notification.find({ username: req.user.username, status: "0" }).then(
    (notif) => {
      res.json({ notifications: notif });
    }
  );
};

const read = async (req, res) => {
  const { notification } = req.body;
  await Notification.findOneAndUpdate(
    { _id: notification, status: "0" },
    { status: "1" }
  )
    .then(async (notif) => {
      await User.findOne({ username: req.user.username }).then(async (user) => {
        await User.findOneAndUpdate(
          { username: req.user.username },
          {
            notifications: user.notifications.filter((noti) => {
              if (noti !== notification) {
                return noti;
              }
            }),
          }
        ).then((u) => {
          res.json({ success: "done updating notification" });
        });
      });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

module.exports = {
  read,
  get,
};
