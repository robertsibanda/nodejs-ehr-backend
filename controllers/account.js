const User = require("../models/user");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

const ChangePermissions = async (req, res) => {
  // change user account permission
};

const ChangeAuthInformation = async (req, res) => {
  // change username, password or email address
};

const ViewAuthInformation = async (req, res) => {};

const Update = async (req, res) => {
  console.log("Updating account : ", req.body, " from req.user ", req.user);
  const { update, updateValue } = req.body;

  if (update === "userType") {
    await User.findOneAndUpdate(
      { username: req.user.username },
      { userType: updateValue }
    ).then(async (user) => {
      if (updateValue === "doctor") {
        await Doctor.create({
          username: req.user.username,
          fullName: user.fullName,
        }).then((doc) => {
          res.json({ success: "account updated" });
        });
      } else if (updateValue === "patient") {
        const { permissions } = req.body;
        await Patient.create({
          username: req.user.username,
          fullName: user.fullName,
          permissions: permissions,
        }).then((pat) => {
          res.json({ success: "account updated" });
        });
      }
    });
  } else if (update === "doctor-proff") {
    //  update doctor profile
    const { profession, hospital } = req.body;
    await Doctor.findOneAndUpdate(
      { username: req.user.username },
      { profession, hospital }
    ).then((doc) => {
      res.json({ success: "account updated" });
    });
  } else if ((update = "proff")) {
    const { hospital, practice } = req.body;
    await Doctor.findOneAndUpdate(
      { username: req.user.username },
      { hospital, practice }
    ).then((pat) => {
      res.json({ success: "account created" });
    });
  }
};

const approve = async (req, res) => {
  //approve doctor, event
};

module.exports = {
  Update,
};
