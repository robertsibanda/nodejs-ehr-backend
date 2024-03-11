const Notification = require("../models/notification");
const User = require("../models/user");

const read = async (req, res) => {
  const { notification } = req.body;
  await Notification.findOneAndUpdate({ _id: notification }, { status: "1" })
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
          res.json({ success: "fone updating notification" });
        });
      });
    })
    .catch((err) => {
      res.json({ error: err.message });
    });
};

module.exports = {
  read,
};
